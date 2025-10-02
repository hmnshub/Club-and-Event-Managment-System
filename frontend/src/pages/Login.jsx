import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../config/api' // Import API configuration
import './Login.css'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function Login({ setUser, setUserType }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        })

        // Render Google Sign-In button after a delay to ensure DOM is ready
        const timer = setTimeout(() => {
          const googleButton = document.getElementById('google-signin-button')
          if (googleButton) {
            window.google.accounts.id.renderButton(googleButton, {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              width: 280,
              shape: 'rectangular',
              logo_alignment: 'left'
            })
          }
        }, 500)

        return () => clearTimeout(timer)
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error)
      }
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setLoading(true)
    setError('')

    try {
      const result = await axios.post('/api/auth/student/google', {
        token: response.credential
      })

      const { token, user, userType } = result.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userType', userType)

      setUser(user)
      setUserType(userType)
      navigate('/student-dashboard')
    } catch (error) {
      console.error('Google login error:', error)
      setError(error.response?.data?.error || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if the username is the admin email
      const isAdminEmail = formData.username === 'connecthimanshu7@gmail.com'
      
      let result
      if (isAdminEmail) {
        // Try admin login first
        try {
          result = await axios.post('/api/auth/admin/login', {
            username: 'himanshu_admin',
            password: formData.password
          })
        } catch (adminError) {
          // If admin login fails, try creating/updating admin account
          result = await axios.post('/api/auth/student/login', formData)
        }
      } else {
        // Regular student login
        result = await axios.post('/api/auth/student/login', formData)
      }

      const { token, user, userType } = result.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userType', userType)

      setUser(user)
      setUserType(userType)
      
      if (userType === 'admin') {
        navigate('/admin-dashboard')
      } else {
        navigate('/student-dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container-new">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form-new">
          <div className="form-group-new">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group-new">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="signin-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <p className="register-text">
            Don't have an account? <Link to="/register" className="register-link">Register</Link>
          </p>
        </form>

        <div className="divider">
          <span>or</span>
        </div>
        
        <div className="google-signin-container-new">
          <div id="google-signin-button"></div>
        </div>
      </div>
    </div>
  )
}

export default Login