import {
    createSheet,
    deleteSheet,
    duplicateSheet,
    ensureUserWorkspace,
    getWorkspace,
    replaceInactiveSheets,
    saveActiveSheet,
    switchActiveSheet,
} from './services/sheetRepository.js';

const executeWithHandling = async (fn, errorMessage, fallback = null) => {
    try {
        return await fn();
    } catch (error) {
        console.error('%s %O', errorMessage, error);
        return fallback;
    }
};

export const getUserData = async (type) => {
    if (type !== 'data' && type !== 'sheets') {
        console.warn('getUserData: Tipo invalido fornecido');
        return null;
    }

    return executeWithHandling(async () => {
        const workspace = await getWorkspace();
        if (!workspace) return type === 'sheets' ? [] : null;
        if (type === 'data') return workspace.activeSheet ?? null;
        return workspace.inactiveSheets ?? [];
    }, 'getUserData: Erro ao recuperar dados:', type === 'sheets' ? [] : null);
};

export const saveUserData = async (data) =>
    executeWithHandling(async () => saveActiveSheet(data), 'Erro ao salvar dados:', null);

export const createUserData = async () =>
    executeWithHandling(async () => ensureUserWorkspace(), 'Erro ao criar dados do usuario:', null);

export const saveUserSheets = async (sheets) =>
    executeWithHandling(async () => replaceInactiveSheets(sheets), 'Erro ao salvar fichas:', []);

export const getSheetWorkspace = async () =>
    executeWithHandling(async () => getWorkspace(), 'Erro ao carregar workspace de fichas:', null);

export const createUserSheet = async (name) =>
    executeWithHandling(async () => createSheet(name), 'Erro ao criar ficha:', null);

export const duplicateUserSheet = async (sheetCode) =>
    executeWithHandling(async () => duplicateSheet(sheetCode), 'Erro ao duplicar ficha:', null);

export const deleteUserSheet = async (sheetCode) =>
    executeWithHandling(async () => deleteSheet(sheetCode), 'Erro ao deletar ficha:', null);

export const switchUserSheet = async (targetSheetCode, currentActiveData) =>
    executeWithHandling(
        async () => switchActiveSheet(targetSheetCode, currentActiveData),
        'Erro ao trocar ficha:',
        null,
    );
