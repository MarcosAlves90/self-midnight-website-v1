import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getUserData, saveUserSheets, saveUserData } from '../firebaseUtils.js';
import { auth } from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from '../UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { decompressData } from '../assets/systems/SaveLoad.jsx';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard, RetroWindow, RetroBadge } from '../assets/components/RetroUI.jsx';
import Seo from '../assets/components/Seo.jsx';

export default function SheetSelectionPage() {
    const [sheets, setSheets] = useState([]);
    const [newSheetName, setNewSheetName] = useState('');
    const [loading, setLoading] = useState(true);
    const { userData, setUserData } = useContext(UserContext);
    const navigate = useNavigate();
    const buildSheetSnapshot = useCallback((data) => ({
        ...data,
        sheetCode: data.sheetCode || uuidv4(),
        nome: data.nome || 'Ficha sem nome',
        updatedAt: Date.now(),
    }), []);

    const buildEmptySheet = useCallback((name) => ({
        sheetCode: uuidv4(),
        nome: name,
        nivel: 0,
        updatedAt: Date.now(),
    }), []);

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

    const resolveDuplicateNames = (list) => {
        const counts = new Map();
        return list.map((sheet) => {
            const baseName = sheet.nome || 'Ficha sem nome';
            const current = counts.get(baseName) || 0;
            counts.set(baseName, current + 1);
            if (current === 0) return { ...sheet, nome: baseName };
            return { ...sheet, nome: `${baseName} (${current + 1})` };
        });
    };

    const normalizeSheets = useCallback((sheetsData) => {
        if (!Array.isArray(sheetsData) || sheetsData.length === 0) return [];
        const filtered = sheetsData
            .filter(Boolean)
            .filter((sheet) => sheet.sheetCode && sheet.sheetCode !== userData.sheetCode);

        const byCode = new Map();
        filtered.forEach((sheet) => {
            const code = sheet.sheetCode || uuidv4();
            const prev = byCode.get(code);
            if (!prev || (sheet.updatedAt || 0) >= (prev.updatedAt || 0)) {
                byCode.set(code, { ...sheet, sheetCode: code });
            }
        });

        return resolveDuplicateNames(Array.from(byCode.values()));
    }, [userData.sheetCode]);

    const persistSheets = useCallback((nextSheets) => {
        setSheets(nextSheets);
        saveUserSheets(nextSheets);
    }, []);

    const fetchSheets = useCallback(async () => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const sheetsData = (await getUserData('sheets')) || [];
        const normalized = normalizeSheets(sheetsData);
        setSheets(normalized);
        if (normalized.length !== sheetsData.length) saveUserSheets(normalized);
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
        const newSheet = buildEmptySheet(trimmedName);
        const updatedSheets = [...sheets, newSheet];
        persistSheets(updatedSheets);
        setNewSheetName('');
    }, [newSheetName, sheets, buildEmptySheet, persistSheets]);

    const duplicateSheet = useCallback((sheetCode) => {
        const sheet = sheets.find((item) => item.sheetCode === sheetCode);
        if (!sheet) return;
        const baseName = sheet.nome || 'Ficha sem nome';
        const newSheet = {
            ...sheet,
            sheetCode: uuidv4(),
            nome: `${baseName} (copia)`,
            updatedAt: Date.now(),
        };
        const updatedSheets = [...sheets, newSheet];
        persistSheets(updatedSheets);
    }, [sheets, persistSheets]);

    const deleteSheet = useCallback((sheetCode) => {
        if (!window.confirm('Quer mesmo deletar essa ficha? Esse processo e irreversivel.')) return;
        const updatedSheets = sheets.filter((sheet) => sheet.sheetCode !== sheetCode);
        persistSheets(updatedSheets);
    }, [sheets, persistSheets]);

    const switchSheet = useCallback((sheetCode) => {
        const selectedSheet = sheets.find((sheet) => sheet.sheetCode === sheetCode);
        if (!selectedSheet) return;

        const snapshot = buildSheetSnapshot(userData);
        const updatedSheets = [...sheets.filter((sheet) => sheet.sheetCode !== sheetCode), snapshot];
        persistSheets(updatedSheets);

        const hydrated = decompressData(selectedSheet);
        saveUserData(hydrated);
        setUserData(hydrated);
        navigate('/individual');
    }, [buildSheetSnapshot, navigate, persistSheets, setUserData, sheets, userData]);

    useEffect(() => {
        if (!auth.currentUser) return;
        return () => {
            const snapshot = buildSheetSnapshot(userData);
            const updatedSheets = normalizeSheets([...sheets, snapshot]);
            persistSheets(updatedSheets);
        };
    }, [buildSheetSnapshot, normalizeSheets, persistSheets, sheets, userData]);

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
                                                    <p className="sheet-card__meta">Atualizado: {formatUpdatedAt(sheet.updatedAt)}</p>
                                                </div>
                                                <div className="sheet-card__actions">
                                                    <StyledButton onClick={() => switchSheet(sheet.sheetCode)}>Selecionar</StyledButton>
                                                    <StyledButton onClick={() => duplicateSheet(sheet.sheetCode)}>Duplicar</StyledButton>
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



