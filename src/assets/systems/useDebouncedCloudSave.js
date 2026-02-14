import { useEffect, useRef } from 'react';

export function useDebouncedCloudSave(data, shouldSave, saveFn, delay = 500) {
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!shouldSave) return undefined;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            saveFn(data);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [data, shouldSave, saveFn, delay]);
}
