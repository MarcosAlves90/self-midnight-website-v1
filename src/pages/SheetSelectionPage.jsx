import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getUserData, saveUserSheets, saveUserData } from '../firebaseUtils.js';
import { auth } from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from '../UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { decompressData } from '../assets/systems/SaveLoad.jsx';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard, RetroWindow, RetroBadge } from '../assets/components/RetroUI.jsx';

export default function SheetSelectionPage() {
    const [sheets, setSheets] = useState([]);
    const [newSheetName, setNewSheetName] = useState('');
    const [loading, setLoading] = useState(true);
    const { userData, setUserData } = useContext(UserContext);
    const navigate = useNavigate();

    const normalizeSheets = useCallback((sheetsData) => {
        if (!sheetsData.length) return sheetsData;
        const updated = sheetsData.map((sheet) => {
            const isConflictingCode = sheet.sheetCode === userData.sheetCode;
            const isConflictingName = sheet.nome === userData.nome;
            return {
                ...sheet,
                sheetCode: isConflictingCode ? uuidv4() : sheet.sheetCode,
                nome: isConflictingName ? `${sheet.nome} [Erro]` : sheet.nome,
            };
        });
        return updated;
    }, [userData.sheetCode, userData.nome]);

    const fetchSheets = useCallback(async () => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const sheetsData = (await getUserData('sheets')) || [];
        const normalized = normalizeSheets(sheetsData);
        if (normalized.length > 0) {
            setSheets(normalized);
            saveUserSheets(normalized);
        }
        setLoading(false);
    }, [normalizeSheets]);

    useEffect(() => {
        fetchSheets();
    }, [fetchSheets]);

    const addSheet = useCallback(() => {
        const trimmedName = newSheetName.trim();
        if (!trimmedName || sheets.some((sheet) => sheet.nome === trimmedName)) {
            console.error('O nome da ficha esta vazio ou e igual ao nome de outra ficha.');
            return;
        }
        const newSheet = { sheetCode: uuidv4(), nome: trimmedName };
        const updatedSheets = [...sheets, newSheet];
        saveUserSheets(updatedSheets);
        setSheets(updatedSheets);
        setNewSheetName('');
    }, [newSheetName, sheets]);

    const deleteSheet = useCallback((sheetCode) => {
        if (!window.confirm('Quer mesmo deletar essa ficha? Esse processo e irreversivel.')) return;
        const updatedSheets = sheets.filter((sheet) => sheet.sheetCode !== sheetCode);
        saveUserSheets(updatedSheets);
        setSheets(updatedSheets);
    }, [sheets]);

    const switchSheet = useCallback((sheetCode) => {
        let selectedSheet = sheets.find((sheet) => sheet.sheetCode === sheetCode);
        if (!selectedSheet) return;

        let updatedSheets = sheets.filter((sheet) => sheet.sheetCode !== sheetCode);
        updatedSheets = [...updatedSheets, userData];
        saveUserSheets(updatedSheets);

        selectedSheet = decompressData(selectedSheet);
        saveUserData(selectedSheet);
        setUserData(selectedSheet);
        navigate('/individual');
    }, [navigate, setUserData, sheets, userData]);

    const sheetCount = sheets.length;
    const currentLabel = userData.nome || userData.sheetCode || 'Ficha atual';

    const sortedSheets = useMemo(() => {
        return [...sheets].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    }, [sheets]);

    return (
        <RetroPage title="Gestor de Fichas" subtitle="Selecione, crie ou remova perfis de personagem">
            <RetroWindow title="Gestao de Perfis // Fichas" status="Repositorio ativo :: Sincronizacao habilitada">
                <RetroPanel title="Selecao de fichas">
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
                                        <StyledButton onClick={addSheet}>Adicionar ficha</StyledButton>
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
                                                </div>
                                                <div className="sheet-card__actions">
                                                    <StyledButton onClick={() => switchSheet(sheet.sheetCode)}>Selecionar</StyledButton>
                                                    <StyledButton variant="danger" onClick={() => deleteSheet(sheet.sheetCode)}>Excluir</StyledButton>
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



