import {useEffect, useCallback, useContext, useState} from 'react';
import {UserContext} from '../UserContext.jsx';
import {auth} from '../firebase.js';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {getUserData, createUserData} from '../firebaseUtils.js';
import {useNavigate} from 'react-router-dom';
import validator from 'validator';
import {decompressData} from '../assets/systems/SaveLoad.jsx';
import {StyledButton, StyledTextField} from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel } from '../assets/components/RetroUI.jsx';

const validateEmail = (email) => validator.isEmail(email);
const validatePassword = (password) => !validator.isEmpty(password) && validator.isLength(password, {min: 6, max: 20});

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const navigate = useNavigate();
    const {setUserData} = useContext(UserContext);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => {});
        return () => unsubscribe();
    }, []);

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();

        const sanitizedEmail = validator.normalizeEmail(email || '');
        const trimmedEmail = validator.escape(validator.trim(sanitizedEmail || ''));
        const trimmedPass = validator.trim(password || '');

        const isEmailValid = validateEmail(trimmedEmail);
        const isPasswordValid = validatePassword(trimmedPass);
        setEmailError(!isEmailValid);
        setPasswordError(!isPasswordValid);

        if (!isEmailValid || !isPasswordValid) return;

        try {
            await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
            let userData = await getUserData('data');
            if (userData) {
                userData = decompressData(userData);
                setUserData(userData);
            } else {
                await createUserData('');
            }
            navigate('/individual');
        } catch (error) {
            console.error('Erro de login:', error);
        }
    }, [email, password, navigate, setUserData]);

    return (
        <RetroPage title="Acesso ao Terminal" subtitle="Autenticacao protegida do operador">
            <RetroPanel title="Autenticacao do terminal">
                <h1>MidNight</h1>
                <p>Faca o seu login</p>
                <form id="login-form" onSubmit={handleLogin}>
                    <StyledTextField
                        label="Usuario"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                       
                    />
                    <StyledTextField
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                       
                    />
                    <StyledButton type="submit">Login</StyledButton>
                </form>
            </RetroPanel>
        </RetroPage>
    );
}



