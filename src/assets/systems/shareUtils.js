import LZString from 'lz-string';

const SHARE_PREFIX = 'TMW2';
const SHARE_PATTERN = /^TMW2:(SKILL|ITEM):(.+)$/;

const asText = (value, fallback = '') => (value === null || value === undefined ? fallback : String(value));

const pickFields = (source, fields) => fields.reduce((acc, field) => {
    acc[field] = source?.[field];
    return acc;
}, {});

const SKILL_FIELDS = [
    'title',
    'domain',
    'content',
    'circle',
    'type',
    'execution',
    'range',
    'target',
    'duration',
    'resistance',
    'area',
    'spent',
    'image',
];

const ITEM_FIELDS = [
    'title',
    'content',
    'type',
    'image',
    'quantity',
];

const SKILL_KEYS = {
    title: 't',
    domain: 'd',
    content: 'c',
    circle: 'ci',
    type: 'ty',
    execution: 'e',
    range: 'r',
    target: 'ta',
    duration: 'du',
    resistance: 're',
    area: 'a',
    spent: 's',
    image: 'i',
};

const ITEM_KEYS = {
    title: 't',
    content: 'c',
    type: 'ty',
    image: 'i',
    quantity: 'q',
};

const SKILL_DEFAULTS = {
    title: 'Skill compartilhada',
    domain: '',
    content: '',
    circle: '1',
    type: '1',
    execution: '1',
    range: '1',
    target: '',
    duration: '',
    resistance: '',
    area: '',
    spent: '',
    image: '',
};

const ITEM_DEFAULTS = {
    title: 'Item compartilhado',
    content: '',
    type: '',
    image: '',
    quantity: '',
};

export const normalizeSkill = (skill) => {
    const raw = pickFields(skill, SKILL_FIELDS);
    return {
        title: asText(raw.title, SKILL_DEFAULTS.title),
        domain: asText(raw.domain, SKILL_DEFAULTS.domain),
        content: asText(raw.content, SKILL_DEFAULTS.content),
        circle: asText(raw.circle, SKILL_DEFAULTS.circle),
        type: asText(raw.type, SKILL_DEFAULTS.type),
        execution: asText(raw.execution, SKILL_DEFAULTS.execution),
        range: asText(raw.range, SKILL_DEFAULTS.range),
        target: asText(raw.target, SKILL_DEFAULTS.target),
        duration: asText(raw.duration, SKILL_DEFAULTS.duration),
        resistance: asText(raw.resistance, SKILL_DEFAULTS.resistance),
        area: asText(raw.area, SKILL_DEFAULTS.area),
        spent: asText(raw.spent, SKILL_DEFAULTS.spent),
        image: asText(raw.image, SKILL_DEFAULTS.image),
    };
};

export const normalizeItem = (item) => {
    const raw = pickFields(item, ITEM_FIELDS);
    return {
        title: asText(raw.title, ITEM_DEFAULTS.title),
        content: asText(raw.content, ITEM_DEFAULTS.content),
        type: asText(raw.type, ITEM_DEFAULTS.type),
        image: asText(raw.image, ITEM_DEFAULTS.image),
        quantity: asText(raw.quantity, ITEM_DEFAULTS.quantity),
    };
};

const compactObject = (data, keyMap, defaults) => {
    const compacted = {};
    Object.keys(keyMap).forEach((field) => {
        const value = data[field];
        if (value === undefined) return;
        if (value === defaults[field]) return;
        if (value === '' && defaults[field] === '') return;
        compacted[keyMap[field]] = value;
    });
    return compacted;
};

const expandObject = (data, keyMap) => {
    const expanded = {};
    const reverseMap = Object.entries(keyMap).reduce((acc, [full, short]) => {
        acc[short] = full;
        return acc;
    }, {});
    Object.keys(data || {}).forEach((key) => {
        const fullKey = reverseMap[key] || key;
        expanded[fullKey] = data[key];
    });
    return expanded;
};

export const buildShareCode = (type, data) => {
    const normalized = type === 'ITEM' ? normalizeItem(data) : normalizeSkill(data);
    const compacted = type === 'ITEM'
        ? compactObject(normalized, ITEM_KEYS, ITEM_DEFAULTS)
        : compactObject(normalized, SKILL_KEYS, SKILL_DEFAULTS);
    const payload = { v: 2, type, data: compacted };
    const json = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return `${SHARE_PREFIX}:${type}:${compressed}`;
};

export const parseShareCode = (text) => {
    if (!text) return null;
    const trimmed = text.trim();
    const match = SHARE_PATTERN.exec(trimmed);

    if (match) {
        const [, type, compressed] = match;
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (!json) throw new Error('Codigo de compartilhamento invalido.');
        const payload = JSON.parse(json);
        if (payload?.type && payload.type !== type) {
            throw new Error('Tipo de compartilhamento invalido.');
        }
        const rawData = payload?.data ?? payload;
        const expanded = type === 'ITEM'
            ? expandObject(rawData, ITEM_KEYS)
            : expandObject(rawData, SKILL_KEYS);
        const normalized = type === 'ITEM' ? normalizeItem(expanded) : normalizeSkill(expanded);
        return { type, data: normalized };
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const data = JSON.parse(trimmed);
        const raw = data?.data ?? data;
        if (data?.type === 'ITEM') return { type: 'ITEM', data: normalizeItem(raw) };
        if (data?.type === 'SKILL') return { type: 'SKILL', data: normalizeSkill(raw) };
        return { type: null, data: raw };
    }

    throw new Error('Formato de compartilhamento nao reconhecido.');
};
