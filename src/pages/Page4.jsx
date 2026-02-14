import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import ReactModal from 'react-modal';
import { RetroPage, RetroPanel, RetroCard, RetroBadge, RetroModalHeader, RetroWindow } from '../assets/components/RetroUI.jsx';
import { useDebouncedCloudSave } from '../assets/systems/useDebouncedCloudSave.js';
import Seo from '../assets/components/Seo.jsx';

ReactModal.setAppElement('#root');

export default function Page4() {
    const [createSkill, setCreateSkill] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDomains, setActiveDomains] = useState([]);
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

    const openModal = useCallback((skill) => {
        setSelectedItem(skill);
        setLocalItem(skill);
        setIsOpen(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (!selectedItem) return;
        setUserData((prevUserData) => ({
            ...prevUserData,
            skillsArray: prevUserData.skillsArray.filter((skill) => skill.id !== selectedItem.id),
        }));
        closeModal();
    }, [setUserData, closeModal, selectedItem]);

    const handleCopy = useCallback(async () => {
        if (selectedItem) await navigator.clipboard.writeText(JSON.stringify(selectedItem));
    }, [selectedItem]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            const skill = JSON.parse(text);
            const newSkill = { ...skill, id: uuidv4() };
            setUserData((prevUserData) => ({
                ...prevUserData,
                skillsArray: [...(prevUserData.skillsArray || []), newSkill],
            }));
        } catch (err) {
            console.error('Falha ao colar a skill: ', err);
        }
    }, [setUserData]);

    const uniqueDomains = useMemo(() => {
        const domains = (userData.skillsArray || [])
            .filter((skill) => skill.domain && skill.domain.trim() !== '')
            .flatMap((skill) => skill.domain.split(',').map((domain) => domain.trim()).filter((domain) => domain !== ''));
        return Array.from(new Set(domains));
    }, [userData.skillsArray]);

    const filteredSkills = useMemo(() => (userData.skillsArray || []).filter((skill) => {
        const matchesSearchTerm = searchTerm === '' || Object.values(skill).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()));
        const skillDomains = skill.domain.split(',').map((domain) => domain.trim()).filter((domain) => domain !== '');
        const matchesDomain = activeDomains.length === 0 || activeDomains.some((domain) => skillDomains.includes(domain));
        return matchesSearchTerm && matchesDomain;
    }), [userData.skillsArray, searchTerm, activeDomains]);

    const handleCreateSkill = useCallback(() => {
        const trimmedSkill = createSkill.trim();
        if (!trimmedSkill) return;

        const newSkill = {
            title: trimmedSkill,
            domain: '',
            content: '',
            circle: 1,
            type: 1,
            execution: 1,
            range: 1,
            target: '',
            duration: '',
            resistance: '',
            area: '',
            spent: '',
            id: uuidv4(),
        };

        setUserData((prevUserData) => ({
            ...prevUserData,
            skillsArray: [...(prevUserData.skillsArray || []), newSkill],
        }));
        setCreateSkill('');
    }, [createSkill, setUserData]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setLocalItem((prevItem) => ({ ...prevItem, [name]: value }));

        setUserData((prevUserData) => {
            const updatedItems = (prevUserData.skillsArray || []).map((item) => item.id === selectedItem?.id ? { ...item, [name]: value } : item);
            return { ...prevUserData, skillsArray: updatedItems };
        });
    }, [selectedItem, setUserData]);

    const placeHolderImage = useMemo(() => 'https://pt.quizur.com/_image?href=https%3A%2F%2Fimg.quizur.com%2Ff%2Fimg5c40afdab16e93.66721106.png%3FlastEdited%3D1547743200&w=400&h=400&f=webp', []);
    const skillCount = userData.skillsArray ? userData.skillsArray.length : 0;

    return (
        <>
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="retro-modal"
                overlayClassName="retro-modal__overlay"
            >
                {localItem ? (
                    <div className="skill-modal">
                        <RetroModalHeader title="Editor de skill" onClose={closeModal} />
                        <div className="skill-modal__media">
                            <img src={localItem.image || placeHolderImage} alt="Skill" />
                            <div className="skill-modal__title">
                                <label className="styled-field">
                                    <span>Titulo</span>
                                    <div className="styled-field__control">
                                        <input ref={inputRef} value={localItem.title || ''} name="title" onChange={handleInputChange} placeholder="Titulo da skill" />
                                    </div>
                                </label>
                                <StyledTextField
                                    value={localItem.domain || ''}
                                    name="domain"
                                    onChange={handleInputChange}
                                    label="Domínios"
                                    helperText="Separe por virgula para facilitar os filtros."
                                />
                            </div>
                        </div>

                        <div className="skill-modal__grid">
                            <StyledTextField value={localItem.circle || ''} onChange={handleInputChange} name="circle" label="Circulo" />
                            <StyledTextField value={localItem.type || ''} onChange={handleInputChange} name="type" label="Categoria" />
                            <StyledTextField value={localItem.spent || ''} onChange={handleInputChange} name="spent" label="Gasto" />
                            <StyledTextField value={localItem.execution || ''} onChange={handleInputChange} name="execution" label="Execucao" />
                            <StyledTextField value={localItem.range || ''} onChange={handleInputChange} name="range" label="Alcance" />
                            <StyledTextField value={localItem.area || ''} onChange={handleInputChange} name="area" label="Area" />
                            <StyledTextField value={localItem.target || ''} onChange={handleInputChange} name="target" label="Alvo" />
                            <StyledTextField value={localItem.duration || ''} onChange={handleInputChange} name="duration" label="Duracao" />
                            <StyledTextField value={localItem.resistance || ''} onChange={handleInputChange} name="resistance" label="Resistencia" />
                        </div>

                        <StyledTextField
                            multiline
                            minRows={6}
                            value={localItem.content || ''}
                            name="content"
                            onChange={handleInputChange}
                            label="Descrição"
                            placeholder="Descreva efeitos, custo e exemplos de uso."
                        />
                        <StyledTextField value={localItem.image || ''} name="image" onChange={handleInputChange} label="Link da imagem" />
                        <div className="modal-actions">
                            <StyledButton variant="danger" onClick={handleDelete}>Deletar</StyledButton>
                            <StyledButton onClick={handleCopy}>Copiar</StyledButton>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage>
                <Seo
                    title="Skills"
                    description="Crie, edite e categorize habilidades do personagem com filtros por dominio."
                />
                <RetroWindow title="Skills">
                    <RetroPanel title="Skills">
                        <div className="library-panel">
                            <div className="library-header">
                                <StyledTextField
                                    type="text"
                                    label="Nova skill"
                                    placeholder="Nome da skill..."
                                    value={createSkill}
                                    onChange={(event) => setCreateSkill(event.target.value)}
                                    fullWidth
                                />
                                <div className="library-actions">
                                    <StyledButton onClick={handleCreateSkill}>Criar Skill</StyledButton>
                                    <StyledButton onClick={handlePaste}>Colar Skill</StyledButton>
                                </div>
                            </div>

                            <div className="library-filters">
                                <StyledTextField
                                    type="text"
                                    label="Pesquisar"
                                    placeholder="Buscar por titulo, dominio ou detalhe..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    fullWidth
                                />
                                <div className="library-tags">
                                    <RetroBadge>{`${skillCount}/10 Skills`}</RetroBadge>
                                    {uniqueDomains.map((domain) => (
                                        <RetroBadge
                                            key={domain}
                                            active={activeDomains.includes(domain)}
                                            onClick={() => setActiveDomains(activeDomains.includes(domain) ? activeDomains.filter((d) => d !== domain) : [...activeDomains, domain])}
                                        >
                                            {domain.length > 40 ? `${domain.slice(0, 30)}...` : domain}
                                        </RetroBadge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <article className="library-grid">
                            {(filteredSkills || []).map((skill) => (
                                <RetroCard key={skill.id} onClick={() => openModal(skill)} className="library-card">
                                    <div className="library-card__media">
                                        <img src={skill.image || placeHolderImage} alt="Skill" />
                                    </div>
                                    <div className="library-card__content">
                                        <p className="library-card__title">{skill.title || 'Sem titulo'}</p>
                                        <p className="library-card__meta">{skill.domain || 'Sem domínios'}</p>
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
