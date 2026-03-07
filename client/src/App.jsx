import React from 'react'
import {Routes , Route} from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import ForgetPassword from './pages/auth/ForgetPassword.jsx'
import Landing from './pages/landing/Landing.jsx'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/login' element={<Login />} />
      <Route path='/forget-password' element={<ForgetPassword />} />
    </Routes>
  )
}

export default App