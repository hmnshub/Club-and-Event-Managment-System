import mongoose from 'mongoose'

const clubSchema = new mongoose.Schema({
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
    enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: null // null means unlimited
  },
  registrationDeadline: {
    type: Date
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
  }
}, {
  timestamps: true
})

export default mongoose.model('Club', clubSchema)
