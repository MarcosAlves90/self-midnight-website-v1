import PropTypes from 'prop-types';
import { useContext } from 'react';
import { atrColors, bioColors } from '../../styles/CommonStyles.jsx';
import { UserContext } from '../../../UserContext.jsx';

const perArrayPropType = PropTypes.arrayOf(
    PropTypes.shape({
        pericia: PropTypes.string.isRequired,
        atr: PropTypes.string.isRequired,
    })
);


function handleKeyPress(event) {
    if (event.ctrlKey && (event.key === 'a' || event.key === 'c')) return;
    if (!/[0-9]/.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
    }
}

function getColorStyle(palette, key) {
    const entry = palette[key];
    if (!entry) return undefined;
    return { background: entry.background, color: entry.color };
}

export function Biotipos({ biotipo, handleInputChange }) {
    const { userData } = useContext(UserContext);
    const labelStyle = getColorStyle(bioColors, biotipo);

    return (
        <div className="status-row status-row--biotipo">
            <span className="status-chip" style={labelStyle}>{biotipo}</span>
            <input
                className="status-input"
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
    const labelStyle = getColorStyle(atrColors, atributo);

    return (
        <div className="status-row status-row--attribute">
            <button type="button" id={`button-${atributo}`} onClick={rollDice} className="status-roll" style={labelStyle}>
                {getTruAttrName[atributo]}
            </button>
            <input
                className="status-input"
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
                className="status-input status-input--bonus"
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
        <div className="status-grid status-grid--pericias">
            {perArray.map(({ pericia, atr }) => (
                <Pericia pericia={pericia} atr={atr} key={pericia} rollDice={rollDice} handleInputChange={handleInputChange} />
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
    const atrStyle = getColorStyle(atrColors, atr);

    return (
        <div className="status-row status-row--pericia">
            <span className="status-chip" style={atrStyle}>{atr}</span>
            <button type="button" id={`button-${pericia}`} onClick={rollDice} className="status-roll">
                {pericia}
            </button>
            <input
                className="status-input"
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`pericia-${pericia}`] || ''}
                onChange={handleInputChange(`pericia-${pericia}`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${pericia}`}
                disabled={userData.isLocked}
            />
            <input
                className="status-input status-input--bonus"
                type="number"
                step={1}
                min={0}
                placeholder="0"
                value={userData[`pericia-${pericia}-bonus`] || ''}
                onChange={handleInputChange(`pericia-${pericia}-bonus`)}
                onKeyDownCapture={handleKeyPress}
                id={`label-${pericia}-bonus`}
                disabled={userData.isLocked}
            />
        </div>
    );
}

Pericia.propTypes = {
    pericia: PropTypes.string.isRequired,
    atr: PropTypes.string.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    rollDice: PropTypes.func.isRequired,
};


