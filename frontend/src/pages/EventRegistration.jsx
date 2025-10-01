import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import './Registration.css'

function EventRegistration({ user }) {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // Setup axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await axios.get(`/api/events/${eventId}`)
      return response.data
    }
  })

  const registrationMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/registrations/event/${eventId}`)
      return response.data
    },
    onSuccess: () => {
      alert('Successfully registered for the event!')
      navigate('/student-dashboard')
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Registration failed')
    }
  })

  if (isLoading) return <div className="loading">Loading event information...</div>
  if (error) return <div className="error">Event not found</div>
  if (!event) return <div className="error">Event not found</div>

  const isRegistrationOpen = () => {
    if (!event.isActive) return false
    if (new Date() > new Date(event.registrationDeadline)) return false
    if (event.maxAttendees && event.registeredStudents.length >= event.maxAttendees) return false
    return true
  }

  const isAlreadyRegistered = () => {
    return event.registeredStudents.some(reg => reg.student._id === user.id)
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="event-header">
          <h1>{event.name}</h1>
          <span className={`category ${event.category.toLowerCase()}`}>
            {event.category}
          </span>
        </div>

        <div className="event-info">
          <p className="description">{event.description}</p>
          
          <div className="info-grid">
            <div className="info-item">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </div>
            
            <div className="info-item">
              <strong>Time:</strong> {event.time}
            </div>
            
            <div className="info-item">
              <strong>Location:</strong> {event.location}
            </div>
            
            <div className="info-item">
              <strong>Duration:</strong> {event.duration}
            </div>
            
            {event.maxAttendees && (
              <div className="info-item">
                <strong>Capacity:</strong> {event.registeredStudents.length} / {event.maxAttendees}
              </div>
            )}
            
            <div className="info-item">
              <strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}
            </div>
            
            <div className="info-item">
              <strong>Contact:</strong> {event.contactEmail}
            </div>
          </div>

          {event.club && (
            <div className="club-info">
              <strong>Organized by:</strong> {event.club.name}
            </div>
          )}

          {event.requirements && (
            <div className="requirements">
              <strong>Requirements:</strong>
              <p>{event.requirements}</p>
            </div>
          )}
        </div>

        <div className="registration-actions">
          {isAlreadyRegistered() ? (
            <div className="already-registered">
              <p>✓ You are already registered for this event</p>
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

export default EventRegistration
