import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const useAutoLogout = (token, logout) => {
    const navigate = useNavigate();
    useEffect(() => {
        let timer;
    if (!token) {
        return; 
    }
    
    try {
        const decoded = jwtDecode(token);
        const exp = decoded.exp * 1000; // Convert to milliseconds
        const timeout = exp - Date.now();

        if (timeout <= 0) {
            logout();
            navigate("/login");
        }
        else{
          timer = setTimeout(() => {
              logout();
              navigate("/login");
          }, timeout);
        }
    } catch (error) {
        console.error('Error decoding token:', error);
    }

    return () => {
        clearTimeout(timer);
    };
  }, [token, logout, navigate]);
}
export default useAutoLogout;