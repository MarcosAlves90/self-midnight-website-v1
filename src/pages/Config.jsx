import { saveUserData } from '../firebaseUtils.js';
import { useState, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.js';
import { UserContext } from '../UserContext';
import { v4 as uuidv4 } from 'uuid';
import { decompressData } from '../assets/systems/SaveLoad.jsx';
import { StyledButton } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard, RetroWindow } from '../assets/components/RetroUI.jsx';
import Seo from '../assets/components/Seo.jsx';

export default function Config() {
    const [unlockedStates, setUnlockedStates] = useState({ Delete: false, CloudSave: false });
    const { userData, setUserData, user } = useContext(UserContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const ensureSheetCode = useCallback(() => userData.sheetCode || uuidv4(), [userData.sheetCode]);

    const handleFileLoad = useCallback((event) => {
        const { files } = event.target;
        if (!files.length) return;

        const sheetCode = ensureSheetCode();
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            try {
                let data = JSON.parse(target.result);
                if (!data) throw new Error('Missing data');
                data = decompressData(data);
                if (!data.sheetCode || user !== null) data.sheetCode = sheetCode;
                setUserData(data);
                if (user) saveUserData(data);
            } catch (error) {
                console.error('Error processing the file:', error);
            }
        };
        reader.onerror = (error) => console.error('Error reading the file:', error);
        reader.readAsText(files[0]);
        event.target.value = '';
    }, [ensureSheetCode, setUserData, user]);

    const verifyDeleteUnlock = useCallback(() => {
        if (!unlockedStates.Delete) {
            setUnlockedStates({ ...unlockedStates, Delete: true });
            return;
        }

        const sheetCode = ensureSheetCode();
        setUserData({ nivel: 0, sheetCode });
        saveUserData({ nivel: 0, sheetCode });
        setUnlockedStates({ ...unlockedStates, Delete: false });
    }, [ensureSheetCode, setUserData, unlockedStates]);

    const verifyCloudSaveUnlock = useCallback(() => {
        if (!unlockedStates.CloudSave) {
            setUnlockedStates({ ...unlockedStates, CloudSave: true });
            return;
        }
        saveUserData(userData);
        setUnlockedStates({ ...unlockedStates, CloudSave: false });
    }, [unlockedStates, userData]);

    const saveSheetFile = useCallback(() => {
        const blob = new Blob([JSON.stringify(userData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TMW - ${userData.nome || 'Ficha'}.json`;
        document.body.appendChild(link);
        try {
            link.click();
        } finally {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, [userData]);

    return (
        <RetroPage>
            <Seo
                title="Configurações"
                description="Importe, exporte e gerencie backups da sua ficha."
            />
            <RetroWindow title="Configurações">
                <RetroPanel title="Ficha ativa">
                    <div className="config-grid">
                        <RetroCard className="config-card">
                            <p className="config-card__label">Ficha atual</p>
                            <p className="config-card__value">{userData.nome || 'Indefinido'}</p>
                            <p className="config-card__meta">Codigo: {userData.sheetCode || 'Indefinido'}</p>
                        </RetroCard>
                        <RetroCard className="config-card">
                            <p className="config-card__label">Sessao</p>
                            <p className="config-card__value">{auth.currentUser ? 'Sincronizada' : 'Local'}</p>
                            <p className="config-card__meta">
                                {auth.currentUser ? 'Dados vinculados a conta.' : 'Dados salvos apenas neste dispositivo.'}
                            </p>
                        </RetroCard>
                    </div>
                </RetroPanel>

                <RetroPanel title="Gerenciamento">
                    <div className="config-panel">
                        <div className="config-actions">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileLoad}
                                className="config-file"
                            />
                            <div className="config-actions__group">
                                <StyledButton onClick={() => fileInputRef.current?.click()}>Importar ficha</StyledButton>
                                <StyledButton onClick={saveSheetFile}>Baixar ficha</StyledButton>
                                <StyledButton onClick={verifyCloudSaveUnlock}>
                                    {!unlockedStates.CloudSave ? 'Salvar na nuvem' : 'Confirmar envio'}
                                </StyledButton>
                                {auth.currentUser ? <StyledButton onClick={() => navigate('/fichas')}>Trocar ficha</StyledButton> : null}
                            </div>
                        </div>

                        <div className="config-danger">
                            <p className="config-danger__title">Zona critica</p>
                            <p className="config-danger__text">Remove dados locais da ficha atual. Esta acao nao pode ser desfeita.</p>
                            <StyledButton variant="danger" onClick={verifyDeleteUnlock}>
                                {!unlockedStates.Delete ? 'Limpar ficha' : 'Confirmar limpeza'}
                            </StyledButton>
                        </div>
                    </div>
                </RetroPanel>
            </RetroWindow>
        </RetroPage>
    );
}
