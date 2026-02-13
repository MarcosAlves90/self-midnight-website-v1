import { useEffect, useContext, useRef, useCallback } from 'react';
import Collapsible from 'react-collapsible';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel } from '../assets/components/RetroUI.jsx';

function TextPanel({ title, children }) {
    return (
        <RetroPanel title={title}>
            <Collapsible trigger={title}>
                <div>{children}</div>
            </Collapsible>
        </RetroPanel>
    );
}

export default function Page2() {
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

    const handleInputChange = (key) => (event) => {
        const { value, type } = event.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [key]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }));
    };

    return (
        <RetroPage title="Caracteristicas" subtitle="Historico, ideais e contexto psicologico">
            <div>
                <TextPanel title="Origem">
                    <StyledTextField placeholder="Escreva a sua origem" value={userData.origem} onChange={handleInputChange('origem')} multiline minRows={6} fullWidth />
                </TextPanel>

                <TextPanel title="Aparencia">
                    <StyledTextField placeholder="Descreva a sua aparencia" value={userData.fisico} onChange={handleInputChange('fisico')} multiline minRows={4} fullWidth />
                </TextPanel>

                <TextPanel title="Ideais">
                    <StyledTextField placeholder="Escreva um ou mais ideais" value={userData.ideais} onChange={handleInputChange('ideais')} multiline minRows={4} fullWidth />
                </TextPanel>

                <RetroPanel title="Tracos">
                    <div>
                        <Collapsible trigger="Tracos negativos">
                            <div>
                                <StyledTextField value={userData.tracosNegativos} onChange={handleInputChange('tracosNegativos')} multiline minRows={4} fullWidth placeholder="- Escreva tracos negativos." />
                            </div>
                        </Collapsible>
                        <Collapsible trigger="Tracos positivos">
                            <div>
                                <StyledTextField value={userData.tracosPositivos} onChange={handleInputChange('tracosPositivos')} multiline minRows={4} fullWidth placeholder="- Escreva tracos positivos." />
                            </div>
                        </Collapsible>
                    </div>
                </RetroPanel>

                <TextPanel title="Origem da forma">
                    <StyledTextField value={userData.origemForma} onChange={handleInputChange('origemForma')} multiline minRows={7} fullWidth placeholder="Escreva a origem da sua forma." />
                </TextPanel>
            </div>
        </RetroPage>
    );
}



