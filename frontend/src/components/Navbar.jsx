import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar({ user, userType, logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Student Clubs & Events
        </Link>
        
        <div className="navbar-nav">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
            </>
          ) : (
            <>
              {userType === 'student' && (
                <>
                  <Link to="/student-dashboard" className="nav-link">Dashboard</Link>
                  <span className="nav-user">Hello, {user.name}</span>
                </>
              )}
              {userType === 'admin' && (
                <>
                  <Link to="/admin-dashboard" className="nav-link">Admin Panel</Link>
                  <span className="nav-user">Hello, {user.username}</span>
                </>
              )}
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
