import express from 'express'
import Club from '../models/Club.js'
import Event from '../models/Event.js'
import Student from '../models/Student.js'
import { authenticateToken, requireAdmin, requireStudent } from '../middleware/auth.js'

const router = express.Router()

const MODELS = { club: Club, event: Event }

/** The frontend passes either a real Mongo _id or a club/event's registrationLink. */
async function findByIdentifier(Model, identifier) {
  let doc = null
  if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
    doc = await Model.findById(identifier)
  }
  if (!doc) {
    doc = await Model.findOne({ registrationLink: identifier })
  }
  return doc
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

// POST /api/registrations/club/:identifier (student only)
router.post('/club/:identifier', authenticateToken, requireStudent, async (req, res) => {
  try {
    const club = await findByIdentifier(Club, req.params.identifier)
    if (!club) return res.status(404).json({ error: 'Club not found' })

    if (!club.isActive) return res.status(400).json({ error: 'Registration is closed for this club' })
    if (club.registrationDeadline && new Date() > new Date(club.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' })
    }
    if (club.maxMembers && club.registeredStudents.length >= club.maxMembers) {
      return res.status(400).json({ error: 'Club has reached maximum capacity' })
    }
    if (club.registeredStudents.some((r) => String(r.student) === String(req.user._id))) {
      return res.status(400).json({ error: 'You are already registered for this club' })
    }

    club.registeredStudents.push({ student: req.user._id })
    await club.save()

    if (!req.user.registeredClubs.some((id) => String(id) === String(club._id))) {
      req.user.registeredClubs.push(club._id)
      await req.user.save()
    }

    res.status(201).json({ message: 'Successfully registered for the club', club })
  } catch (error) {
    console.error('Club registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/registrations/event/:identifier (student only)
router.post('/event/:identifier', authenticateToken, requireStudent, async (req, res) => {
  try {
    const event = await findByIdentifier(Event, req.params.identifier)
    if (!event) return res.status(404).json({ error: 'Event not found' })

    if (!event.isActive) return res.status(400).json({ error: 'Registration is closed for this event' })
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' })
    }
    if (event.maxAttendees && event.registeredStudents.length >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event has reached maximum capacity' })
    }
    if (event.registeredStudents.some((r) => String(r.student) === String(req.user._id))) {
      return res.status(400).json({ error: 'You are already registered for this event' })
    }

    event.registeredStudents.push({ student: req.user._id })
    await event.save()

    if (!req.user.registeredEvents.some((id) => String(id) === String(event._id))) {
      req.user.registeredEvents.push(event._id)
      await req.user.save()
    }

    res.status(201).json({ message: 'Successfully registered for the event', event })
  } catch (error) {
    console.error('Event registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/registrations/my-registrations (student only)
router.get('/my-registrations', authenticateToken, requireStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate('registeredClubs')
      .populate('registeredEvents')
    res.json({ clubs: student.registeredClubs, events: student.registeredEvents })
  } catch (error) {
    console.error('My registrations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/registrations/:type/:id/status (admin only) — body: { studentId, status }
router.put('/:type/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params
    const { studentId, status } = req.body
    const Model = MODELS[type]
    if (!Model) return res.status(400).json({ error: 'Invalid registration type' })
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const doc = await Model.findById(id)
    if (!doc) return res.status(404).json({ error: `${type} not found` })

    const registration = doc.registeredStudents.find((r) => String(r.student) === String(studentId))
    if (!registration) return res.status(404).json({ error: 'Registration not found' })

    registration.status = status
    await doc.save()

    res.json({ message: 'Registration status updated', registration })
  } catch (error) {
    console.error('Update registration status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/registrations/:type/:id/export/:format (admin only)
router.get('/:type/:id/export/:format', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id, format } = req.params
    const Model = MODELS[type]
    if (!Model) return res.status(400).json({ error: 'Invalid registration type' })
    if (format !== 'csv') return res.status(400).json({ error: 'Only CSV export is supported' })

    const doc = await Model.findById(id).populate('registeredStudents.student', 'name email username')
    if (!doc) return res.status(404).json({ error: `${type} not found` })

    const header = 'Name,Email,Username,Status,Registration Date\n'
    const rows = doc.registeredStudents
      .map((r) => {
        const s = r.student || {}
        return [csvEscape(s.name), csvEscape(s.email), csvEscape(s.username), csvEscape(r.status), csvEscape(new Date(r.registrationDate).toLocaleString())].join(',')
      })
      .join('\n')

    const filename = `${doc.name.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(header + rows)
  } catch (error) {
    console.error('Export registrations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
