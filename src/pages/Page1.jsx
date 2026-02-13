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
        <RetroPage title="Identidade do Agente" subtitle="Cadastro principal, parametros vitais e progressao">
            <section>
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
            </section>
        </RetroPage>
    );
}



