import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Student model
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

let Student
try {
  Student = mongoose.model('Student')
} catch {
  Student = mongoose.model('Student', studentSchema)
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      const MONGODB_URI = process.env.MONGODB_URI
      if (!MONGODB_URI) {
        return res.status(500).json({ error: 'MongoDB URI not configured' })
      }
      await mongoose.connect(MONGODB_URI, { 
        serverSelectionTimeoutMS: 10000 
      })
    }

    const { name, email, username, password } = req.body

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Check if user exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { username }] 
    })

    if (existingStudent) {
      return res.status(400).json({ 
        error: existingStudent.email === email ? 'Email already registered' : 'Username already taken' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create student
    const student = new Student({
      name,
      email,
      username,
      password: hashedPassword
    })

    await student.save()

    // Generate token
    const token = jwt.sign(
      { id: student._id, userType: 'student' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        username: student.username
      },
      userType: 'student',
      message: 'Registration successful'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message 
    })
  }
}