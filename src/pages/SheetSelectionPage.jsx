import {useState, useEffect, useContext} from 'react';
import {getUserData, saveUserSheets, saveUserData} from '../firebaseUtils.js';
import { auth } from '../firebase.js';
import {v4 as uuidv4} from 'uuid';
import {UserContext} from '../UserContext.jsx';
import {useNavigate} from 'react-router-dom';
import { decompressData } from '../assets/systems/SaveLoad.jsx';
import {StyledButton, StyledTextField} from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard } from '../assets/components/RetroUI.jsx';

export default function SheetSelectionPage() {
    const [sheets, setSheets] = useState([]);
    const [newSheetName, setNewSheetName] = useState('');
    const [loading, setLoading] = useState(true);
    const { userData, setUserData } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSheets = async () => {
            if (auth.currentUser) {
                let sheetsData = await getUserData('sheets') || [];
                if (sheetsData.length > 0) {
                    sheetsData = sheetsData.map((sheet) => {
                        if (sheet.sheetCode === userData.sheetCode) sheet.sheetCode = uuidv4();
                        if (sheet.nome === userData.nome) sheet.nome += ' [Erro]';
                        return sheet;
                    });
                    setSheets(sheetsData);
                    saveUserSheets(sheetsData);
                }
            }
            setLoading(false);
        };
        fetchSheets();
    }, [userData]);

    function addSheet() {
        if (!newSheetName.trim() || sheets.some((sheet) => sheet.nome === newSheetName)) {
            console.error('O nome da ficha esta vazio ou e igual ao nome de outra ficha.');
            return;
        }
        const newSheet = { sheetCode: uuidv4(), nome: newSheetName };
        const updatedSheets = [...sheets, newSheet];
        saveUserSheets(updatedSheets);
        setSheets(updatedSheets);
        setNewSheetName('');
    }

    function deleteSheet(sheetCode) {
        if (!window.confirm('Quer mesmo deletar essa ficha? Esse processo e irreversivel.')) return;
        const updatedSheets = sheets.filter((sheet) => sheet.sheetCode !== sheetCode);
        saveUserSheets(updatedSheets);
        setSheets(updatedSheets);
    }

    function switchSheet(sheetCode) {
        let selectedSheet = sheets.find((sheet) => sheet.sheetCode === sheetCode);
        if (!selectedSheet) return;

        let updatedSheets = sheets.filter((sheet) => sheet.sheetCode !== sheetCode);
        updatedSheets = [...updatedSheets, userData];
        saveUserSheets(updatedSheets);

        selectedSheet = decompressData(selectedSheet);
        saveUserData(selectedSheet);
        setUserData(selectedSheet);
        navigate('/individual');
    }

    return (
        <RetroPage title="Gestor de Fichas" subtitle="Selecione, crie ou remova perfis de personagem">
            <RetroPanel title="Selecao de fichas">
                {loading ? (
                    <p>Carregando fichas...</p>
                ) : (
                    <>
                        <div>
                            <StyledButton onClick={() => navigate('/configuracoes')}>Voltar</StyledButton>
                            <StyledTextField type="text" fullWidth value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} placeholder="nome da nova ficha..." />
                            <StyledButton onClick={addSheet}>Adicionar ficha</StyledButton>
                        </div>

                        <div>
                            <RetroCard>
                                <p>Atual: {userData.nome || userData.sheetCode}</p>
                            </RetroCard>
                            {sheets.map((sheet) => (
                                <RetroCard key={sheet.sheetCode}>
                                    <div>
                                        <button type="button" onClick={() => switchSheet(sheet.sheetCode)}>
                                            {sheet.nome || sheet.sheetCode}
                                        </button>
                                        <StyledButton variant="danger" onClick={() => deleteSheet(sheet.sheetCode)}>Excluir</StyledButton>
                                    </div>
                                </RetroCard>
                            ))}
                        </div>
                    </>
                )}
            </RetroPanel>
        </RetroPage>
    );
}



