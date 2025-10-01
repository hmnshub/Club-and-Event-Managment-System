import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Workshop', 'Seminar', 'Competition', 'Social', 'Cultural', 'Sports', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String, // e.g., "2 hours", "1 day"
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    default: null // null means unlimited
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  requirements: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    required: true
  },
  registeredStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  registrationLink: {
    type: String,
    unique: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null // null for general events not tied to a club
  }
}, {
  timestamps: true
})

export default mongoose.model('Event', eventSchema)
