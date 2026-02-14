import { beforeEach, describe, expect, it, vi } from 'vitest';

const { firestoreState, authMock } = vi.hoisted(() => ({
    firestoreState: { docs: new Map() },
    authMock: { currentUser: { uid: 'user-e2e' } },
}));

const getRootDocPath = () => `userData/${authMock.currentUser.uid}`;

vi.mock('firebase/firestore', () => ({
    doc: (_db, ...segments) => ({ path: segments.join('/') }),
    getDoc: async (ref) => {
        const deepClone = (value) => JSON.parse(JSON.stringify(value));
        const stored = firestoreState.docs.get(ref.path);
        return {
            exists: () => stored !== undefined,
            data: () => deepClone(stored),
        };
    },
    setDoc: async (ref, value, options = {}) => {
        const deepClone = (payload) => JSON.parse(JSON.stringify(payload));
        const isObject = (item) => Boolean(item) && typeof item === 'object' && !Array.isArray(item);
        const mergeShallow = (target, source) => ({ ...target, ...source });
        const payload = deepClone(value);
        const current = firestoreState.docs.get(ref.path);

        if (options?.merge && isObject(current) && isObject(payload)) {
            firestoreState.docs.set(ref.path, mergeShallow(current, payload));
            return;
        }

        if (options?.merge && current === undefined) {
            firestoreState.docs.set(ref.path, payload);
            return;
        }

        firestoreState.docs.set(ref.path, payload);
    },
}));

vi.mock('../../firebase.js', () => ({
    db: {},
    auth: authMock,
}));

import {
    createUserData,
    createUserSheet,
    deleteUserSheet,
    duplicateUserSheet,
    getUserData,
    saveUserData,
    saveUserSheets,
    switchUserSheet,
} from '../../firebaseUtils.js';

describe('Sheet System E2E', () => {
    beforeEach(() => {
        firestoreState.docs.clear();
        authMock.currentUser = { uid: 'user-e2e' };
    });

    it('migrates legacy payload once and keeps stable active sheet code', async () => {
        firestoreState.docs.set(getRootDocPath(), {
            data: { sheetCode: 'active-1', nome: 'Ativa', nivel: 4, updatedAt: 200 },
            sheets: [
                { sheetCode: 'inactive-1', nome: 'Reserva', nivel: 2, updatedAt: 100 },
                { sheetCode: 'active-1', nome: 'Ativa antiga', nivel: 1, updatedAt: 20 },
            ],
        });

        const activeFirstRead = await getUserData('data');
        const activeSecondRead = await getUserData('data');
        const inactive = await getUserData('sheets');
        const rootPayload = firestoreState.docs.get(getRootDocPath());

        expect(activeFirstRead.sheetCode).toBe('active-1');
        expect(activeSecondRead.sheetCode).toBe('active-1');
        expect(inactive).toHaveLength(1);
        expect(inactive[0].sheetCode).toBe('inactive-1');
        expect(rootPayload.schemaVersion).toBe(2);
    });

    it('keeps the same sheetCode while saving edits repeatedly', async () => {
        await createUserData();
        const before = await getUserData('data');

        await saveUserData({ ...before, nome: 'Operador A', atributoFOR: 3 });
        const afterFirstSave = await getUserData('data');

        await saveUserData({ ...afterFirstSave, atributoFOR: 5, nivel: 7 });
        const afterSecondSave = await getUserData('data');

        expect(afterFirstSave.sheetCode).toBe(before.sheetCode);
        expect(afterSecondSave.sheetCode).toBe(before.sheetCode);
        expect(afterSecondSave.atributoFOR).toBe(5);
        expect(afterSecondSave.nivel).toBe(7);
    });

    it('runs full lifecycle: create, duplicate, switch, persist current, and delete active', async () => {
        await createUserData();
        const initialActive = await getUserData('data');

        const created = await createUserSheet('Nova ficha');
        const duplicated = await duplicateUserSheet(created.sheetCode);
        const beforeSwitchList = await getUserData('sheets');

        const switched = await switchUserSheet(created.sheetCode, {
            ...initialActive,
            nome: 'Principal editada',
            energiaAtual: 42,
        });
        const activeAfterSwitch = await getUserData('data');
        const inactiveAfterSwitch = await getUserData('sheets');

        const workspaceAfterDelete = await deleteUserSheet(created.sheetCode);
        const activeAfterDelete = await getUserData('data');
        const inactiveAfterDelete = await getUserData('sheets');
        const allCodesAfterDelete = [
            activeAfterDelete.sheetCode,
            ...inactiveAfterDelete.map((sheet) => sheet.sheetCode),
        ];

        expect(created.sheetCode).not.toBe(initialActive.sheetCode);
        expect(duplicated.sheetCode).not.toBe(created.sheetCode);
        expect(beforeSwitchList).toHaveLength(2);
        expect(switched.sheetCode).toBe(created.sheetCode);
        expect(activeAfterSwitch.sheetCode).toBe(created.sheetCode);
        expect(
            inactiveAfterSwitch.some(
                (sheet) => sheet.sheetCode === initialActive.sheetCode && sheet.nome === 'Principal editada',
            ),
        ).toBe(true);
        expect(workspaceAfterDelete.activeSheetId).not.toBe(created.sheetCode);
        expect(allCodesAfterDelete).not.toContain(created.sheetCode);
    });

    it('preserves active sheet when using legacy saveUserSheets API', async () => {
        await createUserData();
        const active = await getUserData('data');

        await saveUserSheets([
            { sheetCode: 'legacy-1', nome: 'Legado 1', nivel: 1, updatedAt: 11 },
            { sheetCode: active.sheetCode, nome: 'Nao deve sobrescrever ativa', nivel: 99, updatedAt: 99 },
        ]);

        const activeAfter = await getUserData('data');
        const inactive = await getUserData('sheets');

        expect(activeAfter.sheetCode).toBe(active.sheetCode);
        expect(inactive).toHaveLength(1);
        expect(inactive[0].sheetCode).toBe('legacy-1');
    });

    it('does not resurrect deleted sheets from stale sheetsMap', async () => {
        await createUserData();
        const active = await getUserData('data');
        const created = await createUserSheet('Temporaria');

        firestoreState.docs.set(getRootDocPath(), {
            ...firestoreState.docs.get(getRootDocPath()),
            sheetsMap: {
                [active.sheetCode]: active,
                [created.sheetCode]: created,
            },
        });

        await deleteUserSheet(created.sheetCode);
        const afterDelete = await getUserData('sheets');

        expect(afterDelete.some((sheet) => sheet.sheetCode === created.sheetCode)).toBe(false);
    });
});
