import React from 'react';
import api from '../utils/axios';

export const AuthContext = React.createContext(null);

export const AuthProvider = ({children}) => {
    const [user,setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(()=>{
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    },[]);

    const login = async(email,password)=>{
        try{
            const {data} = await api.post('./auth/login',{email,password});
            const authenticatedUser = data.user || data;
            setUser(authenticatedUser);
            localStorage.setItem("user",JSON.stringify(authenticatedUser));
            localStorage.setItem("token",authenticatedUser.token);
            return authenticatedUser;
        }
        catch(err){
            const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
            const loginError = new Error(message);
            loginError.needsVerification = message.toLowerCase().includes('not verified');
            console.error("login failed",message);
            throw loginError;
        }
    };
    const register = async(name,email,password)=>{
        try{
            const {data} = await api.post('./auth/register',{name,email,password});
            setUser(data);
            return data;
        }
        catch(err){
        console.error("Registration failed",err);
        throw err;
        }
    }
    const verifyOTP = async(email, otp)=>{
        try{
            const{data} = await api.post('./auth/verifyOTP',{email, otp});
            setUser(data);
            localStorage.setItem("user",JSON.stringify(data));
            localStorage.setItem("token",data.token);
            return data;
        }
        catch(err){
            const message = err.response?.data?.message || err.message || 'OTP verification failed. Please try again.';
            console.error("OTP Verification failed",message);
            throw new Error(message);
        }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };
    return(
        <AuthContext.Provider value = {{user,loading,login,logout,verifyOTP,register}}>
        {children}
        </AuthContext.Provider>
    );
};
