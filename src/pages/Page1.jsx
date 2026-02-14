import {useEffect, useRef, useCallback, useContext} from 'react';
import {saveUserData} from '../firebaseUtils.js';
import {UserContext} from '../UserContext.jsx';
import IdentitySection from './Page1/IdentitySection.jsx';
import PersonalSection from './Page1/PersonalSection.jsx';
import MentalWorldSection from './Page1/MentalWorldSection.jsx';
import VitalResourcesSection from './Page1/VitalResourcesSection.jsx';
import ProgressionSection from './Page1/ProgressionSection.jsx';
import { RetroPage } from '../assets/components/RetroUI.jsx';

export default function Page1() {
    const {userData, setUserData, user} = useContext(UserContext);
    const debounceTimeout = useRef(null);
    const operatorName = userData.nome || 'Operador desconhecido';
    const operatorTitle = userData.titulo || 'Sem titulacao';
    const operatorLevel = userData.nivel || 0;

    const saveDataDebounced = useCallback((data) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            if (user) saveUserData(data);
        }, 500);
    }, [user]);

    useEffect(() => {
        saveDataDebounced(userData);
    }, [userData, saveDataDebounced]);

    const handleInputChange = (key) => (event) => {
        const {value, type} = event.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [key]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }));
    };

    const localEnergy = useCallback(() => {
        const pre = userData['atributo-PRE'] || 0;
        const bioEnergy = userData['biotipo-Energia'] || 0;
        const energyMap = {1: 2, 2: 3, 3: 4};
        return (energyMap[bioEnergy] + pre) * userData.nivel || 0;
    }, [userData]);

    const localLife = useCallback(() => {
        const vig = userData['atributo-VIG'] || 0;
        const bioLife = userData['biotipo-Vida'] || 0;
        const lifeMap = {1: 12, 2: 16, 3: 20};
        return (lifeMap[bioLife] + vig) + ((userData.nivel - 1) * (lifeMap[bioLife] / 4 + vig)) || 0;
    }, [userData]);

    const handleResourceChange = (resourceKey, _maxValue, increment) => {
        setUserData((prevUserData) => {
            const currentValue = prevUserData[resourceKey] || 0;
            return { ...prevUserData, [resourceKey]: Math.max(0, currentValue + increment) };
        });
    };

    const handleResourceInputChange = (resourceKey, _maxValue, event) => {
        const value = parseFloat(event.target.value) || 0;
        setUserData((prevUserData) => ({ ...prevUserData, [resourceKey]: Math.max(0, value) }));
    };

    return (
        <RetroPage>
            <section className="page1-console">
                <div className="page1-console__window retro-window">
                    <header className="retro-titlebar">
                        <div className="retro-titlebar__left">
                            <div className="retro-titlebar__icon" />
                            <h2 className="retro-titlebar__title">Identidade</h2>
                        </div>
                        <div className="retro-titlebar__controls">
                            <button type="button" aria-label="Minimizar">_</button>
                            <button type="button" aria-label="Maximizar">[]</button>
                            <button type="button" aria-label="Fechar">X</button>
                        </div>
                    </header>

                    <div className="page1-console__shell">
                        <div className="page1-console__header">
                            <div className="page1-console__summary retro-panel retro-panel--compact">
                                <h3 className="retro-panel__title">Resumo do Operador</h3>
                                <div className="page1-console__summary-grid">
                                    <div>
                                        <p><strong>Nome:</strong> {operatorName}</p>
                                        <p><strong>Titulo:</strong> {operatorTitle}</p>
                                    </div>
                                    <div>
                                        <p><strong>Nivel:</strong> {operatorLevel}</p>
                                        <p><strong>Regime:</strong> Campo ativo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="page1-console__grid">
                            <IdentitySection userData={userData} />
                            <PersonalSection userData={userData} onInputChange={handleInputChange} />
                            <MentalWorldSection userData={userData} onInputChange={handleInputChange} />
                            <VitalResourcesSection
                                userData={userData}
                                localLife={localLife()}
                                localEnergy={localEnergy()}
                                onResourceChange={handleResourceChange}
                                onInputChange={handleResourceInputChange}
                            />
                            <ProgressionSection userData={userData} onInputChange={handleInputChange} />
                        </div>
                    </div>
                </div>
            </section>
        </RetroPage>
    );
}


