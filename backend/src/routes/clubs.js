import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Club from '../models/Club.js'
import Student from '../models/Student.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all active clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true })
      .populate('registeredStudents.student', 'name email studentId')
      .sort({ createdAt: -1 })
    res.json(clubs)
  } catch (error) {
    console.error('Get clubs error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get club by ID or registration link
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params

    // Registration links are UUIDs, not Mongo ObjectIds — only attempt
    // findById when the identifier is actually shaped like one, otherwise
    // Mongoose throws a CastError instead of just returning null and the
    // registrationLink fallback below never runs.
    let club = null
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      club = await Club.findById(identifier).populate('registeredStudents.student', 'name email studentId')
    }

    if (!club) {
      club = await Club.findOne({ registrationLink: identifier })
        .populate('registeredStudents.student', 'name email studentId')
    }

    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }

    res.json(club)
  } catch (error) {
    console.error('Get club error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create club (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      maxMembers,
      registrationDeadline,
      requirements,
      contactEmail
    } = req.body

    const registrationLink = uuidv4()

    const club = new Club({
      name,
      description,
      category,
      maxMembers: maxMembers || null,
      registrationDeadline,
      requirements,
      contactEmail,
      registrationLink
    })

    await club.save()
    res.status(201).json(club)
  } catch (error) {
    console.error('Create club error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update club (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const club = await Club.findByIdAndUpdate(id, updateData, { new: true })
      .populate('registeredStudents.student', 'name email studentId')

    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }

    res.json(club)
  } catch (error) {
    console.error('Update club error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete club (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const club = await Club.findByIdAndDelete(id)
    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }

    res.json({ message: 'Club deleted successfully' })
  } catch (error) {
    console.error('Delete club error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate new registration link (admin only)
router.post('/:id/generate-link', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const registrationLink = uuidv4()

    const club = await Club.findByIdAndUpdate(
      id,
      { registrationLink },
      { new: true }
    )

    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }

    res.json({ registrationLink, fullLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/club/${registrationLink}` })
  } catch (error) {
    console.error('Generate link error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
