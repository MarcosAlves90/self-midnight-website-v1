import { Suspense, lazy, useContext, useEffect, useState, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

import NavBar from './assets/components/NavBar.jsx';
import { SidebarProvider } from './SidebarContext.jsx';
import { getUserData } from './firebaseUtils';
import { auth } from './firebase.js';
import { UserContext } from './UserContext.jsx';

const ROUTES_WITHOUT_NAVBAR = ['/fichas', '/'];

const LoadingFallback = () => (
    <div id="loader" className="retro-loader" aria-live="polite" aria-busy="true">
        <div className="retro-loader__spinner" />
        <p className="retro-loader__label">Carregando terminal...</p>
    </div>
);

const Page0 = lazy(() => import('./pages/Page0.jsx'));
const Page1 = lazy(() => import('./pages/Page1.jsx'));
const Page2 = lazy(() => import('./pages/Page2.jsx'));
const Page3 = lazy(() => import('./pages/Page3.jsx'));
const Page4 = lazy(() => import('./pages/Page4.jsx'));
const Page5 = lazy(() => import('./pages/Page5.jsx'));
const Page6 = lazy(() => import('./pages/Page6.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Config = lazy(() => import('./pages/Config.jsx'));
const SheetSelectionPage = lazy(() => import('./pages/SheetSelectionPage.jsx'));

const ROUTES_CONFIG = [
    { path: '/login', element: <Login /> },
    { path: '/', element: <Page0 /> },
    { path: '/individual', element: <Page1 /> },
    { path: '/caracteristicas', element: <Page2 /> },
    { path: '/status', element: <Page3 /> },
    { path: '/skills', element: <Page4 /> },
    { path: '/anotacoes', element: <Page5 /> },
    { path: '/fichas', element: <SheetSelectionPage /> },
    { path: '/configuracoes', element: <Config /> },
    { path: '/inventario', element: <Page6 /> },
];

function App() {
    const location = useLocation();
    const { setUserData, setUser } = useContext(UserContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const shouldShowNavBar = !ROUTES_WITHOUT_NAVBAR.includes(location.pathname);

    const fetchUserData = useCallback(async (isMounted) => {
        try {
            const data = await getUserData('data');
            if (!isMounted) return;

            if (!data) {
                setUserData((prevUserData) => (
                    prevUserData?.sheetCode
                        ? prevUserData
                        : { ...prevUserData, nivel: prevUserData?.nivel || 0, sheetCode: uuidv4() }
                ));
                setIsDataLoaded(true);
                return;
            }

            setUserData(data.sheetCode ? data : { ...data, sheetCode: uuidv4() });
            setIsDataLoaded(true);
        } catch (error) {
            console.error('Erro ao buscar dados do usuario:', error);
            setIsDataLoaded(true);
        }
    }, [setUserData]);

    useEffect(() => {
        let isMounted = true;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchUserData(isMounted);
            } else {
                setUser(null);
                setUserData((prevUserData) => (
                    prevUserData?.sheetCode
                        ? prevUserData
                        : { ...prevUserData, nivel: prevUserData?.nivel || 0, sheetCode: uuidv4() }
                ));

                setIsDataLoaded(true);
            }
        });

        return () => {
            isMounted = false;
            unsubscribeAuth();
        };
    }, [setUser, fetchUserData, setUserData]);

    if (!isDataLoaded) {
        return <LoadingFallback />;
    }

    return (
        <SidebarProvider>
            <main className="app-shell">
                {shouldShowNavBar ? <NavBar /> : null}
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {ROUTES_CONFIG.map((route) => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Routes>
                </Suspense>
            </main>
        </SidebarProvider>
    );
}

export default App;

