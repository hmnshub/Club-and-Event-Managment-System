import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

function CompleteProfile({ setUser }) {
  const [formData, setFormData] = useState({
    studentId: '',
    phone: '',
    year: '1st Year',
    major: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!user || !token) {
      navigate('/student-login')
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.studentId || !formData.major) {
      setError('Student ID and Major are required')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/auth/student/profile', {
        token,
        ...formData
      })

      const updatedUser = response.data.user
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      navigate('/student-dashboard')
    } catch (error) {
      setError('Failed to update profile: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Complete Your Profile</h2>
        <p>Please provide additional information to access the student portal</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentId">Student ID *</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Enter your Student ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="major">Major *</label>
            <input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="Enter your major"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Academic Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
