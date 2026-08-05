import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ClubRegistration from './pages/ClubRegistration'
import EventRegistration from './pages/EventRegistration'
import './App.css'

function App() {
  // Read any existing session synchronously on first render (not in a
  // useEffect) — otherwise every route guard below sees `user = null` on
  // the very first paint, which fires premature redirects. That's most
  // visible when a link opens in a fresh tab (e.g. the student dashboard's
  // "Register" button uses window.open): the new tab would flash to
  // /login and then bounce to the dashboard instead of showing the page
  // that was actually requested.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [userType, setUserType] = useState(() => localStorage.getItem('userType') || null) // 'student' or 'admin'

  const logout = () => {
    setUser(null)
    setUserType(null)
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
  }

  return (
    <div className="App">
      <Navbar user={user} userType={userType} logout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            userType === 'student' ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/admin-dashboard" />
          } />
          <Route path="/login" element={
            user ? (
              userType === 'student' ? <Navigate to="/student-dashboard" /> :
              <Navigate to="/admin-dashboard" />
            ) : (
              <Login setUser={setUser} setUserType={setUserType} />
            )
          } />
          <Route path="/register" element={
            user ? (
              userType === 'student' ? <Navigate to="/student-dashboard" /> :
              <Navigate to="/admin-dashboard" />
            ) : (
              <Register setUser={setUser} setUserType={setUserType} />
            )
          } />
          <Route path="/student-dashboard" element={
            user && userType === 'student' ? <StudentDashboard user={user} /> :
            <Navigate to="/login" />
          } />
          <Route path="/admin-dashboard" element={
            user && userType === 'admin' ? <AdminDashboard user={user} /> :
            <Navigate to="/login" />
          } />
          <Route path="/register/club/:clubId" element={
            user && userType === 'student' ? <ClubRegistration user={user} /> :
            <Navigate to="/login" />
          } />
          <Route path="/register/event/:eventId" element={
            user && userType === 'student' ? <EventRegistration user={user} /> :
            <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
