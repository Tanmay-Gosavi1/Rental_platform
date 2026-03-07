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
            }else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    
    const login = (userData) => { //
        setUser(userData);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout" , {});
        setUser(null);
    };

    useEffect(()=>{
        checkAuthStatus()
    },[])

    const isAuthenticated = !!user; // Convert user object to boolean

    const value = {
        user ,
        isAuthenticated, // Convert user object to boolean
        setUser ,
        loading ,
        login ,
        logout ,
        setLoading
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}