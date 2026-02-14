import { createContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [isCompact, setIsCompact] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCompact') === 'true';
        }
        return false;
    });

    const toggleCompact = useCallback(() => {
        setIsCompact(prev => {
            const newValue = !prev;
            localStorage.setItem('sidebarCompact', String(newValue));
            return newValue;
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--sidebar-width', isCompact ? '80px' : '280px');
        root.style.setProperty('--sidebar-compact', isCompact ? '1' : '0');
    }, [isCompact]);

    return (
        <SidebarContext.Provider value={{ isCompact, toggleCompact }}>
            {children}
        </SidebarContext.Provider>
    );
}

SidebarProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


