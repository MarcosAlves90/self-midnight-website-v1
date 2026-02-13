import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { saveUserData } from '../firebaseUtils.js';
import { v4 as uuidv4 } from 'uuid';
import ReactModal from 'react-modal';
import { UserContext } from '../UserContext';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { retroModalStyle } from '../assets/styles/retroTheme.js';
import { RetroPage, RetroPanel, RetroCard, RetroBadge, RetroModalHeader } from '../assets/components/RetroUI.jsx';

ReactModal.setAppElement('#root');

export default function Page6() {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [localItem, setLocalItem] = useState(null);
    const [showQuantityInput, setShowQuantityInput] = useState(false);
    const inputRef = useRef(null);
    const [createItem, setCreateItem] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategories, setActiveCategories] = useState([]);
    const { userData, setUserData, user } = useContext(UserContext);
    const debounceTimeout = useRef(null);

    const [ducados, setDucados] = useState(userData.ducados || '000');
    const [criptogenes, setCriptogenes] = useState(userData.criptogenes || '000');

    const saveDataDebounced = useCallback((data) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            if (user) saveUserData(data);
        }, 500);
    }, [user]);

    useEffect(() => {
        saveDataDebounced(userData);
    }, [userData, saveDataDebounced]);

    const handleElementChange = useCallback((key, value) => {
        setUserData((prevUserData) => ({ ...prevUserData, [key]: value }));
    }, [setUserData]);

    useEffect(() => {
        if (modalIsOpen && inputRef.current) inputRef.current.focus();
    }, [modalIsOpen]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedItem(null);
        setShowQuantityInput(false);
    }, []);

    const openModal = useCallback((item) => {
        setSelectedItem(item);
        setLocalItem(item);
        setIsOpen(true);
        setShowQuantityInput(/^\s*(consumivel|consumiveis)\s*$/i.test(item.type));
    }, []);

    const saveItems = useCallback((newItems) => {
        handleElementChange('itemsArray', newItems);
    }, [handleElementChange]);

    const addItem = useCallback(() => {
        let title = createItem;
        if (!title || title.trim() === '') title = 'Novo item';
        const itemsArray = userData.itemsArray || [];
        saveItems([...itemsArray, { title, content: '', type: '', image: '', quantity: '', id: uuidv4() }]);
        setCreateItem('');
    }, [userData.itemsArray, saveItems, createItem]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setLocalItem((prevItem) => {
            const updatedItem = { ...prevItem, [name]: value };
            if (name === 'type') setShowQuantityInput(/^\s*(consumivel|consumiveis)\s*$/i.test(value));
            return updatedItem;
        });

        setUserData((prevUserData) => {
            const updatedItems = prevUserData.itemsArray.map((item) => item.id === localItem.id ? { ...localItem, [name]: value } : item);
            return { ...prevUserData, itemsArray: updatedItems };
        });
    }, [localItem, setUserData]);

    const deleteItem = useCallback(() => {
        saveItems(userData.itemsArray.filter((item) => item.id !== selectedItem.id));
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

    const placeHolderImage = 'https://pbs.twimg.com/profile_images/1488183450406461452/tH7EIigT_400x400.png';

    const filteredItems = useMemo(() => {
        return (userData.itemsArray || []).filter((item) => {
            const matchesSearchTerm = searchTerm === '' || Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()));
            const itemCategories = item.type.split(',').map((category) => category.trim()).filter((category) => category !== '');
            const matchesCategories = activeCategories.length === 0 || activeCategories.some((category) => itemCategories.includes(category));
            return matchesSearchTerm && matchesCategories;
        });
    }, [userData.itemsArray, searchTerm, activeCategories]);

    const uniqueCategories = useMemo(() => {
        const categories = (userData.itemsArray || [])
            .filter((item) => item.type && item.type.trim() !== '')
            .flatMap((item) => item.type.split(',').map((category) => category.trim()).filter((category) => category !== ''));
        return Array.from(new Set(categories));
    }, [userData.itemsArray]);

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

    return (
        <>
            <ReactModal isOpen={modalIsOpen} onRequestClose={closeModal}>
                {localItem ? (
                    <div>
                        <RetroModalHeader title="Editor de item" onClose={closeModal} />
                        <img src={localItem.image || placeHolderImage} alt="Item" />
                        <input ref={inputRef} value={localItem.title} name="title" onChange={handleInputChange} placeholder="Titulo do seu item." />
                        <textarea value={localItem.content} name="content" onChange={handleInputChange} placeholder="Descricao do seu item." />
                        <div>
                            <StyledTextField fullWidth value={localItem.type} name="type" onChange={handleInputChange} label="Categorias" />
                            {showQuantityInput ? <StyledTextField fullWidth value={localItem.quantity || ''} name="quantity" onChange={handleInputChange} label="Quantidade" /> : null}
                        </div>
                        <StyledTextField fullWidth value={localItem.image} name="image" onChange={handleInputChange} label="Link da imagem" />
                        <div>
                            <StyledButton variant="danger" onClick={deleteItem}>Deletar</StyledButton>
                            <StyledButton onClick={copyItemCode}>Copiar</StyledButton>
                        </div>
                    </div>
                ) : null}
            </ReactModal>

            <RetroPage title="Inventario e Economia" subtitle="Itens, categorias e moedas do operador">
                <RetroPanel title="Inventario">
                    <div>
                        <StyledTextField type="text" placeholder="nome do item..." value={createItem} onChange={(event) => setCreateItem(event.target.value)} fullWidth />
                        <div>
                            <StyledButton onClick={addItem}>Criar Item</StyledButton>
                            <StyledButton onClick={pasteItemCode}>Colar Item</StyledButton>
                        </div>
                        <StyledTextField type="text" placeholder="pesquisar itens..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} fullWidth />
                    </div>

                    <section>
                        <RetroBadge>{`${userData.itemsArray ? userData.itemsArray.length : 0} Itens`}</RetroBadge>
                        <RetroBadge>
                            <input type="text" value={criptogenes} onChange={handleCurrencyChange('criptogenes', setCriptogenes)} onBlur={handleCurrencyBlur('criptogenes', setCriptogenes)} maxLength={4} />
                            <span>Criptogenes</span>
                        </RetroBadge>
                        <RetroBadge>
                            <input type="text" value={ducados} onChange={handleCurrencyChange('ducados', setDucados)} onBlur={handleCurrencyBlur('ducados', setDucados)} maxLength={4} />
                            <span>Rokhans</span>
                        </RetroBadge>
                        {uniqueCategories.map((category) => (
                            <RetroBadge
                                key={category}
                                active={activeCategories.includes(category)}
                                onClick={() => setActiveCategories(activeCategories.includes(category) ? activeCategories.filter((d) => d !== category) : [...activeCategories, category])}
                            >
                                {category.length > 40 ? `${category.slice(0, 30)}...` : category}
                            </RetroBadge>
                        ))}
                    </section>

                    <article>
                        {filteredItems.map((item) => (
                            <RetroCard key={item.id} onClick={() => openModal(item)}>
                                <img src={item.image || placeHolderImage} alt="Item" />
                                <p>{item.title.toUpperCase()}</p>
                                {/^\s*(consumivel|consumiveis)\s*$/i.test(item.type) ? <p>QTD: {(item.quantity || '').toUpperCase()}</p> : null}
                            </RetroCard>
                        ))}
                    </article>
                </RetroPanel>
            </RetroPage>
        </>
    );
}



