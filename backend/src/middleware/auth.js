import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import Student from '../models/Student.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    if (decoded.userType === 'admin') {
      const admin = await Admin.findById(decoded.id)
      if (!admin) {
        return res.status(401).json({ error: 'Invalid token' })
      }
      req.user = admin
      req.userType = 'admin'
    } else if (decoded.userType === 'student') {
      const student = await Student.findById(decoded.id)
      if (!student) {
        return res.status(401).json({ error: 'Invalid token' })
      }
      req.user = student
      req.userType = 'student'
    } else {
      return res.status(401).json({ error: 'Invalid user type' })
    }

    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export const requireStudent = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({ error: 'Student access required' })
  }
  next()
}
