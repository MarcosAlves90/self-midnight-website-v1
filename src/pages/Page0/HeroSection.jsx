import PropTypes from 'prop-types';
import { useMemo } from 'react';
import EnterButton from '../../assets/components/EnterButton';

export default function HeroSection({ title, category, subtitle }) {
    const visitorCount = useMemo(() => {
        const base = 384120;
        const offset = new Date().getDate() * 73;
        return String(base + offset).padStart(6, '0');
    }, []);

    return (
        <section>
            <article>
                <div>
                    <header>
                        <div>
                            <div />
                            <h1>Mental World Terminal // Retro-Tech Shell</h1>
                        </div>
                        <div>
                            <button>_</button>
                            <button>[]</button>
                            <button>X</button>
                        </div>
                    </header>

                    <nav>
                        {['Dashboard', 'Logs', 'Profiles', 'System', 'Archive'].map((item) => (
                            <button
                                key={item}
                               
                            >
                                {item}
                            </button>
                        ))}
                    </nav>

                    <div>
                        Session: Omega Clearance :: Node: Sevastopol :: Gridline Bus: Stable
                    </div>

                    <main>
                        <div>
                            <div>
                                <section>
                                    <div>
                                        <h2>{category}</h2>
                                        <p>{title}</p>
                                        <p>{subtitle}</p>
                                    </div>

                                    <div>
                                        <p>Terminal Output</p>
                                        <div>
                                            <p>{'>'} booting retro shell...</p>
                                            <p>{'>'} loading sector map: AGAMEMNON.REGION.01</p>
                                            <p>{'>'} allocating encrypted profile registry...</p>
                                            <p>{'>'} status: ONLINE // signal: CLEAN</p>
                                            <p>{'>'} awaiting operator authentication...</p>
                                            <p>{'>'} warning: analog relay temperature +2C</p>
                                            <p>{'>'} click ENTER to proceed.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <EnterButton />
                                    </div>
                                </section>

                                <aside>
                                    <div>
                                        <h3>Core Metrics</h3>
                                        <div>
                                            <p><span>Power Grid</span><span>99.2%</span></p>
                                            <p><span>Packet Loss</span><span>0.02%</span></p>
                                            <p><span>Vault Sync</span><span>READY</span></p>
                                            <p><span>Shield Layer</span><span>LEVEL IV</span></p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3>System Notes</h3>
                                        <ul>
                                            <li>Pixel-perfect separators enabled</li>
                                            <li>Skeuomorphic panel depth active</li>
                                            <li>Scanline renderer online</li>
                                        </ul>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </main>

                    <footer>
                        <p>Y2K Industrial Interface // Build 98.04.31</p>
                        <div>
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


