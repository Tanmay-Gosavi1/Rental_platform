import { createContext , useContext , useState , useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext(null)

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [user , setUser] = useState(null)
    const [loading , setLoading] = useState(true)

    const checkAuthStatus = async () => {
        try {
            const res = await axiosInstance.get("/user/profile")
            if(res.data.success) {
                setUser(res.data.user) 
            } else {
                setUser(null)
            }
        } catch (error) {
            console.log("User not authenticated")
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    
    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout", {});
        } catch (error) {
            console.log("Logout error:", error)
        }
        setUser(null);
    };

    const refreshUser = async () => {
        await checkAuthStatus();
    };

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isCustomer = user?.role === 'customer';

    const value = {
        user,
        isAuthenticated,
        isAdmin,
        isCustomer,
        setUser,
        loading,
        login,
        logout,
        refreshUser,
        setLoading
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}