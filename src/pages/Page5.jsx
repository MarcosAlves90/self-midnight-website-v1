import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import ReactModal from 'react-modal';
import { retroModalStyle } from '../assets/styles/retroTheme.js';
import { RetroPage, RetroPanel, RetroCard, RetroModalHeader } from '../assets/components/RetroUI.jsx';

ReactModal.setAppElement('#root');

export default function Page5() {
    const [createTitle, setCreateTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [localItem, setLocalItem] = useState(null);
    const inputRef = useRef(null);
    const { userData, setUserData, user } = useContext(UserContext);
    const debounceTimeout = useRef(null);

    const saveDataDebounced = useCallback((data) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            if (user) saveUserData(data);
        }, 500);
    }, [user]);

    useEffect(() => {
        saveDataDebounced(userData);
    }, [userData, saveDataDebounced]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedItem(null);
    }, []);

    const openModal = useCallback((annotation) => {
        setSelectedItem(annotation);
        setLocalItem(annotation);
        setIsOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (!selectedItem) return;
        setUserData((prevUserData) => ({
            ...prevUserData,
            annotationsArray: prevUserData.annotationsArray.filter((annotation) => annotation.id !== selectedItem.id),
        }));
        closeModal();
    }, [setUserData, closeModal, selectedItem]);

    const handleCopy = useCallback(async () => {
        if (localItem) await navigator.clipboard.writeText(localItem.content);
    }, [localItem]);

    const filteredAnnotations = useMemo(() => (userData.annotationsArray || []).filter((annotation) => {
        const matchesSearchTerm = searchTerm === '' || Object.values(annotation).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearchTerm;
    }), [userData.annotationsArray, searchTerm]);

    const handleCreateAnnotation = useCallback(() => {
        const trimmedTitle = createTitle.trim();
        if (!trimmedTitle) return;

        const newAnnotation = { title: trimmedTitle, content: '', id: uuidv4() };
        setUserData((prevUserData) => ({
            ...prevUserData,
            annotationsArray: [...(prevUserData.annotationsArray || []), newAnnotation],
        }));
        setCreateTitle('');
    }, [createTitle, setUserData]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setLocalItem((prevItem) => ({ ...prevItem, [name]: value }));

        setUserData((prevUserData) => {
            const updatedItems = prevUserData.annotationsArray.map((item) => item.id === localItem.id ? { ...localItem, [name]: value } : item);
            return { ...prevUserData, annotationsArray: updatedItems };
        });
    }, [localItem, setUserData]);

    const placeHolderImage = useMemo(() => 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9vayUyMHBhZ2VzfGVufDB8fDB8fHww', []);

    return (
        <>
            <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal}>
                {localItem ? (
                    <div>
                        <RetroModalHeader title="Editor de anotacao" onClose={closeModal} />
                        <input ref={inputRef} value={localItem.title} name="title" onChange={handleInputChange} placeholder="Titulo da sua anotacao." />
                        <textarea value={localItem.content} name="content" onChange={handleInputChange} placeholder="Conteudo da anotacao" />
                        <div>
                            <StyledButton variant="danger" onClick={handleDelete}>Deletar</StyledButton>
                            <StyledButton onClick={handleCopy}>Copiar</StyledButton>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage title="Caderno de Anotacoes" subtitle="Registros taticos e memoria de campanha">
                <RetroPanel title="Anotacoes">
                    <div>
                        <StyledTextField type="text" fullWidth value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} placeholder="titulo da anotacao..." />
                        <StyledButton onClick={handleCreateAnnotation}>Criar Anotacao</StyledButton>
                        <StyledTextField type="text" placeholder="pesquisar anotacoes..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} fullWidth />
                    </div>

                    <article>
                        {(filteredAnnotations || []).map((annotation) => (
                            <RetroCard key={annotation.id} onClick={() => openModal(annotation)}>
                                <img src={placeHolderImage} alt="Anotacao" />
                                <p>{annotation.title.toUpperCase()}</p>
                            </RetroCard>
                        ))}
                    </article>
                </RetroPanel>
            </RetroPage>
        </>
    );
}



