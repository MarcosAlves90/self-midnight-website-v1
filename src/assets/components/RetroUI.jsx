import PropTypes from 'prop-types';

const joinClassNames = (...classes) => classes.filter(Boolean).join(' ');

export function RetroPage({ title, subtitle, children, className }) {
    return (
        <main className={joinClassNames('retro-page', className)}>
            {title ? (
                <header className="retro-page__header">
                    <h1 className="retro-page__title">{title}</h1>
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
    className: PropTypes.string,
};

export function RetroPanel({ title, children, className }) {
    return (
        <section className={joinClassNames('retro-panel', className)}>
            {title ? <h2 className="retro-panel__title">{title}</h2> : null}
            <div className="retro-panel__content">{children}</div>
        </section>
    );
}

RetroPanel.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
};

export function RetroCard({ children, onClick, className }) {
    const Wrapper = onClick ? 'button' : 'div';

    return (
        <Wrapper
            onClick={onClick}
            type={onClick ? 'button' : undefined}
            className={joinClassNames('retro-card', onClick ? 'retro-card--clickable' : null, className)}
        >
            <div className="retro-card__content">{children}</div>
        </Wrapper>
    );
}

RetroCard.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export function RetroBadge({ children, onClick, active, className }) {
    const Comp = onClick ? 'button' : 'span';
    return (
        <Comp
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={joinClassNames('retro-badge', active ? 'retro-badge--active' : null, className)}
        >
            {children}
        </Comp>
    );
}

RetroBadge.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    active: PropTypes.bool,
    className: PropTypes.string,
};

export function RetroToolbar({ children, className }) {
    return <div className={joinClassNames('retro-toolbar', className)}>{children}</div>;
}

RetroToolbar.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export function RetroModalHeader({ title, onClose, className }) {
    return (
        <div className={joinClassNames('retro-modal-header', className)}>
            <p className="retro-modal-header__title">{title}</p>
            <button type="button" className="retro-modal-header__close" onClick={onClose}>
                X
            </button>
        </div>
    );
}

RetroModalHeader.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export function RetroWindow({ title, status, children, className }) {
    return (
        <section className={joinClassNames('retro-window-shell', className)}>
            <div className="retro-window-shell__frame retro-window">
                <header className="retro-titlebar">
                    <div className="retro-titlebar__left">
                        <div className="retro-titlebar__icon" />
                        <h2 className="retro-titlebar__title">{title}</h2>
                    </div>
                    <div className="retro-titlebar__controls">
                        <button type="button" aria-label="Minimizar">_</button>
                        <button type="button" aria-label="Maximizar">[]</button>
                        <button type="button" aria-label="Fechar">X</button>
                    </div>
                </header>
                {status ? (
                    <div className="retro-status-bar">
                        <span className="retro-ticker">{status}</span>
                    </div>
                ) : null}
                <div className="retro-window-shell__content">{children}</div>
            </div>
        </section>
    );
}

RetroWindow.propTypes = {
    title: PropTypes.string.isRequired,
    status: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
};

