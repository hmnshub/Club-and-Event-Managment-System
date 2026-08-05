import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Event from '../models/Event.js'
import Student from '../models/Student.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all active events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .populate('registeredStudents.student', 'name email studentId')
      .populate('club', 'name')
      .sort({ date: 1 })
    res.json(events)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get event by ID or registration link
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params

    // Registration links are UUIDs, not Mongo ObjectIds — only attempt
    // findById when the identifier is actually shaped like one, otherwise
    // Mongoose throws a CastError instead of just returning null and the
    // registrationLink fallback below never runs.
    let event = null
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      event = await Event.findById(identifier)
        .populate('registeredStudents.student', 'name email studentId')
        .populate('club', 'name')
    }

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
