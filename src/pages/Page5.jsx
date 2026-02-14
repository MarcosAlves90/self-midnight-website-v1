import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import ReactModal from 'react-modal';
import { RetroPage, RetroPanel, RetroCard, RetroModalHeader, RetroWindow } from '../assets/components/RetroUI.jsx';
import { useDebouncedCloudSave } from '../assets/systems/useDebouncedCloudSave.js';
import Seo from '../assets/components/Seo.jsx';

ReactModal.setAppElement('#root');

export default function Page5() {
    const [createTitle, setCreateTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [localItem, setLocalItem] = useState(null);
    const inputRef = useRef(null);
    const { userData, setUserData, user } = useContext(UserContext);
    useDebouncedCloudSave(userData, Boolean(user), saveUserData);

    useEffect(() => {
        if (modalIsOpen && inputRef.current) inputRef.current.focus();
    }, [modalIsOpen]);

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
            const updatedItems = (prevUserData.annotationsArray || []).map((item) => item.id === selectedItem?.id ? { ...item, [name]: value } : item);
            return { ...prevUserData, annotationsArray: updatedItems };
        });
    }, [selectedItem, setUserData]);

    const placeHolderImage = useMemo(() => 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9vayUyMHBhZ2VzfGVufDB8fDB8fHww', []);
    const annotationCount = userData.annotationsArray ? userData.annotationsArray.length : 0;

    return (
        <>
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="retro-modal"
                overlayClassName="retro-modal__overlay"
            >
                {localItem ? (
                    <div className="annotation-modal">
                        <RetroModalHeader title="Editor de anotacao" onClose={closeModal} />
                        <div className="retro-modal__content">
                        <label className="styled-field">
                            <span>Titulo</span>
                            <div className="styled-field__control">
                                <input
                                    ref={inputRef}
                                    value={localItem.title || ''}
                                    name="title"
                                    onChange={handleInputChange}
                                    placeholder="Titulo da sua anotacao"
                                />
                            </div>
                        </label>
                        <StyledTextField
                            multiline
                            minRows={8}
                            label="Conteudo"
                            value={localItem.content || ''}
                            name="content"
                            onChange={handleInputChange}
                            placeholder="Escreva seus registros, pistas ou ideias."
                            fullWidth
                        />
                        <div className="modal-actions">
                            <StyledButton variant="danger" onClick={handleDelete}>Deletar</StyledButton>
                            <StyledButton onClick={handleCopy}>Copiar</StyledButton>
                        </div>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage>
                <Seo
                    title="Anotações"
                    description="Registre pistas, ideias e historias em um painel de anotações organizado."
                />
                <RetroWindow title="Anotações">
                    <RetroPanel title="Anotações">
                        <div className="library-panel">
                            <div className="library-header">
                                <StyledTextField
                                    type="text"
                                    label="Nova anotação"
                                    placeholder="Titulo da anotação..."
                                    value={createTitle}
                                    onChange={(event) => setCreateTitle(event.target.value)}
                                    fullWidth
                                />
                                <div className="library-actions">
                                    <StyledButton onClick={handleCreateAnnotation}>Criar Anotação</StyledButton>
                                </div>
                            </div>

                            <div className="library-filters">
                                <StyledTextField
                                    type="text"
                                    label="Pesquisar"
                                    placeholder="Buscar por titulo ou conteúdo..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    fullWidth
                                />
                                <div className="library-tags">
                                    <span className="library-count">{annotationCount} anotações</span>
                                </div>
                            </div>
                        </div>

                        <article className="library-grid">
                            {(filteredAnnotations || []).map((annotation) => (
                                <RetroCard key={annotation.id} onClick={() => openModal(annotation)} className="library-card">
                                    <div className="library-card__media">
                                        <img src={placeHolderImage} alt="Anotação" />
                                    </div>
                                    <div className="library-card__content">
                                        <p className="library-card__title">{annotation.title || 'Sem titulo'}</p>
                                        <p className="library-card__meta">{(annotation.content || '').slice(0, 90) || 'Sem conteúdo'}</p>
                                    </div>
                                </RetroCard>
                            ))}
                        </article>
                    </RetroPanel>
                </RetroWindow>
            </RetroPage>
        </>
    );
}
