import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    // Check if user is already logged in (token exists)
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${apiUrl}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser({ ...res.data, token });
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error.response?.data || error.message);
                setIsAuthenticated(false);
                setUser(null);
            }
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Login function
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser({
            id: userData.id,
            userName: userData.username,
            email: userData.email,
            profilePicture: userData.profile_picture, // Ensure profilePicture is set
            token
        });
        setIsAuthenticated(true);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                setIsAuthenticated,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };