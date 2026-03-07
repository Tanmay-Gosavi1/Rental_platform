import React , {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { toast } from 'react-hot-toast'
import { X } from 'lucide-react'
import { IoIosArrowBack } from "react-icons/io";
import OTP from '../../components/auth/OTP'

const ForgetPassword = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isOtpModelOpen, setIsOtpModelOpen] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res = await axiosInstance.post(`/auth/send-reset-password-otp`, { email })
      if(res.data.success) {
        toast.success("OTP sent successfully!")
        setIsOtpModelOpen(true)
      }
    }catch(error) {
      toast.error(error.response?.data?.message || 'Error while sending OTP')
    }finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    // Validate OTP length
    if (otp.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }
    setLoading(true)
    try{
      const res = await axiosInstance.post(`/auth/reset-password`, { email, otp, newPassword })

      if(res.data.success) {
        toast.success("Password reset successfully!")
        setIsOtpModelOpen(false)
        navigate('/login')
      }else {
        toast.error("Error while resetting password")
      }
    }catch(error) {
      toast.error(error.response?.data?.message || 'Error while resetting password')
    }finally {
      setLoading(false)
    }
  }

  // Handle OTP change from OTP component
  const handleOtpChange = (otpValue) => {
    setOtp(otpValue);
  }
  return (
    <div className='relative bg-[#f3f5f7] h-screen flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-5 flex flex-col items-center border border-gray-200 shadow-lg'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>Forget Password</h1>
        <div className='w-full'>
          <form action="" method="post" onSubmit={handleSendOtp} className='flex flex-col w-full'>
            {/* Email Address */}
              <label htmlFor="email" className='text-sm font-medium text-gray-700'>Email address</label>
              <div className='bg-[#f3f5f7] p-0.5 rounded-md w-full mt-1 mb-3 '>
                  <input type="email" name='email' value={email} onChange={e => setEmail(e.target.value)} required placeholder='Enter your email address' className='px-3 py-1.5 w-full bg-white rounded-md outline-none border-none placeholder:text-sm text-sm placeholder:font-medium font-medium placeholder:text-gray-400'/>
              </div>

              <button type='submit' disabled={loading} className='w-full my-2 py-2 bg-linear-to-tl from-[#31353a] via-black/80 to-black disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-medium rounded-md hover:scale-105 transition-all duration-300 cursor-pointer'>Send Otp</button>
          </form>
        </div>
      </div>
      <div className='text-sm font-semibold text-gray-500 cursor-pointer hover:text-gray-700 flex items-center justify-center hover:scale-105 transition-all duration-300 mt-4' onClick={() => navigate('/login')}>
        <IoIosArrowBack className='mx-1' size={16}/>
        <span>Back to login</span>
      </div>

      {/* OTP Modal */}
      {isOtpModelOpen && (
        <div onClick={()=>setIsOtpModelOpen(false)} className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div onClick={e => e.stopPropagation()} className='relative bg-white rounded-lg p-6 w-full max-w-sm'>
            <div className='absolute top-2 right-2'>
              <X onClick={() => setIsOtpModelOpen(false)} className='absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gray-700' size={18}/>
            </div>
            <h2 className='text-xl font-bold text-gray-800 mb-4 mt-2'>Enter OTP and New Password</h2>
            <form action="" method="post" onSubmit={handleResetPassword}>
              <label htmlFor="otp" type="number" className='text-sm font-medium text-gray-700'>OTP</label>
              <OTP value={otp} onChange={handleOtpChange} />
              <label htmlFor="newPassword" type='text' className='text-sm font-medium text-gray-700'>New Password</label>
              <div className='border-slate-500/30 border p-0.5 rounded-md w-full mt-1 mb-3 '>
                  <input type="password" name='newPassword' value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder='Enter your new password' className='px-3 py-1.5 w-full bg-white rounded-md outline-none border-none placeholder:text-sm text-sm placeholder:font-medium font-medium placeholder:text-gray-400'/>
              </div>

              <button type='submit' disabled={loading || otp.length !== 6} className='w-full my-2 py-2 bg-linear-to-tl from-[#31353a] via-black/80 to-black disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-medium rounded-md hover:scale-105 transition-all duration-300 cursor-pointer mt-4'>
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgetPassword