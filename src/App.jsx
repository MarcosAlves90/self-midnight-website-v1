import { Suspense, lazy, useContext, useEffect, useState, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

import NavBar from './assets/components/NavBar.jsx';
import { SidebarProvider } from './SidebarContext.jsx';
import { getUserData } from './firebaseUtils';
import { auth } from './firebase.js';
import { UserContext } from './UserContext.jsx';
import { decompressData } from './assets/systems/SaveLoad.jsx';

const ROUTES_WITHOUT_NAVBAR = ['/fichas', '/'];

const LoadingFallback = () => (
    <div id="loader">
        <div />
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
    const { userData, setUserData, setUser } = useContext(UserContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const shouldShowNavBar = !ROUTES_WITHOUT_NAVBAR.includes(location.pathname);

    const handleElementChange = useCallback((key) => (value) => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            [key]: value,
        }));
    }, [setUserData]);

    const fetchUserData = useCallback(async (isMounted) => {
        try {
            let data = await getUserData('data');

            if (!data || !isMounted) return;

            const decompressedData = decompressData(data);

            if (!decompressedData.sheetCode) {
                decompressedData.sheetCode = uuidv4();
            }

            setUserData(decompressedData);
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

                if (!userData.sheetCode) {
                    handleElementChange('sheetCode')(uuidv4());
                }

                setIsDataLoaded(true);
            }
        });

        return () => {
            isMounted = false;
            unsubscribeAuth();
        };
    }, [setUser, fetchUserData, userData.sheetCode, handleElementChange]);

    if (!isDataLoaded) {
        return <LoadingFallback />;
    }

    return (
        <SidebarProvider>
            <main>
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

