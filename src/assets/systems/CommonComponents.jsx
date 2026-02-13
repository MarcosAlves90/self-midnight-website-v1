import PropTypes from 'prop-types';

export function StyledTextField({
    multiline = false,
    minRows = 3,
    label,
    slotProps,
    ...props
}) {
    const startAdornment = slotProps?.input?.startAdornment;

    return (
        <label>
            {label ? <span>{label}</span> : null}
            <div>
                {startAdornment ? <span>{startAdornment}</span> : null}
                {multiline ? <textarea rows={minRows} {...props} /> : <input {...props} />}
            </div>
        </label>
    );
}

StyledTextField.propTypes = {
    multiline: PropTypes.bool,
    minRows: PropTypes.number,
    label: PropTypes.string,
    slotProps: PropTypes.object,
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

