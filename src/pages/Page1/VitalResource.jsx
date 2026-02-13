import PropTypes from 'prop-types';

export default function VitalResource({
    label,
    icon,
    currentKey,
    currentValue,
    maxValue,
    onResourceChange,
    onInputChange,
}) {
    return (
        <div>
            <div>
                <div>
                    <span>{icon}</span>
                    <span>{label}</span>
                </div>
                <span>{currentValue} / {maxValue}</span>
            </div>
            <div>
                <button type="button" onClick={() => onResourceChange(currentKey, maxValue, -10)} disabled={currentValue === 0}>-10</button>
                <button type="button" onClick={() => onResourceChange(currentKey, maxValue, -1)} disabled={currentValue === 0}>-1</button>
                <input type="number" value={currentValue} onChange={(e) => onInputChange(currentKey, maxValue, e)} min={0} />
                <button type="button" onClick={() => onResourceChange(currentKey, maxValue, 1)}>+1</button>
                <button type="button" onClick={() => onResourceChange(currentKey, maxValue, 10)}>+10</button>
            </div>
        </div>
    );
}

VitalResource.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    currentKey: PropTypes.string.isRequired,
    currentValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    onResourceChange: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
};

