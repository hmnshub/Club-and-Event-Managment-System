export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { MongoClient } = await import('mongodb')
    
    const MONGODB_URI = process.env.MONGODB_URI
    
    if (!MONGODB_URI) {
      return res.status(500).json({ 
        error: 'Database configuration missing',
        debug: 'MONGODB_URI not found in environment variables'
      })
    }

    // Test connection first
    console.log('Attempting MongoDB connection...')
    const client = new MongoClient(MONGODB_URI)
    
    await client.connect()
    console.log('Connected to MongoDB successfully!')
    
    const db = client.db('student-clubs')
    const collection = db.collection('students')
    
    const { name, email, username, password } = req.body

    if (!name || !email || !username || !password) {
      await client.close()
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Check if user exists
    const existingUser = await collection.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      await client.close()
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      })
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const result = await collection.insertOne({
      name,
      email,
      username,
      password: hashedPassword,
      createdAt: new Date()
    })

    // Generate token
    const jwt = await import('jsonwebtoken')
    const token = jwt.sign(
      { id: result.insertedId, userType: 'student' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    await client.close()

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        username
      },
      userType: 'student',
      message: 'Registration successful!'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message,
      debug: error.toString()
    })
  }
}