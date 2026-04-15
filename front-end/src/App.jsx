import React, { Suspense } from 'react'
import './App.css'
const Home = lazyWithDelay(() => import('./Components/Pages/Home'), 300)
import CreatePost from './Components/CreatePost'
import { Login } from './Components/Pages/Login'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import PrivateRoute from './Components/PrivateRoute'
import { Register } from './Components/Pages/Register'
import { PostOptions } from './Components/PostOptions'
import Spinner from './Components/Spinner'
import lazyWithDelay from './Utils/lazyWithDelay'
import { Profile } from './Components/Pages/Profile'
import { SocketProvider } from './Contexts/SocketContext'
import  Notifications  from './Components/Notifications'
const Post = lazyWithDelay(() => import('./Components/Post'), 300)

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
             <Suspense fallback={<Spinner />}><Home /></Suspense>
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/post/:id" element={<PrivateRoute><Suspense fallback={<Spinner />}><Post /></Suspense> </PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreatePost onClose={() => window.history.back()} /></PrivateRoute>} />
          <Route path="/spinner" element={<Spinner />} />
          <Route path="/post/options/:id" element={<PrivateRoute><PostOptions /></PrivateRoute>} />
          <Route path='/profile/:id' element={<PrivateRoute><Suspense fallback={<Spinner />}><Profile/></Suspense></PrivateRoute>}/>
        </Routes>
        </SocketProvider>
    </AuthProvider>
  )
}

export default App
