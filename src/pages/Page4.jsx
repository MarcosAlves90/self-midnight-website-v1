import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import ReactModal from 'react-modal';
import { retroModalStyle } from '../assets/styles/retroTheme.js';
import { RetroPage, RetroPanel, RetroCard, RetroBadge, RetroModalHeader } from '../assets/components/RetroUI.jsx';

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
            const updatedItems = prevUserData.skillsArray.map((item) => item.id === localItem.id ? { ...localItem, [name]: value } : item);
            return { ...prevUserData, skillsArray: updatedItems };
        });
    }, [localItem, setUserData]);

    const placeHolderImage = useMemo(() => 'https://pt.quizur.com/_image?href=https%3A%2F%2Fimg.quizur.com%2Ff%2Fimg5c40afdab16e93.66721106.png%3FlastEdited%3D1547743200&w=400&h=400&f=webp', []);

    return (
        <>
            <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal}>
                {localItem ? (
                    <div>
                        <RetroModalHeader title="Editor de skill" onClose={closeModal} />
                        <img src={localItem.image || placeHolderImage} alt="Item" />
                        <input ref={inputRef} value={localItem.title} name="title" onChange={handleInputChange} placeholder="Titulo do seu item." />
                        <div>
                            <StyledTextField value={localItem.circle || ''} onChange={handleInputChange} name="circle" label="Circulo" />
                            <StyledTextField value={localItem.type || ''} onChange={handleInputChange} name="type" label="Categoria" />
                            <StyledTextField value={localItem.spent} onChange={handleInputChange} name="spent" label="Gasto" />
                            <StyledTextField value={localItem.execution || ''} onChange={handleInputChange} name="execution" label="Execucao" />
                            <StyledTextField value={localItem.range || ''} onChange={handleInputChange} name="range" label="Alcance" />
                            <StyledTextField value={localItem.area} onChange={handleInputChange} name="area" label="Area" />
                            <StyledTextField value={localItem.target} onChange={handleInputChange} name="target" label="Alvo" />
                            <StyledTextField value={localItem.duration} onChange={handleInputChange} name="duration" label="Duracao" />
                            <StyledTextField value={localItem.resistance} onChange={handleInputChange} name="resistance" label="Resistencia" />
                        </div>
                        <textarea value={localItem.content} name="content" onChange={handleInputChange} placeholder="Descricao da skill" />
                        <StyledTextField value={localItem.domain} fullWidth name="domain" onChange={handleInputChange} label="Dominios" />
                        <StyledTextField value={localItem.image} fullWidth name="image" onChange={handleInputChange} label="Link da imagem" />
                        <div>
                            <StyledButton variant="danger" onClick={handleDelete}>Deletar</StyledButton>
                            <StyledButton onClick={handleCopy}>Copiar</StyledButton>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage title="Biblioteca de Skills" subtitle="Crie, edite e catalogue habilidades com dominios">
                <RetroPanel title="Skills">
                    <div>
                        <StyledTextField type="text" placeholder="nome da skill..." value={createSkill} onChange={(event) => setCreateSkill(event.target.value)} fullWidth />
                        <div>
                            <StyledButton onClick={handleCreateSkill}>Criar Skill</StyledButton>
                            <StyledButton onClick={handlePaste}>Colar Skill</StyledButton>
                        </div>
                        <StyledTextField type="text" placeholder="pesquisar skills..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} fullWidth />
                    </div>

                    <section>
                        <RetroBadge>{`${userData.skillsArray ? userData.skillsArray.length : 0}/10 Skills`}</RetroBadge>
                        {uniqueDomains.map((domain) => (
                            <RetroBadge key={domain} active={activeDomains.includes(domain)} onClick={() => setActiveDomains(activeDomains.includes(domain) ? activeDomains.filter((d) => d !== domain) : [...activeDomains, domain])}>
                                {domain.length > 40 ? `${domain.slice(0, 30)}...` : domain}
                            </RetroBadge>
                        ))}
                    </section>

                    <article>
                        {(filteredSkills || []).map((skill) => (
                            <RetroCard key={skill.id} onClick={() => openModal(skill)}>
                                <img src={skill.image || placeHolderImage} alt="Skill" />
                                <p>{skill.title.toUpperCase()}</p>
                            </RetroCard>
                        ))}
                    </article>
                </RetroPanel>
            </RetroPage>
        </>
    );
}



