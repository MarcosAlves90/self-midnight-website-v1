import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import {BrowserRouter} from 'react-router-dom';
import {UserProvider} from './UserContext.jsx';
import { bootstrapThemePreference } from './assets/systems/themeUtils.js';

bootstrapThemePreference();

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <UserProvider>
                <App />
            </UserProvider>
        </BrowserRouter>
    </StrictMode>,
);


