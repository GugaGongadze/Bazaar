import mongoose from 'mongoose'
import { UserPermission, User } from '../types'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    token: String,
    invitationToken: String,
    permission: { type: String, default: UserPermission.Regular },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const User = mongoose.model<User>('User', userSchema)

export default User
