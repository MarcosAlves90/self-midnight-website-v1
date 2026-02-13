import {saveUserData} from '../firebaseUtils.js';
import {useState, useEffect, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth} from '../firebase.js';
import {UserContext} from '../UserContext';
import {v4 as uuidv4} from 'uuid';
import {decompressData} from '../assets/systems/SaveLoad.jsx';
import {StyledButton} from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel } from '../assets/components/RetroUI.jsx';

export default function Config() {
    const [unlockedStates, setUnlockedStates] = useState({Delete: false, CloudSave: false});
    const {userData, setUserData, user} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleFileLoad = (event) => {
            const {files} = event.target;
            if (!files.length) return;
            const sheetCode = userData.sheetCode || uuidv4();

            const reader = new FileReader();
            reader.onload = ({target}) => {
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
        };

        const inputElement = document.getElementById('formFile');
        inputElement.addEventListener('change', handleFileLoad);
        return () => {
            inputElement.removeEventListener('change', handleFileLoad);
        };
    }, [setUserData, user, userData.sheetCode]);

    function verifyDeleteUnlock() {
        if (!unlockedStates.Delete) {
            setUnlockedStates({...unlockedStates, Delete: true});
            return;
        }

        const sheetCode = userData.sheetCode || uuidv4();
        setUserData({nivel: 0, sheetCode});
        saveUserData({nivel: 0, sheetCode});
        setUnlockedStates({...unlockedStates, Delete: false});
    }

    function verifyCloudSaveUnlock() {
        if (!unlockedStates.CloudSave) {
            setUnlockedStates({...unlockedStates, CloudSave: true});
            return;
        }
        saveUserData(userData);
        setUnlockedStates({...unlockedStates, CloudSave: false});
    }

    const saveSheetFile = () => {
        const blob = new Blob([JSON.stringify(userData)], {type: 'application/json'});
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
    };

    return (
        <RetroPage title="Centro de Configuracoes" subtitle="Importacao, backup e administracao de ficha">
            <RetroPanel title="Configuracoes">
                <div>
                    <p>Ficha atual: {userData.nome || 'Indefinido'}</p>
                    <p>Codigo: {userData.sheetCode || 'Indefinido'}</p>
                    <input type="file" id="formFile" />
                    <StyledButton onClick={() => document.getElementById('formFile').click()}>Importar</StyledButton>
                    <StyledButton onClick={saveSheetFile}>Baixar</StyledButton>
                    <StyledButton onClick={verifyCloudSaveUnlock}>{!unlockedStates.CloudSave ? 'Salvar na nuvem' : 'Tem certeza?'}</StyledButton>
                    <StyledButton variant="danger" onClick={verifyDeleteUnlock}>{!unlockedStates.Delete ? 'Limpar' : 'Tem certeza?'}</StyledButton>
                    {auth.currentUser ? <StyledButton onClick={() => navigate('/fichas')}>Trocar ficha</StyledButton> : null}
                </div>
            </RetroPanel>
        </RetroPage>
    );
}



