import { CircleUser , ScrollText , X  } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FcGoogle } from "react-icons/fc";
import { LuEyeClosed } from "react-icons/lu";
import { LuEye } from "react-icons/lu";
import { IoArrowBack } from "react-icons/io5";
import { useGoogleLogin  } from '@react-oauth/google'
import axiosInstance from '../../utils/axiosInstance';
import OTP from '../../components/auth/OTP';

const Login = () => {
    const [state , setState] = useState('login')
    const [isOtpModelOpen , setIsOtpModelOpen] = useState(false)
    const [otp , setOtp] = useState('')
    const [email , setEmail] = useState('')
    const [username , setUsername] = useState('')
    const [password , setPassword] = useState('')
    const navigate = useNavigate()
    const [showPassword , setShowPassword] = useState(false)
    const [loading , setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        if(state === 'login') {
            try {
                const response = await axiosInstance.post(`/auth/login`, { email, password })

                if(response.data.success) {
                    toast.success('Logged in successfully!')
                    navigate('/')
                }else {
                    toast.error('Error in logging in')
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error while logging in')
                console.log(error)
            } finally{
                setEmail('')
                setPassword('')
                setLoading(false)
            }
        }else{
            try {
                const response = await axiosInstance.post( `/auth/send-otp`, { email })

                if(response.data.success) {
                    setIsOtpModelOpen(true)
                    toast.success('OTP sent successfully!')
                }else {
                    toast.error('Error in sending OTP')
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error while sending OTP')
                console.log(error)
            } finally{
                setLoading(false)
            }
        }
    }

    const verifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axiosInstance.post( `/auth/verify-otp`, { email, otp, username , password })

            if(response.data.success) {
                toast.success('Account created successfully!')
                setIsOtpModelOpen(false)
                setUsername('')
                setEmail('')
                setPassword('')
                setOtp('')
                setState('login')
                navigate('/')
            }else {
                toast.error('Error in verifying OTP')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error while verifying OTP')
            console.log(error)
        } finally{
            setLoading(false)
        }
    }

    // Handle OTP change from OTP component
    const handleOtpChange = (otpValue) => {
        setOtp(otpValue);
    }

    // Google Auth 
    // This function handles the response from Google
    const handleGoogleLoginSuccess = async (tokenResponse) => {
        const accessToken = tokenResponse.access_token;

        try {
            setLoading(true);
            // Send the access token to your backend
            const response = await axiosInstance.post('/auth/google', {
                googleAccessToken: accessToken
            });

            if (response.data.success) {
                toast.success('Logged in with Google!');
                navigate('/');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };
    // Initialize the hook
    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: (err) => console.log('Login Failed', err)
    });



  return (
    <div className='bg-[#f3f5f7] h-screen flex flex-col items-center justify-center relative p-5'>

        <div className='absolute top-4 left-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-800 hover:underline transition-all duration-150' onClick={() => navigate('/')}>
            <IoArrowBack size={18} className='inline-block mr-1' />
        </div>

        <div className='bg-[#f8f8f8] rounded-2xl border border-gray-100 shadow-lg w-full max-w-md'>
            <div className='p-6 bg-white rounded-2xl border border-gray-200 shadow-xs w-full flex flex-col items-center '>
                <div className='w-full flex flex-col items-center'>
                    {/* Login - signup switch */}
                    <div className='flex justify-center items-center bg-slate-200/60 rounded-md p-1 w-fit'>
                        <div onClick={()=>setState('login')} className={`px-6 py-1 rounded-md cursor-pointer space-x-1 flex items-center justify-center ${state === 'login' ? 'bg-white' : ''}`}>
                            <ScrollText size={22}/>
                            <span className='text-sm font-semibold hover:scale-105 transition-all duration-250'>
                                Login
                            </span>
                        </div>
                        <div onClick={()=>setState('signup')} className={`px-6 py-1 rounded-md cursor-pointer space-x-1 flex items-center justify-center ${state === 'signup' ? 'bg-white' : ''}`}>
                            <CircleUser size={22 }/>
                            <span className='text-sm font-semibold hover:scale-105 transition-all duration-250'>
                                SignUp
                            </span>
                        </div>
                    </div>

                    <div className='h-10'></div>

                    {/* Login Form */}
                    <div className='w-full'>
                        <form onSubmit={e=>handleSubmit(e)}>
                            { state === 'signup' &&
                                <>
                                    <label htmlFor="username" className='text-sm font-medium text-gray-700'>Username</label>
                                    <div className='bg-[#f3f5f7] p-0.5 rounded-md w-full mt-1 mb-3'>
                                        <input type="text" name='username' value={username} onChange={e => setUsername(e.target.value)} required placeholder='Enter your username' className='px-3 py-1.5 w-full bg-white rounded-md outline-none border-none placeholder:text-sm text-sm placeholder:font-medium font-medium placeholder:text-gray-400'/>
                                    </div>
                                </>
                            }

                            {/* Email Address */}
                            <label htmlFor="email" className='text-sm font-medium text-gray-700'>Email address</label>
                            <div className='bg-[#f3f5f7] p-0.5 rounded-md w-full mt-1 mb-3'>
                                <input type="email" name='email' value={email} onChange={e => setEmail(e.target.value)} required placeholder='Enter your email address' className='px-3 py-1.5 w-full bg-white rounded-md outline-none border-none placeholder:text-sm text-sm placeholder:font-medium font-medium placeholder:text-gray-400'/>
                            </div>

                            {/* Password */}
                            <div className='w-full flex items-center justify-between'>
                                <label htmlFor="password" className='text-sm font-medium text-gray-700'>Password</label>
                                {state === 'login' && <span onClick={() => navigate('/forget-password')} className='text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 hover:underline hover:scale-105 transition-all duration-250'>Forget password?</span>}
                            </div>
                            <div className='relative bg-[#f3f5f7] p-0.5 rounded-md w-full mt-1 mb-3'>
                                <input type={showPassword ? 'text' : 'password'} name='password' value={password} onChange={e => setPassword(e.target.value)} required placeholder='Enter your password' className='password-input px-3 py-1.5 w-full bg-white rounded-md outline-none border-none placeholder:text-sm text-sm placeholder:font-medium font-medium placeholder:text-gray-400'/>
                                <span onClick={() => setShowPassword(!showPassword)} className='absolute right-2.5 top-[30%] cursor-pointer'>
                                    {showPassword ? <LuEyeClosed size={16} className='text-gray-500' /> : <LuEye size={18} className='text-gray-500'/>}
                                </span>
                            </div>

                            <button type='submit' disabled={loading} className='w-full py-2.5 mt-6 flex items-center disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none justify-center bg-linear-to-tl from-[#31353a] via-black/80 to-black rounded-md text-white font-medium cursor-pointer hover:scale-105 transition-all duration-250'>
                                {state === 'login' ? 'Login' : 'Sign Up'}
                            </button>
                        </form>
                    </div>
                    
                    <div className='w-full flex items-center justify-center my-5'>
                        <div className='bg-gray-300 w-full h-0.5'></div>
                        <div className='text-gray-500 text-xs font-base mx-2'>OR</div>
                        <div className='bg-gray-300 w-full h-0.5'></div>
                    </div>

                    <div onClick={()=>googleLogin()} className='w-full py-2 flex items-center justify-center space-x-2 border-2 border-gray-300 text-black rounded-md font-medium cursor-pointer hover:scale-105 transition-all duration-250'>
                        <FcGoogle size={18}/>
                        <span className='text-sm '>Continue with Google</span>
                    </div>

                </div>
            </div>

            <div className='text-sm flex items-center justify-center my-4'>
                {state === 'login' ? <>Don't have an account? <span onClick={() => setState('signup')} className='text-sm ml-1 font-medium cursor-pointer hover:underline hover:scale-105 transition-all duration-250'>Sign Up</span></> : 
                <>Already have an account? <span onClick={()=>setState('login')} className='text-sm ml-1 font-medium cursor-pointer hover:underline hover:scale-105 transition-all duration-250'>Login</span></>}
            </div>
        </div>

        {isOtpModelOpen && 
            <div onClick={()=>setIsOtpModelOpen(false)} className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
                <div onClick={e=>e.stopPropagation()} className='relative w-full max-w-md bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-slate-900/50 py-14'>
                    <button onClick={()=>setIsOtpModelOpen(false)} className='absolute top-4 right-4 cursor-pointer'>
                        <X />
                    </button>

                    <div className='flex items-center justify-center'>
                        <h2 className='text-xl font-semibold mb-4'>Enter OTP</h2>
                    </div>

                    <form method="POST" onSubmit={verifyOtp}>
                        <OTP value={otp} onChange={handleOtpChange} />
                        <button disabled={loading} type='submit' className='w-full py-2 mt-4 bg-linear-to-tl from-[#31353a] disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center rounded-mdvia-black/80 to-black rounded-md text-white hover:scale-105 cursor-pointer transition-all duration-300'>Verify OTP</button>
                    </form>
                </div>
            </div>
        } 
    </div>
  )
}

export default Login