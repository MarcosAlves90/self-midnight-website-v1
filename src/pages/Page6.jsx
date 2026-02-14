import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { saveUserData } from '../firebaseUtils.js';
import { v4 as uuidv4 } from 'uuid';
import ReactModal from 'react-modal';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroCard, RetroBadge, RetroModalHeader, RetroWindow } from '../assets/components/RetroUI.jsx';
import { useDebouncedCloudSave } from '../assets/systems/useDebouncedCloudSave.js';
import Seo from '../assets/components/Seo.jsx';

ReactModal.setAppElement('#root');

export default function Page6() {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [localItem, setLocalItem] = useState(null);
    const inputRef = useRef(null);
    const [createItem, setCreateItem] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategories, setActiveCategories] = useState([]);
    const { userData, setUserData, user } = useContext(UserContext);
    useDebouncedCloudSave(userData, Boolean(user), saveUserData);

    const [ducados, setDucados] = useState(userData.ducados || '000');
    const [criptogenes, setCriptogenes] = useState(userData.criptogenes || '000');
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const placeHolderImage = useMemo(
        () => 'https://pbs.twimg.com/profile_images/1488183450406461452/tH7EIigT_400x400.png',
        []
    );

    useEffect(() => {
        setDucados(userData.ducados || '000');
        setCriptogenes(userData.criptogenes || '000');
    }, [userData.ducados, userData.criptogenes]);

    const handleElementChange = useCallback((key, value) => {
        setUserData((prevUserData) => ({ ...prevUserData, [key]: value }));
    }, [setUserData]);

    useEffect(() => {
        if (modalIsOpen && inputRef.current) inputRef.current.focus();
    }, [modalIsOpen]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedItem(null);
    }, []);

    const openModal = useCallback((item) => {
        setSelectedItem(item);
        setLocalItem(item);
        setIsOpen(true);
    }, []);

    const saveItems = useCallback((newItems) => {
        handleElementChange('itemsArray', newItems);
    }, [handleElementChange]);

    const addItem = useCallback(() => {
        const title = createItem.trim() || 'Novo item';
        const itemsArray = userData.itemsArray || [];
        saveItems([...itemsArray, { title, content: '', type: '', image: '', quantity: '', id: uuidv4() }]);
        setCreateItem('');
    }, [userData.itemsArray, saveItems, createItem]);

    const updateItem = useCallback((itemId, patch) => {
        setUserData((prevUserData) => {
            const updatedItems = (prevUserData.itemsArray || []).map((item) =>
                item.id === itemId ? { ...item, ...patch } : item
            );
            return { ...prevUserData, itemsArray: updatedItems };
        });
    }, [setUserData]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setLocalItem((prevItem) => {
            if (!prevItem) return prevItem;
            const updatedItem = { ...prevItem, [name]: value };
            updateItem(prevItem.id, { [name]: value });
            return updatedItem;
        });
    }, [updateItem]);

    const deleteItem = useCallback(() => {
        if (!selectedItem) return;
        saveItems((userData.itemsArray || []).filter((item) => item.id !== selectedItem.id));
        closeModal();
    }, [userData.itemsArray, selectedItem, saveItems, closeModal]);

    const copyItemCode = useCallback(async () => {
        if (selectedItem) await navigator.clipboard.writeText(JSON.stringify(selectedItem));
    }, [selectedItem]);

    const pasteItemCode = useCallback(async (e) => {
        e.preventDefault();
        try {
            const itemCode = (await navigator.clipboard.readText()).trim();
            const item = JSON.parse(itemCode);
            saveItems([...(userData.itemsArray || []), { ...item, id: uuidv4() }]);
        } catch (err) {
            console.log('Erro ao colar o codigo do item!', err);
        }
    }, [userData.itemsArray, saveItems]);

    const isConsumableType = useCallback((value) => /^\s*(consumivel|consumiveis)\s*$/i.test(value || ''), []);
    const isConsumable = isConsumableType(localItem?.type);

    const extractCategories = useCallback((value) => {
        return (value || '')
            .split(',')
            .map((category) => category.trim())
            .filter((category) => category !== '');
    }, []);

    const filteredItems = useMemo(() => {
        return (userData.itemsArray || []).filter((item) => {
            const matchesSearchTerm = normalizedSearch === '' || Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));
            const itemCategories = extractCategories(item.type);
            const matchesCategories = activeCategories.length === 0 || activeCategories.some((category) => itemCategories.includes(category));
            return matchesSearchTerm && matchesCategories;
        });
    }, [userData.itemsArray, normalizedSearch, activeCategories, extractCategories]);

    const uniqueCategories = useMemo(() => {
        const categories = (userData.itemsArray || [])
            .filter((item) => item.type && item.type.trim() !== '')
            .flatMap((item) => extractCategories(item.type));
        return Array.from(new Set(categories));
    }, [userData.itemsArray, extractCategories]);

    const handleCurrencyChange = (key, setter) => (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setter(value);
        handleElementChange(key, value);
    };

    const handleCurrencyBlur = (key, setter) => (e) => {
        const value = e.target.value || '000';
        setter(value);
        handleElementChange(key, value);
    };

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setActiveCategories([]);
    }, []);

    const itemCount = userData.itemsArray ? userData.itemsArray.length : 0;

    const getSnippet = useCallback((text, max = 90) => {
        if (!text) return '';
        if (text.length <= max) return text;
        return `${text.slice(0, max).trim()}...`;
    }, []);

    return (
        <>
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="retro-modal"
                overlayClassName="retro-modal__overlay"
            >
                {localItem ? (
                    <div className="inventory-modal">
                        <RetroModalHeader title="Editor de item" onClose={closeModal} />
                        <div className="inventory-modal__media">
                            <div className="inventory-modal__preview">
                                <img src={localItem.image || placeHolderImage} alt="Item" />
                                {isConsumable ? (
                                    <span className="inventory-card__badge">QTD {localItem.quantity || '0'}</span>
                                ) : null}
                            </div>
                            <div className="inventory-modal__details">
                                <label className="styled-field">
                                    <span>Titulo</span>
                                    <div className="styled-field__control">
                                        <input ref={inputRef} value={localItem.title || ''} name="title" onChange={handleInputChange} placeholder="Titulo do item" />
                                    </div>
                                </label>
                                <StyledTextField
                                    value={localItem.type || ''}
                                    name="type"
                                    onChange={handleInputChange}
                                    label="Categorias"
                                    helperText="Separe por virgula para facilitar filtros."
                                />
                            </div>
                        </div>

                        <div className="inventory-modal__grid">
                            {isConsumable ? (
                                <StyledTextField value={localItem.quantity || ''} name="quantity" onChange={handleInputChange} label="Quantidade" />
                            ) : null}
                            <StyledTextField value={localItem.image || ''} name="image" onChange={handleInputChange} label="Link da imagem" />
                        </div>

                        <StyledTextField
                            multiline
                            minRows={6}
                            value={localItem.content || ''}
                            name="content"
                            onChange={handleInputChange}
                            label="Descrição"
                            placeholder="Descreva o item, origem e efeitos."
                        />
                        <div className="modal-actions">
                            <StyledButton variant="danger" onClick={deleteItem}>Deletar</StyledButton>
                            <StyledButton onClick={copyItemCode}>Copiar</StyledButton>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage>
                <Seo
                    title="Inventário"
                    description="Gerencie itens, categorias e moedas do personagem com filtros e busca."
                />
                <RetroWindow title="Inventário">
                    <RetroPanel title="Inventário">
                        <div className="inventory-panel">
                            <div className="inventory-header">
                                <div className="inventory-create">
                                    <StyledTextField
                                        type="text"
                                        label="Novo item"
                                        placeholder="Nome do item..."
                                        value={createItem}
                                        onChange={(event) => setCreateItem(event.target.value)}
                                        fullWidth
                                    />
                                    <div className="inventory-actions">
                                        <StyledButton onClick={addItem}>Criar Item</StyledButton>
                                        <StyledButton onClick={pasteItemCode}>Colar Item</StyledButton>
                                    </div>
                                </div>

                                <div className="inventory-economy">
                                    <RetroBadge>{`${itemCount} Itens`}</RetroBadge>
                                    <div className="inventory-wallet">
                                        <StyledTextField
                                            label="Criptogenes"
                                            value={criptogenes}
                                            onChange={handleCurrencyChange('criptogenes', setCriptogenes)}
                                            onBlur={handleCurrencyBlur('criptogenes', setCriptogenes)}
                                            inputMode="numeric"
                                            maxLength={4}
                                        />
                                        <StyledTextField
                                            label="Rokhans"
                                            value={ducados}
                                            onChange={handleCurrencyChange('ducados', setDucados)}
                                            onBlur={handleCurrencyBlur('ducados', setDucados)}
                                            inputMode="numeric"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="inventory-filters">
                                <StyledTextField
                                    type="text"
                                    label="Pesquisar"
                                    placeholder="Buscar por titulo, descrição ou categoria..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    fullWidth
                                />
                                <div className="inventory-tags">
                                    {uniqueCategories.map((category) => (
                                        <RetroBadge
                                            key={category}
                                            active={activeCategories.includes(category)}
                                            onClick={() => setActiveCategories(activeCategories.includes(category) ? activeCategories.filter((d) => d !== category) : [...activeCategories, category])}
                                        >
                                            {category.length > 40 ? `${category.slice(0, 30)}...` : category}
                                        </RetroBadge>
                                    ))}
                                    {(activeCategories.length > 0 || searchTerm) ? (
                                        <StyledButton onClick={clearFilters}>Limpar filtros</StyledButton>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <article className="inventory-grid">
                            {filteredItems.length === 0 ? (
                                <div className="inventory-empty">
                                    <p>Nenhum item encontrado. Crie um novo item ou ajuste os filtros.</p>
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const categories = extractCategories(item.type);
                                    const quantityLabel = isConsumableType(item.type) ? `QTD ${item.quantity || '0'}` : null;
                                    return (
                                        <RetroCard key={item.id} onClick={() => openModal(item)} className="inventory-card">
                                            <div className="inventory-card__media">
                                                <img src={item.image || placeHolderImage} alt="Item" />
                                                {quantityLabel ? <span className="inventory-card__badge">{quantityLabel}</span> : null}
                                            </div>
                                            <div className="inventory-card__content">
                                                <p className="inventory-card__title">{item.title || 'Sem titulo'}</p>
                                                <p className="inventory-card__meta">
                                                    {categories.length > 0 ? categories.slice(0, 3).join(' • ') : 'Sem categorias'}
                                                </p>
                                                {item.content ? (
                                                    <p className="inventory-card__desc">{getSnippet(item.content)}</p>
                                                ) : null}
                                            </div>
                                        </RetroCard>
                                    );
                                })
                            )}
                        </article>
                    </RetroPanel>
                </RetroWindow>
            </RetroPage>
        </>
    );
}
