/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useMemo, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [userData, setUserData] = useState({ nivel: 0 });
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={useMemo(() => ({ userData, setUserData, user, setUser }), [userData, user])}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

