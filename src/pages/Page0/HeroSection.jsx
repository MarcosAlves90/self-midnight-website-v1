import PropTypes from 'prop-types';
import { useMemo, useEffect, useState } from 'react';
import EnterButton from '../../assets/components/EnterButton';

export default function HeroSection({ title, category, subtitle }) {
    const statusMessages = useMemo(
        () => [
            'Session: omega-clearance :: Node: sevastopol01 :: Gridline Bus: stable',
            'Session: theta-clearance :: Node: borealis07 :: Relay: syncing',
            'Session: omega-clearance :: Node: sevastopol01 :: Signal: clean',
            'Session: sigma-clearance :: Node: helios03 :: Uplink: encrypted',
        ],
        [],
    );

    const terminalPrompts = useMemo(
        () => [
            'awaiting operator authentication...',
            'routing clearance handshake...',
            'decrypting vault access token...',
            'uplink stabilized. awaiting command...',
        ],
        [],
    );

    const highlightTags = useMemo(
        () => ['RETRO TECH', 'Y2K GRID', 'SECURE NODE', 'ANALOG CORE'],
        [],
    );

    const [statusIndex, setStatusIndex] = useState(0);
    const [promptIndex, setPromptIndex] = useState(0);
    const [tagIndex, setTagIndex] = useState(0);

    const visitorCount = useMemo(() => {
        const base = 384120;
        const offset = new Date().getDate() * 73;
        return String(base + offset).padStart(6, '0');
    }, []);

    useEffect(() => {
        const statusTimer = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statusMessages.length);
        }, 3200);
        const promptTimer = setInterval(() => {
            setPromptIndex((prev) => (prev + 1) % terminalPrompts.length);
        }, 2600);
        const tagTimer = setInterval(() => {
            setTagIndex((prev) => (prev + 1) % highlightTags.length);
        }, 2400);

        return () => {
            clearInterval(statusTimer);
            clearInterval(promptTimer);
            clearInterval(tagTimer);
        };
    }, [statusMessages.length, terminalPrompts.length, highlightTags.length]);

    return (
        <section className="hero">
            <article className="hero__window hero__window--floating retro-window">
                <div className="hero__window-inner">
                    <header className="retro-titlebar">
                        <div className="retro-titlebar__left">
                            <div className="retro-titlebar__icon" />
                            <h1 className="retro-titlebar__title retro-glitch" data-text="highnoon shell">
                                highnoon shell
                            </h1>
                        </div>
                        <div className="retro-titlebar__controls">
                            <button type="button" aria-label="Minimizar">_</button>
                            <button type="button" aria-label="Maximizar">[]</button>
                            <button type="button" aria-label="Fechar">X</button>
                        </div>
                    </header>

                    <nav className="retro-tabs" aria-label="Navegacao principal">
                        {['Dashboard', 'Logs', 'Profiles', 'System', 'Archive'].map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="retro-tab"
                            >
                                {item}
                            </button>
                        ))}
                    </nav>

                    <div className="retro-status-bar">
                        <span className="retro-ticker" key={`status-${statusIndex}`}>
                            {statusMessages[statusIndex]}
                        </span>
                    </div>

                    <main className="hero__content">
                        <div className="hero__grid">
                            <div className="hero__primary">
                                <section className="hero__intro">
                                    <div className="hero__intro-copy">
                                        <h2 className="hero__eyebrow">{category}</h2>
                                        <p className="hero__title">{title}</p>
                                        <p className="hero__subtitle">{subtitle}</p>
                                        <div className="hero__tag" key={`tag-${tagIndex}`}>
                                            {highlightTags[tagIndex]}
                                        </div>
                                    </div>

                                    <div className="retro-terminal">
                                        <p className="retro-terminal__title">Terminal Output</p>
                                        <div className="retro-terminal__log">
                                            <p>{'>'} booting retro shell...</p>
                                            <p>{'>'} loading sector map: AGAMEMNON.REGION.01</p>
                                            <p>{'>'} allocating encrypted profile registry...</p>
                                            <p>{'>'} status: ONLINE // signal: CLEAN</p>
                                            <p>{'>'} {terminalPrompts[promptIndex]}</p>
                                            <p>{'>'} warning: analog relay temperature +2C</p>
                                            <p>{'>'} click ENTER to proceed.</p>
                                        </div>
                                    </div>

                                    <div className="hero__cta">
                                        <EnterButton />
                                    </div>
                                </section>

                                <aside className="hero__sidebar">
                                    <div className="retro-panel retro-panel--compact">
                                        <h3 className="retro-panel__title">Core Metrics</h3>
                                        <div className="retro-metrics">
                                            <p><span>Power Grid</span><span>99.2%</span></p>
                                            <p><span>Packet Loss</span><span>0.02%</span></p>
                                            <p><span>Vault Sync</span><span>READY</span></p>
                                            <p><span>Shield Layer</span><span>LEVEL IV</span></p>
                                        </div>
                                    </div>

                                    <div className="retro-panel retro-panel--compact">
                                        <h3 className="retro-panel__title">System Notes</h3>
                                        <ul className="retro-notes">
                                            <li>Pixel-perfect separators enabled</li>
                                            <li>Skeuomorphic panel depth active</li>
                                            <li>Scanline renderer online</li>
                                        </ul>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </main>

                    <footer className="retro-footer">
                        <p>Rossiiskaia Industrial Interface // Build 98.04.31</p>
                        <div className="retro-counter" aria-label="Visitantes">
                            <span>Visitor</span>
                            <span>{visitorCount}</span>
                        </div>
                    </footer>
                </div>
            </article>
        </section>
    );
}

HeroSection.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
};

