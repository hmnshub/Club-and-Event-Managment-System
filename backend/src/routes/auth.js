import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { OAuth2Client } from 'google-auth-library'
import Admin from '../models/Admin.js'
import Student from '../models/Student.js'

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Check if this is the special admin account
    if (username === 'himanshu_admin' || username === 'connecthimanshu7@gmail.com') {
      let admin = await Admin.findOne({ 
        $or: [
          { username: 'himanshu_admin' },
          { email: 'connecthimanshu7@gmail.com' }
        ]
      })

      if (!admin) {
        // Create the admin account if it doesn't exist
        admin = new Admin({
          username: 'himanshu_admin',
          email: 'connecthimanshu7@gmail.com',
          password: await bcrypt.hash(password, 10),
          name: 'Himanshu (Admin)'
        })
        await admin.save()
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { id: admin._id, userType: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      return res.json({
        token,
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          name: admin.name
        },
        userType: 'admin'
      })
    }

    // Regular admin login logic
    const admin = await Admin.findOne({ username })
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin._id, userType: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      },
      userType: 'admin'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Google OAuth login for students
router.post('/student/google', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' })
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not available. Please try again later.',
        connectionState: mongoose.connection.readyState 
      })
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Check if this is the admin email
    const isAdminEmail = email === 'connecthimanshu7@gmail.com'

    if (isAdminEmail) {
      // Handle admin login via Google
      let admin = await Admin.findOne({ email })

      if (!admin) {
        // Create new admin account
        admin = new Admin({
          username: 'himanshu_admin',
          email,
          password: await bcrypt.hash('admin123', 10),
          name
        })
        await admin.save()
      }

      const jwtToken = jwt.sign(
        { id: admin._id, userType: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      return res.json({
        token: jwtToken,
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          name: admin.name
        },
        userType: 'admin'
      })
    }

    // Handle regular student login via Google
    // Check if student exists
    let student = await Student.findOne({ googleId })

    if (!student) {
      // Create new student
      student = new Student({
        googleId,
        email,
        name,
        picture,
        studentId: '',
        year: '1st Year',
        major: ''
      })
      await student.save()
    }

    const jwtToken = jwt.sign(
      { id: student._id, userType: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.json({
      token: jwtToken,
      user: {
        id: student._id,
        googleId: student.googleId,
        email: student.email,
        name: student.name,
        picture: student.picture,
        studentId: student.studentId,
        year: student.year,
        major: student.major
      },
      userType: 'student',
      isNewUser: !student.studentId
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

// Update student profile (for new users)
router.post('/student/profile', async (req, res) => {
  try {
    const { token, studentId, phone, year, major } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not available. Please try again later.',
        connectionState: mongoose.connection.readyState 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const student = await Student.findById(decoded.id)

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Update profile
    student.studentId = studentId
    student.phone = phone
    student.year = year
    student.major = major
    await student.save()

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: student._id,
        googleId: student.googleId,
        email: student.email,
        name: student.name,
        picture: student.picture,
        studentId: student.studentId,
        phone: student.phone,
        year: student.year,
        major: student.major
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Setup route to create initial admin (can be called once)
router.post('/setup-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'connecthimanshu7@gmail.com' })
    
    if (existingAdmin) {
      return res.json({ message: 'Admin account already exists' })
    }

    // Create admin account
    const admin = new Admin({
      username: 'himanshu_admin',
      email: 'connecthimanshu7@gmail.com',
      password: await bcrypt.hash('admin123', 10), // Default password
      name: 'Himanshu (Admin)'
    })
    
    await admin.save()
    
    res.json({ 
      message: 'Admin account created successfully',
      credentials: {
        email: 'connecthimanshu7@gmail.com',
        username: 'himanshu_admin',
        defaultPassword: 'admin123'
      }
    })
  } catch (error) {
    console.error('Setup admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
