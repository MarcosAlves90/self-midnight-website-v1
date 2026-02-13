import PropTypes from 'prop-types';
import { useContext } from 'react';
import { arcColors, atrColors, bioColors } from '../../styles/CommonStyles.jsx';
import { UserContext } from '../../../UserContext.jsx';

const perArrayPropType = PropTypes.arrayOf(
    PropTypes.shape({
        pericia: PropTypes.string.isRequired,
        atr: PropTypes.string.isRequired,
    })
);

const arcArrayPropType = PropTypes.arrayOf(
    PropTypes.shape({
        art: PropTypes.string.isRequired,
    })
);

const subArcArrayPropType = PropTypes.arrayOf(
    PropTypes.shape({
        subArt: PropTypes.string.isRequired,
        art: PropTypes.string.isRequired,
    })
);

function handleKeyPress(event) {
    if (event.ctrlKey && (event.key === 'a' || event.key === 'c')) return;
    if (!/[0-9]/.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
    }
}

export function Biotipos({ biotipo, handleInputChange }) {
    const { userData } = useContext(UserContext);

    return (
        <div>
            <span>{biotipo}</span>
            <input
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`biotipo-${biotipo}`] || ''}
                onChange={handleInputChange(`biotipo-${biotipo}`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${biotipo}`}
                disabled={userData.isLocked}
            />
        </div>
    );
}

Biotipos.propTypes = {
    biotipo: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
};

const getTruAttrName = {
    DES: 'Destreza',
    FOR: 'Forca',
    INT: 'Inteligencia',
    PRE: 'Presenca',
    VIG: 'Vigor',
};

export function Attributes({ atributo, atr, handleInputChange, rollDice }) {
    const { userData } = useContext(UserContext);

    return (
        <div>
            <span id={`button-${atributo}`} onClick={rollDice}>{getTruAttrName[atributo]}</span>
            <input
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`atributo-${atr}`] || ''}
                onChange={handleInputChange(`atributo-${atr}`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${atributo}`}
                disabled={userData.isLocked}
            />
            <input
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`atributo-${atr}-bonus`] || ''}
                onChange={handleInputChange(`atributo-${atr}-bonus`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${atributo}-bonus`}
                disabled={userData.isLocked}
            />
        </div>
    );
}

Attributes.propTypes = {
    atributo: PropTypes.string.isRequired,
    atr: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    rollDice: PropTypes.func.isRequired,
};

export function PericiasSection({ rollDice, handleInputChange, perArray }) {
    return (
        <div>
            {perArray.map(({ pericia, atr }, index) => (
                <div key={index}>
                    <Pericia pericia={pericia} atr={atr} key={pericia} rollDice={rollDice} handleInputChange={handleInputChange} />
                </div>
            ))}
        </div>
    );
}

PericiasSection.propTypes = {
    rollDice: PropTypes.func.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    perArray: perArrayPropType.isRequired,
};

function Pericia({ pericia, atr, handleInputChange, rollDice }) {
    const { userData } = useContext(UserContext);

    return (
        <div>
            <span>{atr}</span>
            <span id={`button-${pericia}`} onClick={rollDice}>{pericia}</span>
            <input type="number" step={1} min={0} placeholder="0" value={userData[`pericia-${pericia}`] || ''} onChange={handleInputChange(`pericia-${pericia}`)} onKeyDownCapture={handleKeyPress} id={`label-${pericia}`} disabled={userData.isLocked} />
            <input type="number" step={1} min={0} placeholder="0" value={userData[`pericia-${pericia}-bonus`] || ''} onChange={handleInputChange(`pericia-${pericia}-bonus`)} onKeyDownCapture={handleKeyPress} id={`label-${pericia}-bonus`} disabled={userData.isLocked} />
        </div>
    );
}

Pericia.propTypes = {
    pericia: PropTypes.string.isRequired,
    atr: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    rollDice: PropTypes.func.isRequired,
};

export function ArtsSection({ handleInputChange, arcArray }) {
    return (
        <div>
            {arcArray.map(({ art }) => (
                <ArcaneArts art={art} key={art} handleInputChange={handleInputChange} />
            ))}
        </div>
    );
}

ArtsSection.propTypes = {
    handleInputChange: PropTypes.func.isRequired,
    arcArray: arcArrayPropType.isRequired,
};

const getTruArcName = {
    DES: 'Destruicao',
    LEV: 'Levitacao',
    LIB: 'Liberacao',
    MAN: 'Manipulacao',
    IMA: 'Imaginacao',
    MOD: 'Modificacao',
    CRI: 'Criacao',
};

export function ArcaneArts({ art, handleInputChange }) {
    const { userData } = useContext(UserContext);

    return (
        <div>
            <span>{getTruArcName[art]}</span>
            <input
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`art-${art}`] || ''}
                onChange={handleInputChange(`art-${art}`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${art}`}
                disabled={userData.isLocked}
            />
        </div>
    );
}

ArcaneArts.propTypes = {
    art: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
};

export function SubArtsSection({ handleInputChange, subArcArray }) {
    return (
        <div>
            {subArcArray.map(({ subArt, art }) => (
                <div key={subArt}>
                    <SubArcaneArts subArt={subArt} art={art} handleInputChange={handleInputChange} />
                </div>
            ))}
        </div>
    );
}

SubArtsSection.propTypes = {
    handleInputChange: PropTypes.func.isRequired,
    subArcArray: subArcArrayPropType.isRequired,
};

export function SubArcaneArts({ subArt, art, handleInputChange }) {
    const { userData } = useContext(UserContext);

    return (
        <div>
            <span>{art}</span>
            <span>{subArt}</span>
            <input
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`subArt-${subArt}`] || ''}
                onChange={handleInputChange(`subArt-${subArt}`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${subArt}`}
                disabled={userData.isLocked}
            />
        </div>
    );
}

SubArcaneArts.propTypes = {
    subArt: PropTypes.string.isRequired,
    art: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
};

