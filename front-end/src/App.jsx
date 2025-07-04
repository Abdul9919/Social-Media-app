import React, { Suspense } from 'react'
import './App.css'
const Home = lazyWithDelay(() => import('./Components/Pages/Home'), 300)
import { Login } from './Components/Pages/Login'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import PrivateRoute from './Components/PrivateRoute'
import { Register } from './Components/Pages/Register'
import { PostOptions } from './Components/PostOptions'
import Spinner from './Components/Spinner'
import lazyWithDelay from './Utils/lazyWithDelay'
const Post = lazyWithDelay(() => import('./Components/Post'), 300)

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
             <Suspense fallback={<Spinner />}><Home /></Suspense>
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/post/:id" element={<Suspense fallback={<Spinner />}><Post /></Suspense>} />

          <Route path="/spinner" element={<Spinner />} />
          <Route path="/post/options/:id" element={<PostOptions />} />
        </Routes>
    </AuthProvider>
  )
}

export default App
