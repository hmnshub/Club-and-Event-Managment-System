import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../config/api' // Import API configuration
import './Login.css'

function Register({ setUser, setUserType }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registrationData } = formData
      const result = await axios.post('/api/auth/student/register', registrationData)
      
      const { token, user, userType } = result.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userType', userType)

      setUser(user)
      setUserType(userType)
      navigate('/student-dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container-new">
      <div className="login-card">
        <h2 className="login-title">Register</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form-new">
          <div className="form-group-new">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group-new">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          
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
          
          <div className="form-group-new">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          
          <p className="register-text">
            Already have an account? <Link to="/login" className="register-link">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register