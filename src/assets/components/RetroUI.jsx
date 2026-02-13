import PropTypes from 'prop-types';

export function RetroPage({ title, subtitle, children }) {
    return (
        <main>
            {title ? (
                <header>
                    <h1>{title}</h1>
                    {subtitle ? <p>{subtitle}</p> : null}
                </header>
            ) : null}
            {children}
        </main>
    );
}

RetroPage.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    children: PropTypes.node,
};

export function RetroPanel({ title, children }) {
    return (
        <section>
            {title ? <h2>{title}</h2> : null}
            {children}
        </section>
    );
}

RetroPanel.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node,
};

export function RetroCard({ children, onClick }) {
    const Wrapper = onClick ? 'button' : 'div';

    return (
        <Wrapper onClick={onClick} type={onClick ? 'button' : undefined}>
            <div>{children}</div>
        </Wrapper>
    );
}

RetroCard.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
};

export function RetroBadge({ children, onClick }) {
    const Comp = onClick ? 'button' : 'span';
    return (
        <Comp type={onClick ? 'button' : undefined} onClick={onClick}>
            {children}
        </Comp>
    );
}

RetroBadge.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
};

export function RetroToolbar({ children }) {
    return <div>{children}</div>;
}

RetroToolbar.propTypes = {
    children: PropTypes.node,
};

export function RetroModalHeader({ title, onClose }) {
    return (
        <div>
            <p>{title}</p>
            <button type="button" onClick={onClose}>X</button>
        </div>
    );
}

RetroModalHeader.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

