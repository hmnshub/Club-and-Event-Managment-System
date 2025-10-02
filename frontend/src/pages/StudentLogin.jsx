import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../config/api' // Import API configuration
import './Login.css'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function StudentLogin({ setUser, setUserType }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && GOOGLE_CLIENT_ID !== 'your-google-client-id') {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 250
        }
      )
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





  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Student Login</h2>
        <p>Sign in with your Google account to access the student portal</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="google-signin-container">
          {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id' ? (
            <>
              <div id="google-signin-button"></div>
              {loading && <div className="loading">Signing in...</div>}
            </>
          ) : (
            <div className="oauth-setup-notice">
              <p>⚠️ Google OAuth is not configured yet.</p>
              <p>Please set up your Google Client ID in the environment file.</p>
            </div>
          )}
        </div>

        <div className="login-info">
          <p>Use your university Google account to sign in.</p>
          <p>First-time users will need to complete their profile.</p>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
