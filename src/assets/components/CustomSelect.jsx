import PropTypes from 'prop-types';

export default function CustomSelect({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Selecione...',
    disabled = false,
    required = false,
    fullWidth = true,
    ...props
}) {
    const selectId = `select-${(label || 'field').replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div>
            {label ? <label htmlFor={selectId}>{label}</label> : null}
            <div>
                <select
                    id={selectId}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    {...props}
                >
                    {placeholder ? <option value="" disabled>{placeholder}</option> : null}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

CustomSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    fullWidth: PropTypes.bool,
};

