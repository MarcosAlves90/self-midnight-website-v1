import LZString from "lz-string";
import { auth } from "../../firebase.js";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function decompressData(obj) {
    const COMPRESSION_SIGNATURE = "[LZ]";
    const EXCLUDED_KEYS = ["skillsArray", "annotationsArray", "itemsArray", "sheetCode"];

    function isCompressed(value) {
        if (typeof value !== 'string') return false;

        // Verifique a assinatura explícita de compressão
        if (value.startsWith(COMPRESSION_SIGNATURE)) {
            return true;
        }

        // Heurísticas para strings potencialmente comprimidas sem assinatura
        try {
            const decompressed = LZString.decompressFromUTF16(value);
            if (!decompressed) return false;

            // Valide se a descompressão parece plausível
            const reCompressed = LZString.compressToUTF16(decompressed);
            return reCompressed === value; // A string original deve ser igual ao recompresso
        } catch {
            return false; // Não é uma string comprimida válida
        }
    }

    function determineType(value) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return 'array';
            if (parsed && typeof parsed === 'object') return 'object';
            return typeof parsed;
        } catch {
            return 'string'; // Se não puder ser parseado, é apenas uma string
        }
    }

    function recursivelyProcess(input) {
        if (typeof input === 'object' && input !== null) {
            const result = Array.isArray(input) ? [] : {};
            for (const key in input) {
                if (Object.prototype.hasOwnProperty.call(input, key)) {
                    const value = input[key];
                    if (isCompressed(value) && !EXCLUDED_KEYS.includes(key)) {
                        const withoutSignature = value.startsWith(COMPRESSION_SIGNATURE)
                            ? value.slice(COMPRESSION_SIGNATURE.length)
                            : value;
                        const decompressedValue = LZString.decompressFromUTF16(withoutSignature);
                        const valueType = determineType(decompressedValue);
                        if (valueType === 'object' || valueType === 'array') {
                            result[key] = recursivelyProcess(JSON.parse(decompressedValue));
                        } else {
                            result[key] = valueType === 'string' ? decompressedValue : JSON.parse(decompressedValue);
                        }
                    } else if (EXCLUDED_KEYS.includes(key)) {
                        if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                            result[key] = JSON.parse(value);
                        } else {
                            result[key] = value;
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        result[key] = recursivelyProcess(value);
                    } else {
                        result[key] = value;
                    }
                }
            }
            return result;
        }
        return input;
    }

    return recursivelyProcess(obj);
}

export const clearLocalStorage = () => {
    localStorage.clear();
};

export const returnLocalStorageData = () => {
    return Object.fromEntries([...Array(localStorage.length).keys()].map(i => [localStorage.key(i), localStorage.getItem(localStorage.key(i))]));
};

export const useSignOut = () => {
    const navigate = useNavigate();
    return useCallback(async () => {
        try {
            await auth.signOut();
            clearLocalStorage();
            console.log('Sign-out successful.');
        } catch (error) {
            console.error('Error during sign-out:', error);
        } finally {
            navigate('/login');
        }
    }, [navigate]);
};

