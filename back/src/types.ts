import { Document } from 'mongoose'
import { Request } from 'express'

export enum SuccessCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
}

export enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
}

export enum UserPermission {
  Regular = 'regular',
  Admin = 'admin',
}

export interface User extends Document {
  email: string
  password: string
  token: string
  invitationToken: string
  avatar: string
  permission: UserPermission
  isVerified: boolean
}

export interface RequestWithUser extends Request {
  user?: User
}
