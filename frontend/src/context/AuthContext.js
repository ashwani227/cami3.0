import React, { createContext, useCallback, useState } from 'react';
import jwt_decode from "jwt-decode";
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [isLogin, setLogin] = useState(undefined)
    const [user, setUser] = useState({})

    const isTokenExpired = useCallback(() => {
        let loggedInUser = localStorage.getItem("token");
        if (loggedInUser) {
            let decoded = jwt_decode(loggedInUser);

            if (decoded?.email) {
                setUser({ email: decoded?.email })
            }

            if (new Date((decoded.exp * 1000)) > new Date()) {
                return false
            }
        }

        return true;
    }, [])

    React.useEffect(() => {
        setLogin(!isTokenExpired())
    }, [isTokenExpired]);

    const updateLoginStatus = (status, data = undefined) => {
        setLogin(status)
        if (data && data?.email) {
            setUser({ email: data?.email })
        }
    }

    const authenticate = async (type, values) => {
        try {
            return await axios.post(`https://cami.med.ualberta.ca/authentication/${type}/`, values);
        } catch (error) {
            console.error(error);
        }
        
        // return await fetch(`https://cami.med.ualberta.ca/authentication/${type}/`, {
        //     method: 'post',
        //     headers: { 'content-type': 'application/json' },
        //     body: JSON.stringify(values)
        // }).then(response => {
        //     return response.json();
        // }).catch(error => {
        //     console.error(error);
        // });
    }


    const logout = () => {

        localStorage.removeItem('token');
        updateLoginStatus(false)
        setUser({})
    }


    return (
        <AuthContext.Provider value={{
            user: user,
            isLogin: isLogin,
            updateLoginStatus: updateLoginStatus,
            authenticate: authenticate,
            logout: logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;