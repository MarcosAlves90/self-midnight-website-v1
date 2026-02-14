import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const getAuthenticatedUserId = () => {
    const user = auth.currentUser;
    if (!user) {
        console.warn('getUserData: Usuario nao autenticado');
        return null;
    }
    return user.uid;
};

const handleError = (message, error) => {
    console.error('%s %O', message, error);
};

const executeWithHandling = async (fn, errorMessage) => {
    try {
        return await fn();
    } catch (error) {
        handleError(errorMessage, error);
        return null;
    }
};

export const getUserData = async (type) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    if (type !== 'data' && type !== 'sheets') {
        console.warn('getUserData: Tipo invalido fornecido');
        return null;
    }

    return executeWithHandling(async () => {
        const userDoc = doc(db, 'userData', userId);
        const docSnap = await getDoc(userDoc);

        if (!docSnap.exists()) {
            console.info('getUserData: Nenhum dado encontrado!');
            return null;
        }

        console.info('getUserData: Dados recuperados!');
        const payload = docSnap.data() || {};

        if (type === 'data') return payload.data ?? null;
        if (type === 'sheets') return payload.sheets ?? [];
        return null;
    }, 'getUserData: Erro ao recuperar dados:');
};

export const saveUserData = async (data) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return;

    executeWithHandling(async () => {
        const userDoc = doc(db, 'userData', userId);
        await setDoc(userDoc, { data }, { merge: true });
        console.log('Dados salvos com sucesso!');
    }, 'Erro ao salvar dados:');
};

export const createUserData = async () => {
    const userId = getAuthenticatedUserId();
    if (!userId) return;

    executeWithHandling(async () => {
        const userDoc = doc(db, 'userData', userId);
        await setDoc(userDoc, { data: {}, sheets: [] });
        console.log('Dados do usuario criados com sucesso!');
    }, 'Erro ao criar dados do usuario:');
};

export const saveUserSheets = async (sheets) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return;

    executeWithHandling(async () => {
        const userDoc = doc(db, 'userData', userId);
        await setDoc(userDoc, { sheets }, { merge: true });
        console.log('Fichas salvas com sucesso!');
    }, 'Erro ao salvar fichas:');
};
