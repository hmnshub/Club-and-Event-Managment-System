import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Event from '../models/Event.js'
import Student from '../models/Student.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all events (demo data)
router.get('/', async (req, res) => {
  try {
    // Return demo events data
    const demoEvents = [
      {
        _id: 'demo-event-1',
        name: 'AI & Machine Learning Workshop',
        description: 'Hands-on workshop covering the basics of AI and ML with practical examples.',
        category: 'Workshop',
        date: '2025-10-15',
        time: '2:00 PM',
        location: 'Computer Lab A',
        duration: '3 hours',
        isActive: true,
        maxAttendees: 40,
        registrationDeadline: '2025-10-10',
        requirements: 'Basic Python knowledge recommended',
        contactEmail: 'ai.workshop@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-event-link-1',
        club: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'demo-event-2',
        name: 'Annual Cultural Fest',
        description: 'Celebrate diversity with performances, food, and cultural exhibitions.',
        category: 'Cultural',
        date: '2025-11-20',
        time: '10:00 AM',
        location: 'Main Campus Grounds',
        duration: '8 hours',
        isActive: true,
        maxAttendees: 500,
        registrationDeadline: '2025-11-15',
        requirements: 'None - open to all',
        contactEmail: 'culturalfest@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-event-link-2',
        club: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'demo-event-3',
        name: 'Startup Pitch Competition',
        description: 'Present your business ideas and compete for funding and mentorship.',
        category: 'Competition',
        date: '2025-12-05',
        time: '1:00 PM',
        location: 'Business School Auditorium',
        duration: '4 hours',
        isActive: true,
        maxAttendees: 100,
        registrationDeadline: '2025-11-30',
        requirements: 'Must have a business idea or prototype',
        contactEmail: 'startup.competition@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-event-link-3',
        club: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    res.json(demoEvents)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get event by ID or registration link
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    
    // Try to find by ID first, then by registration link
    let event = await Event.findById(identifier)
      .populate('registeredStudents.student', 'name email studentId')
      .populate('club', 'name')
    
    if (!event) {
      event = await Event.findOne({ registrationLink: identifier })
        .populate('registeredStudents.student', 'name email studentId')
        .populate('club', 'name')
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error('Get event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create event (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      date,
      time,
      location,
      duration,
      maxAttendees,
      registrationDeadline,
      requirements,
      contactEmail,
      club
    } = req.body

    const registrationLink = uuidv4()

    const event = new Event({
      name,
      description,
      category,
      date,
      time,
      location,
      duration,
      maxAttendees: maxAttendees || null,
      registrationDeadline,
      requirements,
      contactEmail,
      registrationLink,
      club: club || null
    })

    await event.save()
    await event.populate('club', 'name')
    
    res.status(201).json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update event (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const event = await Event.findByIdAndUpdate(id, updateData, { new: true })
      .populate('registeredStudents.student', 'name email studentId')
      .populate('club', 'name')

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const event = await Event.findByIdAndDelete(id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate new registration link (admin only)
router.post('/:id/generate-link', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const registrationLink = uuidv4()

    const event = await Event.findByIdAndUpdate(
      id,
      { registrationLink },
      { new: true }
    )

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json({ registrationLink, fullLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/event/${registrationLink}` })
  } catch (error) {
    console.error('Generate link error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
