import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from '../firebase.js';
import { decompressData } from '../assets/systems/SaveLoad.jsx';

const ROOT_COLLECTION = 'userData';
const SCHEMA_VERSION = 2;
const DEFAULT_SHEET_NAME = 'Ficha principal';

const now = () => Date.now();

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getAuthenticatedUserId = () => {
    const user = auth.currentUser;
    return user?.uid || null;
};

const getRootDocRef = (userId) => doc(db, ROOT_COLLECTION, userId);

const safeName = (value) => {
    if (typeof value !== 'string') return 'Ficha sem nome';
    const normalized = value.trim();
    return normalized || 'Ficha sem nome';
};

const toFiniteNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSheetData = (rawData, forcedSheetCode = null, options = {}) => {
    const shouldHydrate = options.hydrate !== false;
    const hydrated = isObject(rawData)
        ? (shouldHydrate ? decompressData(rawData) : rawData)
        : {};
    const fallbackCode = forcedSheetCode || uuidv4();
    const sheetCode = typeof hydrated.sheetCode === 'string' && hydrated.sheetCode.trim()
        ? hydrated.sheetCode
        : fallbackCode;
    const existingCreatedAt = toFiniteNumber(hydrated.createdAt, 0);
    const existingUpdatedAt = toFiniteNumber(hydrated.updatedAt, existingCreatedAt || 0);
    const baseTimestamp = existingUpdatedAt || existingCreatedAt || now();

    return {
        ...hydrated,
        sheetCode: forcedSheetCode || sheetCode,
        nome: safeName(hydrated.nome),
        nivel: toFiniteNumber(hydrated.nivel, 0),
        createdAt: existingCreatedAt || baseTimestamp,
        updatedAt: existingUpdatedAt || baseTimestamp,
    };
};

const dedupeByLatestUpdate = (sheets, options = {}) => {
    const shouldHydrate = options.hydrate !== false;
    const byCode = new Map();
    sheets.filter(Boolean).forEach((sheet) => {
        const normalized = normalizeSheetData(sheet, null, { hydrate: shouldHydrate });
        const previous = byCode.get(normalized.sheetCode);
        if (!previous || normalized.updatedAt >= previous.updatedAt) {
            byCode.set(normalized.sheetCode, normalized);
        }
    });
    return Array.from(byCode.values());
};

const sortByUpdatedAtDesc = (sheets) =>
    [...sheets].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

const makeDefaultSheet = () => {
    const timestamp = now();
    return {
        sheetCode: uuidv4(),
        nome: DEFAULT_SHEET_NAME,
        nivel: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
};

const getSheetsFromPayload = (payload) => {
    if (!isObject(payload)) return [];

    const fromData = isObject(payload.data) ? [payload.data] : [];
    const fromSheets = Array.isArray(payload.sheets) ? payload.sheets.filter(isObject) : [];
    const preferredSource = [...fromData, ...fromSheets];
    if (preferredSource.length > 0) {
        return dedupeByLatestUpdate(preferredSource, { hydrate: true });
    }

    const fromMap = isObject(payload.sheetsMap) ? Object.values(payload.sheetsMap).filter(isObject) : [];
    return dedupeByLatestUpdate(fromMap, { hydrate: true });
};

const resolveActiveSheetId = (payload, sheets) => {
    if (!sheets.length) return null;

    const candidateIds = [
        payload?.activeSheetId,
        payload?.data?.sheetCode,
    ].filter((id) => typeof id === 'string' && id.trim());

    for (const id of candidateIds) {
        if (sheets.some((sheet) => sheet.sheetCode === id)) return id;
    }

    return sheets[0].sheetCode;
};

const buildWorkspace = (allSheets, activeSheetId) => {
    const activeSheet = allSheets.find((sheet) => sheet.sheetCode === activeSheetId) || allSheets[0];
    const inactiveSheets = allSheets.filter((sheet) => sheet.sheetCode !== activeSheet.sheetCode);
    return {
        activeSheetId: activeSheet.sheetCode,
        activeSheet,
        inactiveSheets,
        allSheets,
    };
};

const persistWorkspace = async (userId, workspace, extraPatch = {}) => {
    const normalizedSheets = sortByUpdatedAtDesc(
        dedupeByLatestUpdate(workspace.allSheets, { hydrate: false }),
    );
    const normalizedWorkspace = buildWorkspace(normalizedSheets, workspace.activeSheetId);

    await setDoc(getRootDocRef(userId), {
        schemaVersion: SCHEMA_VERSION,
        activeSheetId: normalizedWorkspace.activeSheetId,
        data: normalizedWorkspace.activeSheet,
        sheets: normalizedWorkspace.inactiveSheets,
        sheetsMap: null,
        updatedAt: now(),
        ...extraPatch,
    }, { merge: true });

    return normalizedWorkspace;
};

const ensureWorkspace = async (userId) => {
    const rootSnapshot = await getDoc(getRootDocRef(userId));
    const rootPayload = rootSnapshot.exists() ? rootSnapshot.data() : {};
    let allSheets = getSheetsFromPayload(rootPayload);

    if (!allSheets.length) allSheets = [makeDefaultSheet()];
    allSheets = sortByUpdatedAtDesc(dedupeByLatestUpdate(allSheets, { hydrate: false }));

    const activeSheetId = resolveActiveSheetId(rootPayload, allSheets);
    const workspace = buildWorkspace(allSheets, activeSheetId);
    const needsNormalization =
        rootPayload?.schemaVersion !== SCHEMA_VERSION ||
        rootPayload?.activeSheetId !== workspace.activeSheetId;

    if (needsNormalization) {
        return persistWorkspace(userId, workspace, { migratedAt: now() });
    }

    return workspace;
};

const upsertSheet = (allSheets, nextSheet) => {
    const withoutCurrent = allSheets.filter((sheet) => sheet.sheetCode !== nextSheet.sheetCode);
    return [...withoutCurrent, nextSheet];
};

export const ensureUserWorkspace = async () => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;
    return ensureWorkspace(userId);
};

export const getWorkspace = async () => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;
    return ensureWorkspace(userId);
};

export const saveActiveSheet = async (data) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    const workspace = await ensureWorkspace(userId);
    const timestamp = now();
    const nextActiveSheet = normalizeSheetData(
        {
            ...data,
            createdAt: workspace.activeSheet?.createdAt || timestamp,
            updatedAt: timestamp,
        },
        workspace.activeSheetId,
        { hydrate: false },
    );
    const nextSheets = upsertSheet(workspace.allSheets, nextActiveSheet);

    const nextWorkspace = {
        ...workspace,
        activeSheetId: nextActiveSheet.sheetCode,
        allSheets: nextSheets,
    };
    return persistWorkspace(userId, nextWorkspace);
};

export const switchActiveSheet = async (targetSheetCode, currentActiveData) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    const workspace = await ensureWorkspace(userId);
    const targetSheet = workspace.allSheets.find((sheet) => sheet.sheetCode === targetSheetCode);
    if (!targetSheet) return null;

    const timestamp = now();
    let nextSheets = workspace.allSheets;
    if (isObject(currentActiveData)) {
        const currentSnapshot = normalizeSheetData(
            {
                ...currentActiveData,
                createdAt: workspace.activeSheet?.createdAt || timestamp,
                updatedAt: timestamp,
            },
            workspace.activeSheetId,
            { hydrate: false },
        );
        nextSheets = upsertSheet(nextSheets, currentSnapshot);
    }

    const nextWorkspace = {
        ...workspace,
        activeSheetId: targetSheetCode,
        allSheets: nextSheets,
    };
    const persistedWorkspace = await persistWorkspace(userId, nextWorkspace);
    return persistedWorkspace.activeSheet;
};

export const createSheet = async (name) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    const workspace = await ensureWorkspace(userId);
    const timestamp = now();
    const newSheet = normalizeSheetData({
        sheetCode: uuidv4(),
        nome: name,
        nivel: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    }, null, { hydrate: false });

    const nextWorkspace = {
        ...workspace,
        allSheets: [...workspace.allSheets, newSheet],
    };
    await persistWorkspace(userId, nextWorkspace);
    return newSheet;
};

const buildDuplicatedName = (baseName, existingNames) => {
    const root = `${baseName} (copia)`;
    if (!existingNames.has(root)) return root;

    let index = 2;
    while (existingNames.has(`${root} ${index}`)) {
        index += 1;
    }
    return `${root} ${index}`;
};

export const duplicateSheet = async (sheetCode) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    const workspace = await ensureWorkspace(userId);
    const source = workspace.allSheets.find((sheet) => sheet.sheetCode === sheetCode);
    if (!source) return null;

    const timestamp = now();
    const existingNames = new Set(workspace.allSheets.map((sheet) => safeName(sheet.nome)));
    const duplicated = normalizeSheetData({
        ...source,
        sheetCode: uuidv4(),
        nome: buildDuplicatedName(safeName(source.nome), existingNames),
        createdAt: timestamp,
        updatedAt: timestamp,
    }, null, { hydrate: false });

    const nextWorkspace = {
        ...workspace,
        allSheets: [...workspace.allSheets, duplicated],
    };
    await persistWorkspace(userId, nextWorkspace);
    return duplicated;
};

export const deleteSheet = async (sheetCode) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return null;

    const workspace = await ensureWorkspace(userId);
    const exists = workspace.allSheets.some((sheet) => sheet.sheetCode === sheetCode);
    if (!exists) return workspace;

    let nextSheets = workspace.allSheets.filter((sheet) => sheet.sheetCode !== sheetCode);
    if (!nextSheets.length) nextSheets = [makeDefaultSheet()];

    const sorted = sortByUpdatedAtDesc(nextSheets);
    const nextActiveSheetId = workspace.activeSheetId === sheetCode
        ? sorted[0].sheetCode
        : workspace.activeSheetId;

    const nextWorkspace = {
        ...workspace,
        activeSheetId: nextActiveSheetId,
        allSheets: sorted,
    };

    return persistWorkspace(userId, nextWorkspace);
};

export const replaceInactiveSheets = async (inactiveSheets) => {
    const userId = getAuthenticatedUserId();
    if (!userId) return [];

    const workspace = await ensureWorkspace(userId);
    const activeSheetId = workspace.activeSheetId;
    const normalizedInactive = dedupeByLatestUpdate(
        (Array.isArray(inactiveSheets) ? inactiveSheets : [])
            .filter(isObject)
            .filter((sheet) => sheet.sheetCode !== activeSheetId)
            .map((sheet) => normalizeSheetData(sheet, null, { hydrate: false })),
        { hydrate: false },
    );

    const nextWorkspace = {
        ...workspace,
        allSheets: [workspace.activeSheet, ...normalizedInactive],
    };
    const persisted = await persistWorkspace(userId, nextWorkspace);
    return persisted.inactiveSheets;
};
