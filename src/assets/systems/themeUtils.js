export const THEME_STORAGE_KEY = 'tmw-theme-preference';
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';

const VALID_THEMES = new Set([THEME_LIGHT, THEME_DARK]);

const normalizeTheme = (theme) => (VALID_THEMES.has(theme) ? theme : THEME_LIGHT);

export const getStoredThemePreference = () => {
    if (typeof window === 'undefined') return THEME_LIGHT;
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
};

export const getCurrentThemePreference = () => {
    if (typeof document === 'undefined') return THEME_LIGHT;
    const attrTheme = document.documentElement.getAttribute('data-theme');
    if (VALID_THEMES.has(attrTheme)) return attrTheme;
    return getStoredThemePreference();
};

export const applyThemePreference = (theme) => {
    const normalized = normalizeTheme(theme);
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', normalized);
    }
    return normalized;
};

export const setThemePreference = (theme) => {
    const normalized = applyThemePreference(theme);
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
    }
    return normalized;
};

export const bootstrapThemePreference = () => {
    const stored = getStoredThemePreference();
    return applyThemePreference(stored);
};
