import mongoose from 'mongoose'
import { UserPermission, Apartment } from '../types'

export const host = 'http://localhost:4000'

export const testClientId = '5df4e9447c546910fd3812ff'
export const testRealtorId = '5df4e4567c546910fd3812fd'
export const testAdminId = '5df4e9a07c546910fd381300'
export const testClientToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGY0ZTk0NDdjNTQ2OTEwZmQzODEyZmYiLCJpYXQiOjE1NzYzMzI5NDYsImV4cCI6MTU3NzU0MjU0Nn0.a2bWZAN-Mso_kMjNwQ5P1m_0FQsNdcahSXAzOmN4rns'
export const testRealtorToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGY0ZTQ1NjdjNTQ2OTEwZmQzODEyZmQiLCJpYXQiOjE1NzYzMzI5NTQsImV4cCI6MTU3NzU0MjU1NH0.o02V0gNZjYl3Vvz7jjZi7br8EgBjCt1-on_6hyn0qMY'
export const testAdminToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGY0ZTlhMDdjNTQ2OTEwZmQzODEzMDAiLCJpYXQiOjE1NzYzMzI5NjMsImV4cCI6MTU3NzU0MjU2M30.LsdOBZGEJoCHUgUynebqJiKWpRkueXhdAwqtbwTtxbU'

export const newUser = () => ({
  email: `${mongoose.Types.ObjectId()}@gmail.com`,
  password: '123123',
})
export const newEmail = () => ({
  email: `${mongoose.Types.ObjectId()}@gmail.com`,
})

export const adminPermission = { permission: UserPermission.Admin }
export const clientPermission = { permission: UserPermission.Client }
export const verifiedStatus = { isVerified: true }
export const newApartment: Partial<Apartment> = {
  name: '1',
  description: '1',
  area: 50,
  price: 50,
  rooms: 3,
  longitude: 45,
  latitude: 45,
}
