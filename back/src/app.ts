import uuid from 'uuid/v4'
import sgMail from '@sendgrid/mail'
import UserController from './controllers/user.controller'
import UserRepository from './repositories/user.repository'
import models from './models'
import AuthController from './controllers/auth.controller'

export interface Application {
  userRepository: UserRepository
  userController: UserController
  authController: AuthController
}

export function createApp(): Application {
  const jwt = {
    privateKey: process.env.JWT_ENCRYPTION!,
    expiresInSec: 14 * 24 * 60 * 60, // 2 weeks
    saltLength: 10,
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  const userRepository = new UserRepository(models.User)

  const authController = new AuthController(
    uuid,
    userRepository,
    jwt.privateKey,
    jwt.expiresInSec,
    jwt.saltLength,
    sgMail,
  )
  
  const userController = new UserController(
    uuid,
    sgMail,
    userRepository,
    jwt.saltLength,
  )

  return {
    userRepository,
    userController,
    authController,
  }
}
