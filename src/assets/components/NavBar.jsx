import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSignOut } from '../systems/SaveLoad.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { UserContext } from '../../UserContext.jsx';
import { SidebarContext } from '../../SidebarContext.jsx';
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
    const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebarCompact') === 'true' : false));
    const [currentUser, setCurrentUser] = useState(null);
    const { userData, setUserData } = useContext(UserContext);
    const { toggleCompact } = useContext(SidebarContext);

    const location = useLocation();
    const navigate = useNavigate();
    const signOut = useSignOut();

    const currentPage = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

    const handleMenuToggle = useCallback(() => {
        setMenuOpen((prev) => !prev);
    }, []);

    const handleCompactToggle = useCallback(() => {
        setIsCompact((prev) => !prev);
        toggleCompact();
    }, [toggleCompact]);

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
            <div>
                <span>{currentPage}</span>
                <button onClick={handleMenuToggle} aria-label="Alternar menu">Menu</button>
            </div>

            <nav aria-label="Menu principal">
                <div>
                    <div>
                        <Link to="/" onClick={handleNavItemClick}>MidNight</Link>
                        <button onClick={handleCompactToggle} title={isCompact ? 'Expandir' : 'Compactar'}>
                            {isCompact ? '>' : '<'}
                        </button>
                    </div>
                    <div>{currentPage}</div>
                </div>

                <div>
                    {navItems.map(({ label, path }) => (
                        <Link key={path} to={path} onClick={handleNavItemClick} title={label}>
                            {label}
                        </Link>
                    ))}
                </div>

                <div>
                    <div>Usuario: {currentUser?.email || 'visitante'}</div>
                    <div>Ficha: {userData?.nome || 'nao definida'}</div>
                </div>

                <div>
                    <button onClick={handleLoginClick} title={currentUser ? 'Sair' : 'Login'}>
                        {currentUser ? 'Encerrar sessao' : 'Entrar'}
                    </button>
                </div>
            </nav>

            {isMenuOpen ? <div onClick={handleMenuToggle} aria-hidden={true} /> : null}
        </>
    );
}

