import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  studentId: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple null values
  },
  phone: {
    type: String
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'],
    default: '1st Year'
  },
  major: {
    type: String,
    required: false
  },
  registeredClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
})

export default mongoose.model('Student', studentSchema)
