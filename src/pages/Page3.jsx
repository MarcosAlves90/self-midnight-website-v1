import {useCallback, useEffect, useState, useMemo, useContext} from 'react';
import {Attributes, Biotipos, PericiasSection} from '../assets/systems/FichaPage3/FichaPage3System.jsx';
import {atrMap, bioMap, perArray} from '../assets/systems/FichaPage3/FichaPage3Arrays.jsx';
import {saveUserData} from '../firebaseUtils.js';
import {ToastContainer, toast} from 'react-toastify';
import {UserContext} from '../UserContext.jsx';
import {StyledButton, StyledTextField} from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroBadge, RetroWindow } from '../assets/components/RetroUI.jsx';
import { useDebouncedCloudSave } from '../assets/systems/useDebouncedCloudSave.js';
import Seo from '../assets/components/Seo.jsx';

export default function Page3() {
    const [totalPoints, setTotalPoints] = useState({ bioPoints: 0, atrPoints: 0, perPoints: 0 });
    const [recommendations, setRecommendations] = useState(false);
    const [tempRoll, setTempRoll] = useState({ Pericia: '', Dice: '', Result: 0 });
    const [noStatusDice, setNoStatusDice] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const {userData, setUserData, user} = useContext(UserContext);
    useDebouncedCloudSave(userData, Boolean(user), saveUserData);

    const calculateTotalPoints = useCallback(() => {
        const newTotalPoints = { bioPoints: 0, atrPoints: 0, perPoints: 0 };
        Object.keys(userData).forEach((key) => {
            const value = parseFloat(userData[key]);
            const validValue = Number.isNaN(value) ? 0 : value;
            if (!key.includes('Points') && !key.endsWith('-bonus')) {
                if (key.startsWith('biotipo-')) newTotalPoints.bioPoints += validValue;
                else if (key.startsWith('atributo-')) newTotalPoints.atrPoints += validValue;
                else if (key.startsWith('pericia-')) newTotalPoints.perPoints += validValue;
            }
        });
        setTotalPoints(newTotalPoints);
    }, [userData]);

    useEffect(() => {
        calculateTotalPoints();
    }, [userData, calculateTotalPoints]);

    const handleInputChange = useCallback((key) => (event) => {
        const {value, type} = event.target;
        setUserData((prevUserData) => ({ ...prevUserData, [key]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value }));
    }, [setUserData]);

    const handleElementChange = useCallback((key) => (value) => {
        setUserData((prevUserData) => ({ ...prevUserData, [key]: value }));
    }, [setUserData]);

    const handleLockChange = useCallback(() => {
        handleElementChange('isLocked')(!userData.isLocked);
    }, [handleElementChange, userData.isLocked]);

    const calculateAttributesPoints = useCallback(() => {
        const nivel = userData.nivel || 1;
        if (nivel < 4) return 9;
        if (nivel < 10) return 10;
        if (nivel < 16) return 11;
        if (nivel < 19) return 12;
        return 13;
    }, [userData.nivel]);

    const calculateAttributesCap = useCallback(() => {
        const nivel = userData.nivel || 1;
        if (nivel < 4) return 3;
        if (nivel < 10) return 4;
        return 5;
    }, [userData.nivel]);

    const calculatePericiasPoints = useCallback(() => {
        const nivel = userData.nivel || 1;
        const bPericias = userData['biotipo-Pericias'] || 0;
        const aInt = userData['atributo-INT'] || 0;

        if (bPericias === 0 || aInt === 0) return 0;
        if (bPericias === 1) return ((3 + aInt) * nivel) + (nivel * 2);
        if (bPericias === 2) return ((5 + aInt) * nivel) + (nivel * 2);
        if (bPericias === 3) return ((7 + aInt) * nivel) + (nivel * 2);
        return -1;
    }, [userData]);

    const calculatePericiasCap = useCallback(() => userData.nivel || 1, [userData.nivel]);

    const rollDice = (e, simpleDice) => {
        let diceResult = 0;
        const dice = [];
        let noAttribute = false;

        const attrProgressMap = {
            DES: 'var(--yellow-des)',
            FOR: 'var(--red-for)',
            INT: 'var(--blue-int)',
            PRE: 'var(--purple-pre)',
            VIG: 'var(--green-vig)',
        };

        const notify = (message, attrKey) => {
            const progressColor = attrKey ? attrProgressMap[attrKey] : 'var(--retro-ink)';
            toast(message, {
                theme: 'dark',
                position: 'bottom-right',
                progressStyle: { background: progressColor },
            });
        };

        function rollSimpleDice(qty, sides) {
            for (let i = 0; i < qty; i++) dice.push(Math.floor(Math.random() * sides) + 1);
        }

        function simpleDiceSum() {
            return dice.reduce((acc, curr) => acc + curr, 0);
        }

        function chooseSimpleDiceResult() {
            diceResult = simpleDice.sum ? simpleDiceSum() : Math.max(...dice);
        }

        function verifyAttribute(atr, bonus) {
            if ((atr + bonus) === 0) return [true, 2, bonus];
            return [false, atr, bonus];
        }

        function rollAttributeDice(atr, bonus) {
            for (let i = 0; i < (atr + bonus); i++) dice.push(Math.floor(Math.random() * 20) + 1);
        }

        function chooseMinOrMax(noAtr) {
            diceResult = noAtr ? Math.min(...dice) : Math.max(...dice);
        }

        if (atrMap.includes((e.target.id).slice(7))) {
            const attributeName = (e.target.id).slice(7);
            let attribute = userData[`atributo-${attributeName}`] || 0;
            let attributeBonus = userData[`atributo-${attributeName}-bonus`] || 0;
            [noAttribute, attribute, attributeBonus] = verifyAttribute(attribute, attributeBonus);
            rollAttributeDice(attribute, attributeBonus);
            chooseMinOrMax(noAttribute);
            notify(`${attributeName}: [${dice}] = ${diceResult}`, attributeName);
            setTempRoll({Pericia: attributeName, Dice: dice.join(', '), Result: diceResult});
            return;
        }

        if (perArray.map((per) => per.pericia).includes((e.target.id).slice(7))) {
            const periciaName = (e.target.id).slice(7);
            const pericia = userData[`pericia-${periciaName}`] || 0;
            const periciaBonus = userData[`pericia-${periciaName}-bonus`] || 0;
            const periciaDef = perArray.find((per) => per.pericia === periciaName);
            const atrKey = periciaDef?.atr;
            let attribute = atrKey ? (userData[`atributo-${atrKey}`] || 0) : 0;
            let attributeBonus = atrKey ? (userData[`atributo-${atrKey}-bonus`] || 0) : 0;
            [noAttribute, attribute, attributeBonus] = verifyAttribute(attribute, attributeBonus);
            rollAttributeDice(attribute, attributeBonus);
            chooseMinOrMax(noAttribute);
            diceResult += periciaBonus;
            const result = diceResult + pericia;
            notify(`${periciaName}: [${dice}] = ${result}`, atrKey);
            setTempRoll({Pericia: periciaName, Dice: dice.join(', '), Result: result});
            return;
        }

        rollSimpleDice(simpleDice.qty, simpleDice.sides);
        chooseSimpleDiceResult();
        notify(`Comum: [${dice}] = ${diceResult}`);
        setTempRoll({Pericia: 'Comum', Dice: dice.join(', '), Result: diceResult});
    };

    const handleSearchChange = useCallback((event) => setSearchTerm(event.target.value.toLowerCase()), []);
    const handleNoStatusDiceChange = useCallback((event) => setNoStatusDice(event.target.value.toLowerCase()), []);

    const noStatusDiceRoll = useCallback(() => {
        const regex = /(\d+)d(\d+)(kh\d+|kh)?/g;
        const symbolRegex = /[+\-*/]/g;
        const numberRegex = /(?<!\d)d?\b\d+\b(?!d)/g;
        const matches = noStatusDice.match(regex);
        const symbols = noStatusDice.match(symbolRegex) || [];
        const isolatedNumbers = noStatusDice.match(numberRegex)?.map(Number) || [];

        const notify = (message) => toast(message, {
            theme: 'dark',
            position: 'bottom-right',
            progressStyle: { background: 'var(--retro-ink)' },
        });

        if (!matches) return;

        const rollOne = (num, sides) => Array.from({ length: num }, () => Math.floor(Math.random() * sides) + 1);
        const sum = (diceArray) => diceArray.reduce((acc, val) => acc + val, 0);

        const parsedDice = matches.map((match) => {
            const [, num1, num2, kh] = match.match(/(\d+)d(\d+)(kh\d+|kh)?/);
            return [parseInt(num1, 10), parseInt(num2, 10), kh ? (kh === 'kh' ? 'kh1' : kh) : 'c'];
        });

        const results = parsedDice.map(([num, sides, type]) => {
            const diceResults = rollOne(num, sides);
            if (type.startsWith('kh')) {
                diceResults.sort((a, b) => b - a);
                return { results: diceResults, result: sum(diceResults.slice(0, parseInt(type.slice(2), 10))) };
            }
            return { results: diceResults, result: sum(diceResults) };
        });

        let finalResult = results[0].result;
        let symbolIndex = 0;
        let isolatedNumberIndex = 0;

        const formattedDice = noStatusDice.replace(regex, (match, p1, p2, p3) => {
            const index = matches.indexOf(match);
            const diceResults = results[index].results;
            if (p3 && p3.startsWith('kh')) {
                const keepHighest = parseInt(p3.slice(2), 10);
                const keptResults = diceResults.slice(0, keepHighest).map((result) => `(${result})`);
                const otherResults = diceResults.slice(keepHighest);
                return `[${[...otherResults, ...keptResults].join(', ')}]`;
            }
            return `[${diceResults.join(', ')}]`;
        });

        for (let i = 0; i < symbols.length; i++) {
            if (symbolIndex < results.length - 1) {
                if (symbols[i] === '+') finalResult += results[symbolIndex + 1].result;
                if (symbols[i] === '-') finalResult -= results[symbolIndex + 1].result;
                if (symbols[i] === '*') finalResult *= results[symbolIndex + 1].result;
                if (symbols[i] === '/') finalResult /= results[symbolIndex + 1].result;
                symbolIndex++;
            } else if (isolatedNumberIndex < isolatedNumbers.length) {
                if (symbols[i] === '+') finalResult += isolatedNumbers[isolatedNumberIndex];
                if (symbols[i] === '-') finalResult -= isolatedNumbers[isolatedNumberIndex];
                if (symbols[i] === '*') finalResult *= isolatedNumbers[isolatedNumberIndex];
                if (symbols[i] === '/') finalResult /= isolatedNumbers[isolatedNumberIndex];
                isolatedNumberIndex++;
            }
        }

        while (isolatedNumberIndex < isolatedNumbers.length) {
            finalResult += isolatedNumbers[isolatedNumberIndex];
            isolatedNumberIndex++;
        }

        setTempRoll({ Pericia: 'Comum', Dice: formattedDice, Result: finalResult });
        const truncatedFormattedDice = formattedDice.length > 80 ? `${formattedDice.slice(0, 80)}...` : formattedDice;
        notify(`${truncatedFormattedDice} = ${finalResult}`);
    }, [noStatusDice]);

    const filteredBioMap = useMemo(() => bioMap.filter((item) => item.toLowerCase().includes(searchTerm)), [searchTerm]);
    const filteredAtrMap = useMemo(() => atrMap.filter((item) => item.toLowerCase().includes(searchTerm)), [searchTerm]);
    const filteredPerArray = useMemo(() => perArray.filter((item) => item.pericia.toLowerCase().includes(searchTerm)), [searchTerm]);
    const periciaHeaderValue = useMemo(() => {
        if (!userData.nivel || userData.nivel === '' || Number.isNaN(userData.nivel)) return 'Verifique seu nivel';
        const periciasPoints = calculatePericiasPoints();
        if (periciasPoints > 0) return periciasPoints;
        if (periciasPoints === 0) return 'Preencha Biotipo e Atributos';
        return 'Biotipo invalido';
    }, [userData.nivel, calculatePericiasPoints]);

    const statusSummary = useMemo(() => ([
        {
            id: 'bio',
            label: 'Biotipo',
            value: totalPoints.bioPoints,
            cap: 9,
            accent: 'var(--color-life)',
        },
        {
            id: 'atr',
            label: 'Atributos',
            value: totalPoints.atrPoints,
            cap: calculateAttributesPoints(),
            accent: 'var(--yellow-des)',
        },
        {
            id: 'per',
            label: 'Pericias',
            value: totalPoints.perPoints,
            cap: periciaHeaderValue,
            accent: 'var(--color-per)',
        },
    ]), [calculateAttributesPoints, periciaHeaderValue, totalPoints]);

    const lastRollLabel = tempRoll.Pericia || 'Nenhuma';
    const lastRollDice = tempRoll.Dice ? `${tempRoll.Dice.slice(0, 60)}${tempRoll.Dice.length > 60 ? '...' : ''}` : '-';
    const lastRollResult = tempRoll.Result || 0;

    return (
        <RetroPage>
            <Seo
                title="Status"
                description="Distribua pontos de biotipo, atributos e pericias com ferramentas de rolagem."
            />
            <RetroWindow title="Status">
                <ToastContainer
                    className="retro-toast-container"
                    toastClassName="retro-toast"
                    bodyClassName="retro-toast__body"
                    progressClassName="retro-toast__progress"
                    position="bottom-right"
                    autoClose={3500}
                    limit={5}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                />

                <div className="page3-status">
                    <div className="page3-status__overview">
                        <RetroPanel title="Resumo do operador">
                            <div className="status-summary">
                                {statusSummary.map((item) => (
                                    <div key={item.id} className="status-card" style={{ '--status-accent': item.accent }}>
                                        <p className="status-card__title">{item.label}</p>
                                        <p className="status-card__value">{item.value}</p>
                                        <p className="status-card__meta">Limite: {item.cap}</p>
                                    </div>
                                ))}
                            </div>
                        </RetroPanel>

                        <RetroPanel title="Painel rápido">
                            <div className="status-quick">
                                <div className="status-quick__actions">
                                    <StyledButton onClick={handleLockChange}>{userData.isLocked ? 'Bloqueado [LOCK]' : 'Desbloqueado [OPEN]'}</StyledButton>
                                    <StyledButton onClick={() => setRecommendations(!recommendations)}>{recommendations ? 'Ocultar regras' : 'Mostrar regras'}</StyledButton>
                                </div>

                                <StyledTextField
                                    type="text"
                                    placeholder="Pesquisar status..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    fullWidth
                                    slotProps={{ input: { startAdornment: '[FIND]' } }}
                                />

                                {recommendations ? (
                                    <div className="status-rules">
                                        <RetroBadge>Cap biotipo: 3</RetroBadge>
                                        <RetroBadge>Cap atributos: {calculateAttributesCap()}</RetroBadge>
                                        <RetroBadge>Cap pericias: {calculatePericiasCap()}</RetroBadge>
                                    </div>
                                ) : null}

                                <div className="status-quick__dice">
                                    <StyledTextField
                                        type="text"
                                        placeholder="Ex.: 2d20+4 ou 4d6kh3"
                                        value={noStatusDice}
                                        onChange={handleNoStatusDiceChange}
                                        fullWidth
                                        slotProps={{ input: { startAdornment: '[DICE]' } }}
                                    />
                                    <StyledButton onClick={noStatusDiceRoll}>Rolar</StyledButton>
                                </div>

                                <div className="status-last-roll">
                                    <RetroBadge>Pericia: {lastRollLabel}</RetroBadge>
                                    <RetroBadge>Dados: {lastRollDice}</RetroBadge>
                                    <RetroBadge>Resultado: {lastRollResult}</RetroBadge>
                                </div>
                            </div>
                        </RetroPanel>
                    </div>
                </div>

                {filteredBioMap.length > 0 ? (
                    <RetroPanel title={`Biotipo [${totalPoints.bioPoints}/9]`}>
                        <div className="status-grid status-grid--biotipos">
                            {filteredBioMap.map((biotipo) => <Biotipos key={biotipo} biotipo={biotipo} handleInputChange={handleInputChange} />)}
                        </div>
                    </RetroPanel>
                ) : null}

                {filteredAtrMap.length > 0 ? (
                    <RetroPanel title={`Atributos [${totalPoints.atrPoints}/${calculateAttributesPoints()}]`}>
                        <div className="status-grid status-grid--atributos">
                            {filteredAtrMap.map((atr) => <Attributes key={atr} atributo={atr} atr={atr} handleInputChange={handleInputChange} rollDice={rollDice} />)}
                        </div>
                    </RetroPanel>
                ) : null}

                {filteredPerArray.length > 0 ? (
                    <RetroPanel title={`Pericias [${totalPoints.perPoints}/${periciaHeaderValue}]`}>
                        <PericiasSection rollDice={rollDice} handleInputChange={handleInputChange} perArray={filteredPerArray} />
                    </RetroPanel>
                ) : null}
            </RetroWindow>
        </RetroPage>
    );
}
