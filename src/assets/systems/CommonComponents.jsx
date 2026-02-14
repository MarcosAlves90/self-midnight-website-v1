import PropTypes from 'prop-types';

export function StyledTextField({
    multiline = false,
    minRows = 3,
    label,
    helperText,
    slotProps,
    className,
    ...props
}) {
    const startAdornment = slotProps?.input?.startAdornment;
    const labelClassName = ['styled-field', className].filter(Boolean).join(' ');

    return (
        <label className={labelClassName}>
            {label ? <span>{label}</span> : null}
            <div className="styled-field__control">
                {startAdornment ? <span className="styled-field__adornment">{startAdornment}</span> : null}
                {multiline ? <textarea rows={minRows} {...props} /> : <input {...props} />}
            </div>
            {helperText ? <small className="styled-field__helper">{helperText}</small> : null}
        </label>
    );
}

StyledTextField.propTypes = {
    multiline: PropTypes.bool,
    minRows: PropTypes.number,
    label: PropTypes.string,
    helperText: PropTypes.string,
    slotProps: PropTypes.object,
    className: PropTypes.string,
};

export function StyledFormControl({ children }) {
    return <div>{children}</div>;
}

StyledFormControl.propTypes = {
    children: PropTypes.node,
};

export function StyledButton({
    startIcon,
    endIcon,
    children,
    ...props
}) {
    return (
        <button {...props}>
            {startIcon}
            <span>{children}</span>
            {endIcon}
        </button>
    );
}

StyledButton.propTypes = {
    startIcon: PropTypes.node,
    endIcon: PropTypes.node,
    children: PropTypes.node,
};

