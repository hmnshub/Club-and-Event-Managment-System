import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import './Dashboard.css'

function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('registrations')

  // Setup axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await axios.get('/api/registrations/my-registrations')
      return response.data
    }
  })

  const { data: availableClubs, isLoading: loadingClubs } = useQuery({
    queryKey: ['available-clubs'],
    queryFn: async () => {
      const response = await axios.get('/api/clubs')
      return response.data
    }
  })

  const { data: availableEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ['available-events'],
    queryFn: async () => {
      const response = await axios.get('/api/events')
      return response.data
    }
  })

  if (loadingRegistrations && activeTab === 'registrations') {
    return <div className="loading">Loading your registrations...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <div className="user-info">
          <p>Student ID: {user.studentId}</p>
          <p>Email: {user.email}</p>
          <p>Year: {user.year} | Major: {user.major}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          My Registrations
        </button>
        <button 
          className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          Available Clubs
        </button>
        <button 
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Available Events
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'registrations' && (
          <div className="registrations-section">
            <div className="registered-items">
              <h3>Registered Clubs</h3>
              {registrations?.clubs?.length > 0 ? (
                <div className="items-grid">
                  {registrations.clubs.map(club => (
                    <div key={club._id} className="item-card">
                      <h4>{club.name}</h4>
                      <p>{club.description}</p>
                      <span className={`category ${club.category.toLowerCase()}`}>
                        {club.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't registered for any clubs yet.</p>
              )}

              <h3>Registered Events</h3>
              {registrations?.events?.length > 0 ? (
                <div className="items-grid">
                  {registrations.events.map(event => (
                    <div key={event._id} className="item-card">
                      <h4>{event.name}</h4>
                      <p>{event.description}</p>
                      <div className="event-details">
                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {event.time}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                      </div>
                      <span className={`category ${event.category.toLowerCase()}`}>
                        {event.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't registered for any events yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="available-section">
            <h3>Available Clubs</h3>
            {loadingClubs ? (
              <div className="loading">Loading clubs...</div>
            ) : (
              <div className="items-grid">
                {availableClubs?.map(club => (
                  <div key={club._id} className="item-card">
                    <h4>{club.name}</h4>
                    <p>{club.description}</p>
                    <div className="item-details">
                      {club.maxMembers && (
                        <p><strong>Capacity:</strong> {club.registeredStudents.length}/{club.maxMembers}</p>
                      )}
                      {club.registrationDeadline && (
                        <p><strong>Deadline:</strong> {new Date(club.registrationDeadline).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`category ${club.category.toLowerCase()}`}>
                      {club.category}
                    </span>
                    <button 
                      className="register-btn"
                      onClick={() => window.open(`/register/club/${club.registrationLink}`, '_blank')}
                    >
                      Register
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="available-section">
            <h3>Available Events</h3>
            {loadingEvents ? (
              <div className="loading">Loading events...</div>
            ) : (
              <div className="items-grid">
                {availableEvents?.map(event => (
                  <div key={event._id} className="item-card">
                    <h4>{event.name}</h4>
                    <p>{event.description}</p>
                    <div className="item-details">
                      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {event.time}</p>
                      <p><strong>Location:</strong> {event.location}</p>
                      {event.maxAttendees && (
                        <p><strong>Capacity:</strong> {event.registeredStudents.length}/{event.maxAttendees}</p>
                      )}
                      <p><strong>Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                    <span className={`category ${event.category.toLowerCase()}`}>
                      {event.category}
                    </span>
                    <button 
                      className="register-btn"
                      onClick={() => window.open(`/register/event/${event.registrationLink}`, '_blank')}
                    >
                      Register
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
