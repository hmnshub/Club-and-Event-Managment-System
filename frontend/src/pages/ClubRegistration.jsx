import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import './Registration.css'

function ClubRegistration({ user }) {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Setup axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const { data: club, isLoading, error } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const response = await axios.get(`/api/clubs/${clubId}`)
      return response.data
    }
  })

  const registrationMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/registrations/club/${clubId}`)
      return response.data
    },
    onSuccess: () => {
      alert('Successfully registered for the club!')
      navigate('/student-dashboard')
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Registration failed')
    }
  })

  if (isLoading) return <div className="loading">Loading club information...</div>
  if (error) return <div className="error">Club not found</div>
  if (!club) return <div className="error">Club not found</div>

  const isRegistrationOpen = () => {
    if (!club.isActive) return false
    if (club.registrationDeadline && new Date() > new Date(club.registrationDeadline)) return false
    if (club.maxMembers && club.registeredStudents.length >= club.maxMembers) return false
    return true
  }

  const isAlreadyRegistered = () => {
    return club.registeredStudents.some(reg => reg.student._id === user.id)
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="club-header">
          <h1>{club.name}</h1>
          <span className={`category ${club.category.toLowerCase()}`}>
            {club.category}
          </span>
        </div>

        <div className="club-info">
          <p className="description">{club.description}</p>
          
          <div className="info-grid">
            {club.maxMembers && (
              <div className="info-item">
                <strong>Capacity:</strong> {club.registeredStudents.length} / {club.maxMembers}
              </div>
            )}
            
            {club.registrationDeadline && (
              <div className="info-item">
                <strong>Registration Deadline:</strong> {new Date(club.registrationDeadline).toLocaleDateString()}
              </div>
            )}
            
            <div className="info-item">
              <strong>Contact:</strong> {club.contactEmail}
            </div>
          </div>

          {club.requirements && (
            <div className="requirements">
              <strong>Requirements:</strong>
              <p>{club.requirements}</p>
            </div>
          )}
        </div>

        <div className="registration-actions">
          {isAlreadyRegistered() ? (
            <div className="already-registered">
              <p>✓ You are already registered for this club</p>
              <button onClick={() => navigate('/student-dashboard')} className="back-btn">
                Back to Dashboard
              </button>
            </div>
          ) : !isRegistrationOpen() ? (
            <div className="registration-closed">
              <p>Registration is currently closed</p>
              <button onClick={() => navigate('/student-dashboard')} className="back-btn">
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="registration-form">
              <div className="student-info">
                <h3>Your Information</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Student ID:</strong> {user.studentId}</p>
                <p><strong>Year:</strong> {user.year}</p>
                <p><strong>Major:</strong> {user.major}</p>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => navigate('/student-dashboard')}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => registrationMutation.mutate()}
                  disabled={registrationMutation.isPending}
                  className="register-btn"
                >
                  {registrationMutation.isPending ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClubRegistration
