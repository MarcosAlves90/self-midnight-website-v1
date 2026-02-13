import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSignOut } from '../systems/SaveLoad.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { UserContext } from '../../UserContext.jsx';
import { saveUserData } from '../../firebaseUtils.js';

const navItems = [
    { label: 'Individual', path: '/individual' },
    { label: 'Caracteristicas', path: '/caracteristicas' },
    { label: 'Status', path: '/status' },
    { label: 'Skills', path: '/skills' },
    { label: 'Anotacoes', path: '/anotacoes' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Configuracoes', path: '/configuracoes' },
];

const getPageTitle = (pathname) => navItems.find((nav) => nav.path === pathname)?.label || 'MidNight';

export default function NavBar() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isCompact] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebarCompact') === 'true' : false));
    const [currentUser, setCurrentUser] = useState(null);
    const { userData, setUserData } = useContext(UserContext);

    const location = useLocation();
    const navigate = useNavigate();
    const signOut = useSignOut();

    const currentPage = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

    const handleMenuToggle = useCallback(() => {
        setMenuOpen((prev) => !prev);
    }, []);

    const handleLogoutClick = useCallback(() => {
        saveUserData(userData);
        signOut();
        setUserData({ nivel: 0 });
        setMenuOpen(false);
    }, [userData, signOut, setUserData]);

    const handleLoginClick = useCallback(() => {
        if (currentUser) handleLogoutClick();
        else navigate('/login');
        setMenuOpen(false);
    }, [currentUser, handleLogoutClick, navigate]);

    const handleNavItemClick = useCallback(() => {
        if (isMenuOpen) setMenuOpen(false);
    }, [isMenuOpen]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }, [isMenuOpen]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCompact', String(isCompact));
        }
    }, [isCompact]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
        return () => unsubscribe();
    }, []);

    return (
        <>
            <div className="retro-topbar">
                <div className="retro-topbar__left">
                    <span className="retro-topbar__title">Status: {currentPage}</span>
                    <span className="retro-topbar__pulse" aria-hidden="true" />
                </div>
                <button className="retro-button retro-button--small" onClick={handleMenuToggle} aria-label="Alternar menu">
                    Menu
                </button>
            </div>

            <nav className={`retro-nav ${isMenuOpen ? 'retro-nav--open' : ''}`} aria-label="Menu principal">
                <div className="retro-nav__window retro-window">
                    <header className="retro-titlebar retro-titlebar--nav">
                        <div className="retro-titlebar__left">
                            <div className="retro-titlebar__icon" />
                            <h2 className="retro-titlebar__title">CONSOLE</h2>
                        </div>
                        <div className="retro-titlebar__controls">
                            <button type="button" aria-label="Minimizar">_</button>
                            <button type="button" aria-label="Maximizar">[]</button>
                            <button type="button" aria-label="Fechar" onClick={handleMenuToggle}>X</button>
                        </div>
                    </header>

                    <div className="retro-nav__content">
                        <div className="retro-nav__header">
                            <div className="retro-nav__brand">
                                <Link to="/" className="retro-nav__logo" onClick={handleNavItemClick}>HighNoon</Link>
                            </div>
                            <div className="retro-nav__current">Sessao ativa: {currentPage}</div>
                        </div>

                        <div className="retro-nav__links">
                            {navItems.map(({ label, path }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={handleNavItemClick}
                                    title={label}
                                    className={`retro-nav__link ${location.pathname === path ? 'retro-nav__link--active' : ''}`}
                                    aria-current={location.pathname === path ? 'page' : undefined}
                                >
                                    <span className="retro-nav__link-bullet" aria-hidden="true">▶</span>
                                    {label}
                                </Link>
                            ))}
                        </div>

                        <div className="retro-nav__meta">
                            <div>Usuario: {currentUser?.email || 'visitante'}</div>
                            <div>Ficha: {userData?.nome || 'nao definida'}</div>
                        </div>

                        <div className="retro-nav__actions">
                            <button
                                className="retro-button retro-button--small"
                                onClick={handleLoginClick}
                                title={currentUser ? 'Sair' : 'Login'}
                            >
                                {currentUser ? 'Encerrar sessao' : 'Entrar'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {isMenuOpen ? <div className="retro-nav__backdrop" onClick={handleMenuToggle} aria-hidden={true} /> : null}
        </>
    );
}

