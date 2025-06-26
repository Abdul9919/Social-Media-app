import React from 'react'
import './App.css'
import { Home } from './Components/Pages/Home'
import { Login } from './Components/Pages/Login'
import {Routes, Route} from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import  PrivateRoute from './Components/PrivateRoute'
import { Register } from './Components/Pages/Register'

function App() {return (
  <AuthProvider>
  <Routes>
    <Route path="/" element={
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    } />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes>
  </AuthProvider>
  )
}

export default App
