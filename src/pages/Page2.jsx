import { useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { saveUserData } from '../firebaseUtils.js';
import { UserContext } from '../UserContext';
import { StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroWindow } from '../assets/components/RetroUI.jsx';
import Seo from '../assets/components/Seo.jsx';

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

    const handleInputChange = useCallback((key) => (event) => {
        const { value, type } = event.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [key]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }));
    }, [setUserData]);

    const characterSections = useMemo(() => ([
        {
            key: 'origem',
            title: 'Origem',
            placeholder: 'Resumo do passado, eventos marcantes e vínculos.',
            minRows: 6,
            helperText: 'Contexto, família, feitos e objetivos iniciais.',
        },
        {
            key: 'fisico',
            title: 'Aparência',
            placeholder: 'Traços físicos, marcas e postura.',
            minRows: 4,
            helperText: 'Detalhes visuais que ajudam a reconhecer o personagem.',
        },
        {
            key: 'ideais',
            title: 'Ideais',
            placeholder: 'Crenças, motivações e limites éticos.',
            minRows: 4,
            helperText: 'O que move o personagem e o que ele jamais faria.',
        },
        {
            key: 'origemForma',
            title: 'Origem da Forma',
            placeholder: 'Explique o surgimento da forma especial.',
            minRows: 7,
            helperText: 'Como, quando e por que essa forma foi despertada.',
        },
    ]), []);

    return (
        <RetroPage>
            <Seo
                title="Características"
                description="Detalhes de origem, aparência, ideais e traços do personagem."
            />
            <RetroWindow title="Características">
                <div className="page2-characteristics">
                    <div className="page2-characteristics__grid">
                        {characterSections.map((section) => (
                            <RetroPanel key={section.key} title={section.title}>
                                <StyledTextField
                                    multiline
                                    minRows={section.minRows}
                                    placeholder={section.placeholder}
                                    helperText={section.helperText}
                                    value={userData[section.key] || ''}
                                    onChange={handleInputChange(section.key)}
                                />
                            </RetroPanel>
                        ))}
                    </div>

                    <RetroPanel title="Tracos">
                        <div className="page2-characteristics__traits">
                            <StyledTextField
                                multiline
                                minRows={4}
                                label="Tracos positivos"
                                placeholder="Forcas e qualidades mais marcantes."
                                helperText="Habilidades sociais, virtudes, atitude exemplar."
                                value={userData.tracosPositivos || ''}
                                onChange={handleInputChange('tracosPositivos')}
                            />
                            <StyledTextField
                                multiline
                                minRows={4}
                                label="Tracos negativos"
                                placeholder="Limites, falhas e manias."
                                helperText="Vícios, medos, impulsos e conflitos internos."
                                value={userData.tracosNegativos || ''}
                                onChange={handleInputChange('tracosNegativos')}
                            />
                        </div>
                    </RetroPanel>
                </div>
            </RetroWindow>
        </RetroPage>
    );
}

