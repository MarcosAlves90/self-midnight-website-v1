import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
    createUserSheet,
    deleteUserSheet,
    duplicateUserSheet,
    getSheetWorkspace,
    switchUserSheet,
} from '../firebaseUtils.js';
import { auth } from '../firebase.js';
import { UserContext } from '../UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard, RetroWindow, RetroBadge } from '../assets/components/RetroUI.jsx';
import Seo from '../assets/components/Seo.jsx';

export default function SheetSelectionPage() {
    const [sheets, setSheets] = useState([]);
    const [newSheetName, setNewSheetName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isWorking, setIsWorking] = useState(false);
    const { userData, setUserData } = useContext(UserContext);
    const navigate = useNavigate();

    const formatUpdatedAt = useCallback((timestamp) => {
        if (!timestamp) return 'Sem data';
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const loadSheets = useCallback(async () => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const workspace = await getSheetWorkspace();
        setSheets(workspace?.inactiveSheets || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadSheets();
    }, [loadSheets]);

    const addSheet = useCallback(async () => {
        const trimmedName = newSheetName.trim();
        if (!trimmedName || sheets.some((sheet) => sheet.nome === trimmedName) || userData.nome === trimmedName) {
            console.error('O nome da ficha esta vazio ou e igual ao nome de outra ficha.');
            return;
        }

        setIsWorking(true);
        await createUserSheet(trimmedName);
        setNewSheetName('');
        await loadSheets();
        setIsWorking(false);
    }, [newSheetName, sheets, userData.nome, loadSheets]);

    const duplicateSheet = useCallback(async (sheetCode) => {
        setIsWorking(true);
        await duplicateUserSheet(sheetCode);
        await loadSheets();
        setIsWorking(false);
    }, [loadSheets]);

    const deleteSheet = useCallback(async (sheetCode) => {
        if (!window.confirm('Quer mesmo deletar essa ficha? Esse processo e irreversivel.')) return;
        setIsWorking(true);
        await deleteUserSheet(sheetCode);
        await loadSheets();
        setIsWorking(false);
    }, [loadSheets]);

    const switchSheet = useCallback(async (sheetCode) => {
        setIsWorking(true);
        const selectedSheet = await switchUserSheet(sheetCode, userData);
        if (!selectedSheet) {
            setIsWorking(false);
            return;
        }
        setUserData(selectedSheet);
        navigate('/individual');
    }, [navigate, setUserData, userData]);

    const sheetCount = sheets.length;
    const currentLabel = userData.nome || userData.sheetCode || 'Ficha atual';

    const sortedSheets = useMemo(() => {
        return [...sheets].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    }, [sheets]);

    return (
        <RetroPage title="Gestor de Fichas" subtitle="Selecione, crie ou remova perfis de personagem">
            <Seo
                title="Fichas"
                description="Selecione, crie e organize fichas de personagem salvas na nuvem."
                noIndex
            />
            <RetroWindow title="Gestão de Perfis // Fichas" status="Repositório ativo :: Sincronização habilitada">
                <RetroPanel title="Seleção de fichas">
                    {loading ? (
                        <p>Carregando fichas...</p>
                    ) : (
                        <>
                            <div className="sheet-panel">
                                <div className="sheet-header">
                                    <div className="sheet-actions">
                                        <StyledButton onClick={() => navigate('/configuracoes')}>Voltar</StyledButton>
                                        <StyledTextField
                                            type="text"
                                            label="Nova ficha"
                                            fullWidth
                                            value={newSheetName}
                                            onChange={(e) => setNewSheetName(e.target.value)}
                                            placeholder="Nome da nova ficha..."
                                        />
                                        <StyledButton onClick={addSheet} disabled={isWorking}>Adicionar ficha</StyledButton>
                                    </div>
                                    <div className="sheet-meta">
                                        <RetroBadge>{`${sheetCount} fichas`}</RetroBadge>
                                        <RetroCard className="sheet-current">
                                            <p className="sheet-current__label">Atual</p>
                                            <p className="sheet-current__value">{currentLabel}</p>
                                        </RetroCard>
                                    </div>
                                </div>

                                <div className="sheet-grid">
                                    {sortedSheets.length === 0 ? (
                                        <div className="sheet-empty">
                                            <p>Nenhuma ficha encontrada. Crie uma nova para continuar.</p>
                                        </div>
                                    ) : (
                                        sortedSheets.map((sheet) => (
                                            <RetroCard key={sheet.sheetCode} className="sheet-card">
                                                <div className="sheet-card__content">
                                                    <p className="sheet-card__title">{sheet.nome || sheet.sheetCode}</p>
                                                    <p className="sheet-card__meta">{sheet.sheetCode}</p>
                                                    <p className="sheet-card__meta">Atualizado: {formatUpdatedAt(sheet.updatedAt)}</p>
                                                </div>
                                                <div className="sheet-card__actions">
                                                    <StyledButton onClick={() => switchSheet(sheet.sheetCode)} disabled={isWorking}>Selecionar</StyledButton>
                                                    <StyledButton onClick={() => duplicateSheet(sheet.sheetCode)} disabled={isWorking}>Duplicar</StyledButton>
                                                    <StyledButton variant="danger" onClick={() => deleteSheet(sheet.sheetCode)} disabled={isWorking}>Excluir</StyledButton>
                                                </div>
                                            </RetroCard>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </RetroPanel>
            </RetroWindow>
        </RetroPage>
    );
}



