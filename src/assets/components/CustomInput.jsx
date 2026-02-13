import PropTypes from 'prop-types';

export default function CustomInput({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    disabled = false,
    required = false,
    min,
    max,
    step,
    endAdornment,
    startAdornment,
    fullWidth = true,
    ...props
}) {
    const inputId = `input-${(label || 'field').replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div>
            {label ? <label htmlFor={inputId}>{label}</label> : null}
            <div>
                {startAdornment ? <span>{startAdornment}</span> : null}
                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                    {...props}
                />
                {endAdornment ? <span>{endAdornment}</span> : null}
            </div>
        </div>
    );
}

CustomInput.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    endAdornment: PropTypes.node,
    startAdornment: PropTypes.node,
    fullWidth: PropTypes.bool,
};

