import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import axios from '../config/api' // Import configured axios instance
import FlipCard from '../components/FlipCard'
import TypewriterText from '../components/TypewriterText'
import './Dashboard.css'

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

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

  const openRegistration = (e, type, link) => {
    e.stopPropagation()
    window.open(`/register/${type}/${link}`, '_blank')
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header dashboard-header-student">
        <h1><TypewriterText text={`Welcome, ${user.name}!`} /></h1>
        <div className="user-info">
          <p>Email: {user.email}</p>
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
                <p className="empty-hint">You haven't registered for any clubs yet.</p>
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
                <p className="empty-hint">You haven't registered for any events yet.</p>
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
              <motion.div className="items-grid" variants={gridVariants} initial="hidden" animate="show">
                {availableClubs?.map(club => (
                  <motion.div key={club._id} variants={cardVariants}>
                    <FlipCard
                      accentClass={`flip-accent-${club.category.toLowerCase()}`}
                      front={
                        <>
                          <div className="flip-card-header">
                            <h4>{club.name}</h4>
                            <span className={`category ${club.category.toLowerCase()}`} style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                              {club.category}
                            </span>
                          </div>
                          <div className="flip-card-body">
                            <p>{club.description}</p>
                            <span className="flip-hint">↻ Tap for details</span>
                          </div>
                        </>
                      }
                      back={
                        <>
                          <div className="flip-card-header">
                            <h4>{club.name}</h4>
                          </div>
                          <div className="flip-card-body">
                            <div className="item-details">
                              {club.maxMembers && (
                                <p><strong>Capacity:</strong> {club.registeredStudents.length}/{club.maxMembers}</p>
                              )}
                              {club.registrationDeadline && (
                                <p><strong>Deadline:</strong> {new Date(club.registrationDeadline).toLocaleDateString()}</p>
                              )}
                              <p><strong>Contact:</strong> {club.contactEmail}</p>
                            </div>
                            <button
                              className="register-btn"
                              onClick={(e) => openRegistration(e, 'club', club.registrationLink)}
                            >
                              Register
                            </button>
                          </div>
                        </>
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="available-section">
            <h3>Available Events</h3>
            {loadingEvents ? (
              <div className="loading">Loading events...</div>
            ) : (
              <motion.div className="items-grid" variants={gridVariants} initial="hidden" animate="show">
                {availableEvents?.map(event => (
                  <motion.div key={event._id} variants={cardVariants}>
                    <FlipCard
                      accentClass={`flip-accent-${event.category.toLowerCase()}`}
                      front={
                        <>
                          <div className="flip-card-header">
                            <h4>{event.name}</h4>
                            <span className={`category ${event.category.toLowerCase()}`} style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                              {event.category}
                            </span>
                          </div>
                          <div className="flip-card-body">
                            <p>{event.description}</p>
                            <span className="flip-hint">↻ Tap for details</span>
                          </div>
                        </>
                      }
                      back={
                        <>
                          <div className="flip-card-header">
                            <h4>{event.name}</h4>
                          </div>
                          <div className="flip-card-body">
                            <div className="item-details">
                              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {event.time}</p>
                              <p><strong>Location:</strong> {event.location}</p>
                              {event.maxAttendees && (
                                <p><strong>Capacity:</strong> {event.registeredStudents.length}/{event.maxAttendees}</p>
                              )}
                              <p><strong>Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
                            </div>
                            <button
                              className="register-btn"
                              onClick={(e) => openRegistration(e, 'event', event.registrationLink)}
                            >
                              Register
                            </button>
                          </div>
                        </>
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
