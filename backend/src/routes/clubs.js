import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Club from '../models/Club.js'
import Student from '../models/Student.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all clubs (demo data)
router.get('/', async (req, res) => {
  try {
    // Return demo clubs data
    const demoClubs = [
      {
        _id: 'demo-club-1',
        name: 'Computer Science Club',
        description: 'Learn programming, participate in hackathons, and network with tech professionals.',
        category: 'Technical',
        isActive: true,
        maxMembers: 50,
        registrationDeadline: '2025-12-01',
        requirements: 'Basic programming knowledge helpful but not required',
        contactEmail: 'cs.club@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-link-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'demo-club-2',
        name: 'Drama Society',
        description: 'Express yourself through theater, acting, and dramatic performances.',
        category: 'Cultural',
        isActive: true,
        maxMembers: 30,
        registrationDeadline: '2025-11-15',
        requirements: 'Passion for acting and theater',
        contactEmail: 'drama@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-link-2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'demo-club-3',
        name: 'Basketball Team',
        description: 'Join our competitive basketball team and represent the university.',
        category: 'Sports',
        isActive: true,
        maxMembers: 15,
        registrationDeadline: '2025-10-30',
        requirements: 'Basic basketball skills and physical fitness',
        contactEmail: 'basketball@university.edu',
        registeredStudents: [],
        registrationLink: 'demo-link-3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    res.json(demoClubs)
  } catch (error) {
    console.error('Get clubs error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get club by ID or registration link
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    
    // Try to find by ID first, then by registration link
    let club = await Club.findById(identifier).populate('registeredStudents.student', 'name email studentId')
    
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
