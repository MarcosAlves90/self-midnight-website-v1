import { useEffect, useCallback, useContext, useState } from 'react';
import { UserContext } from '../UserContext.jsx';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getUserData, createUserData } from '../firebaseUtils.js';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
import { StyledButton, StyledTextField } from '../assets/systems/CommonComponents.jsx';
import { RetroPage, RetroPanel, RetroWindow } from '../assets/components/RetroUI.jsx';
import Seo from '../assets/components/Seo.jsx';

const validateEmail = (email) => validator.isEmail(email);
const validatePassword = (password) =>
    !validator.isEmpty(password) && validator.isLength(password, { min: 6, max: 20 });

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { setUserData } = useContext(UserContext);

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
        setFormError('');

        if (!isEmailValid || !isPasswordValid) return;

        try {
            setIsSubmitting(true);
            await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
            let cloudData = await getUserData('data');
            if (!cloudData) {
                await createUserData();
                cloudData = await getUserData('data');
            }
            if (cloudData) {
                setUserData(cloudData);
            }
            navigate('/individual');
        } catch (error) {
            console.error('Erro de login:', error);
            setFormError('Falha ao autenticar. Verifique os dados e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }, [email, password, navigate, setUserData]);

    return (
        <RetroPage>
            <Seo
                title="Login"
                description="Acesse sua ficha online com autenticação segura."
                noIndex
            />
            <RetroWindow title="Login">
                <RetroPanel title="Autenticação do terminal">
                    <div className="login-panel">
                        <header className="login-header">
                            <p className="login-eyebrow">Rossiiskaia Access</p>
                            <h1 className="login-title">Faca o seu login</h1>
                            <p className="login-subtitle">Acesse seu perfil sincronizado com a nuvem.</p>
                        </header>

                        <form id="login-form" className="login-form" onSubmit={handleLogin}>
                            <StyledTextField
                                label="Usuário"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                helperText="Use o email cadastrado."
                                fullWidth
                            />
                            {emailError ? <p className="login-error">Email inválido.</p> : null}
                            <StyledTextField
                                label="Senha"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                helperText="Mínimo 6 caracteres."
                                fullWidth
                            />
                            {passwordError ? <p className="login-error">Senha inválida.</p> : null}
                            {formError ? <p className="login-error login-error--global">{formError}</p> : null}
                            <div className="login-actions">
                                <StyledButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Entrando...' : 'Login'}
                                </StyledButton>
                                <StyledButton type="button" onClick={() => navigate('/')}>
                                    Voltar
                                </StyledButton>
                            </div>
                        </form>
                    </div>
                </RetroPanel>
            </RetroWindow>
        </RetroPage>
    );
}
