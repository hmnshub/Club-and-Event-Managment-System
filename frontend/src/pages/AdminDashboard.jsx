import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import './Dashboard.css'

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('clubs')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'club' or 'event'
  const [editItem, setEditItem] = useState(null)
  const queryClient = useQueryClient()

  // Setup axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const { data: clubs, isLoading: loadingClubs } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await axios.get('/api/clubs')
      return response.data
    }
  })

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axios.get('/api/events')
      return response.data
    }
  })

  const deleteClubMutation = useMutation({
    mutationFn: async (clubId) => {
      await axios.delete(`/api/clubs/${clubId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clubs'])
    }
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await axios.delete(`/api/events/${eventId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
    }
  })

  const generateLinkMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      const response = await axios.post(`/api/${type}s/${id}/generate-link`)
      return response.data
    },
    onSuccess: (data) => {
      alert(`New registration link generated: ${data.fullLink}`)
      queryClient.invalidateQueries([activeTab])
    }
  })

  const handleDelete = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'club') {
        deleteClubMutation.mutate(id)
      } else {
        deleteEventMutation.mutate(id)
      }
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditItem(item)
    setShowModal(true)
  }

  const exportRegistrations = async (type, id, format) => {
    try {
      const response = await axios.get(`/api/registrations/${type}/${id}/export/${format}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `registrations.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Export failed: ' + error.message)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.username}!</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          Manage Clubs
        </button>
        <button 
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Manage Events
        </button>
      </div>

      <div className="dashboard-actions">
        <button 
          className="create-btn"
          onClick={() => openModal(activeTab === 'clubs' ? 'club' : 'event')}
        >
          Create New {activeTab === 'clubs' ? 'Club' : 'Event'}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'clubs' && (
          <div className="items-section">
            <h3>Clubs Management</h3>
            {loadingClubs ? (
              <div className="loading">Loading clubs...</div>
            ) : (
              <div className="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Registered Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs?.map(club => (
                      <tr key={club._id}>
                        <td>{club.name}</td>
                        <td>{club.category}</td>
                        <td>
                          {club.registeredStudents.length}
                          {club.maxMembers && ` / ${club.maxMembers}`}
                        </td>
                        <td>
                          <span className={`status ${club.isActive ? 'active' : 'inactive'}`}>
                            {club.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            className="edit-btn"
                            onClick={() => openModal('club', club)}
                          >
                            Edit
                          </button>
                          <button 
                            className="link-btn"
                            onClick={() => generateLinkMutation.mutate({ type: 'club', id: club._id })}
                          >
                            Generate Link
                          </button>
                          <button 
                            className="export-btn"
                            onClick={() => exportRegistrations('club', club._id, 'csv')}
                          >
                            Export CSV
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete('club', club._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="items-section">
            <h3>Events Management</h3>
            {loadingEvents ? (
              <div className="loading">Loading events...</div>
            ) : (
              <div className="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Registered Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events?.map(event => (
                      <tr key={event._id}>
                        <td>{event.name}</td>
                        <td>{event.category}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>
                          {event.registeredStudents.length}
                          {event.maxAttendees && ` / ${event.maxAttendees}`}
                        </td>
                        <td>
                          <span className={`status ${event.isActive ? 'active' : 'inactive'}`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            className="edit-btn"
                            onClick={() => openModal('event', event)}
                          >
                            Edit
                          </button>
                          <button 
                            className="link-btn"
                            onClick={() => generateLinkMutation.mutate({ type: 'event', id: event._id })}
                          >
                            Generate Link
                          </button>
                          <button 
                            className="export-btn"
                            onClick={() => exportRegistrations('event', event._id, 'csv')}
                          >
                            Export CSV
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete('event', event._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateEditModal 
          type={modalType}
          item={editItem}
          onClose={() => {
            setShowModal(false)
            setEditItem(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries([modalType === 'club' ? 'clubs' : 'events'])
            setShowModal(false)
            setEditItem(null)
          }}
        />
      )}
    </div>
  )
}

// Modal component for creating/editing clubs and events
function CreateEditModal({ type, item, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    item ? { ...item } : getDefaultFormData(type)
  )

  function getDefaultFormData(type) {
    if (type === 'club') {
      return {
        name: '',
        description: '',
        category: 'Academic',
        maxMembers: '',
        registrationDeadline: '',
        requirements: '',
        contactEmail: '',
        isActive: true
      }
    } else {
      return {
        name: '',
        description: '',
        category: 'Workshop',
        date: '',
        time: '',
        location: '',
        duration: '',
        maxAttendees: '',
        registrationDeadline: '',
        requirements: '',
        contactEmail: '',
        isActive: true
      }
    }
  }

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (item) {
        // Edit existing
        const response = await axios.put(`/api/${type}s/${item._id}`, data)
        return response.data
      } else {
        // Create new
        const response = await axios.post(`/api/${type}s`, data)
        return response.data
      }
    },
    onSuccess: () => {
      onSuccess()
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit' : 'Create'} {type === 'club' ? 'Club' : 'Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              {type === 'club' ? (
                <>
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Technical">Technical</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                  <option value="Social">Social</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          {type === 'event' && (
            <>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date ? formData.date.split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration:</label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours, 1 day"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>{type === 'club' ? 'Max Members' : 'Max Attendees'} (optional):</label>
            <input
              type="number"
              min="1"
              value={formData[type === 'club' ? 'maxMembers' : 'maxAttendees']}
              onChange={(e) => setFormData({
                ...formData, 
                [type === 'club' ? 'maxMembers' : 'maxAttendees']: e.target.value
              })}
            />
          </div>

          <div className="form-group">
            <label>Registration Deadline:</label>
            <input
              type="date"
              value={formData.registrationDeadline ? formData.registrationDeadline.split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Requirements (optional):</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Contact Email:</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              Active
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard
