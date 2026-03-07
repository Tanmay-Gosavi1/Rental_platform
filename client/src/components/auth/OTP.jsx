import React , { useRef} from 'react'


const OTP = ({value , onChange}) => {
    const inputRefs = useRef([])

    const updateOTP = (otp) => onChange?.(otp.slice(0, 6));

    const handleChange = (e, i) => {
        const digit = e.target.value.replace(/\D/g, "");
        const otp = value.split("");
        otp[i] = digit;
        updateOTP(otp.join(""));
        digit && inputRefs.current[i + 1]?.focus();

    }
    const handleBackspace = (e, index) => {
        if(e.key === 'Backspace' && index > 0 && e.target.value === ''){
            inputRefs.current[index - 1].focus()
        }
    }
    const handlePaste = (e) => {
        const otp = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        updateOTP(otp);
        inputRefs.current[otp.length - 1]?.focus();
    }
  return (
    <div className='flex items-center justify-between gap-3 mb-4'>
        {[...Array(6)].map((_, index) => (
            <input
            key={index} 
            type="text" 
            required 
            value={value[index] || ''} 
            maxLength="1" 
            ref={e=> inputRefs.current[index] = e}
            onChange={e => handleChange(e, index)}
            onKeyDown={e => handleBackspace(e, index)}
            onPaste={handlePaste}
            className="h-11 w-11 bg-white/90 border-2 border-slate-500/30 rounded-md text-center text-base font-medium" />
        ))}
    </div>
  )
}

export default OTP