import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import UserRepository from '../repositories/user.repository'
import { ErrorHandler } from '../error'
import {
  ErrorCode,
  SuccessCode,
  User,
  UserPermission,
  RequestWithUser,
} from '../types'

class UserController {
  constructor(
    private uuid: () => string,
    private sgMail: any,
    private userRepository: UserRepository,
    private SALT_LENGTH_TO_GENERATE: number,
  ) {}

  public async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userRepository.listUsers()

      return res.status(SuccessCode.OK).send(users)
    } catch (error) {
      return next(error)
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, permission, isVerified } = req.body as User
      const isExistingUser =
        (await this.userRepository.getUserByEmail(email)) !== null

      if (isExistingUser) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'User already exists')
      }

      const password = this.uuid()

      const hashedPassword = bcrypt.hashSync(
        password,
        this.SALT_LENGTH_TO_GENERATE,
      )

      const newUser = await this.userRepository.register({
        email,
        password: hashedPassword,
        permission,
        isVerified,
      })

      const invitationToken = this.uuid()
      const url = `http://localhost:4000/confirm/${invitationToken}`

      const msg = {
        to: email,
        from: 'no_reply@example.com',
        subject: 'No Reply',
        html: `
            <a href="${url}">
              Confirm Email Address
            </a>
            <br />
            <span>This is your temporary password: ${password}</span>
            <br />
            <span>It is recommended that you change it immediately.</span>
          `,
      }

      try {
        await this.sgMail.send(msg)
      } catch (error) {
        console.error('Unable to send confirmation email')
      }

      await this.userRepository.updateUser(newUser._id, {
        invitationToken,
      })

      return res.status(SuccessCode.Created).send({
        email: newUser.email,
        avatar: newUser.avatar,
        permission: newUser.permission,
        isVerified: newUser.isVerified,
        token: newUser.token,
      })
    } catch (error) {
      return next(error)
    }
  }

  public async updateUser(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { userId } = req.params

      if (!userId) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      const targetUser = await this.userRepository.getUserById(userId)

      if (!targetUser) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'User does not exist')
      }

      const { email, password, permission, isVerified } = req.body as User

      const isNotAdmin = req.user!.permission !== UserPermission.Admin

      const isUpdatingOwnProfile =
        req.user!._id.toString() === targetUser._id.toString()

      const isUpdatingPermissionOrVerificationStatus =
        permission !== undefined || isVerified !== undefined

      if (
        isNotAdmin &&
        (!isUpdatingOwnProfile || isUpdatingPermissionOrVerificationStatus)
      ) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Action Forbidden')
      }

      const newUserData = {
        ...(isVerified !== undefined ? { isVerified } : {}),
        ...(email ? { email } : {}),
        ...(permission ? { permission } : {}),
        ...(password
          ? {
              password: bcrypt.hashSync(password, this.SALT_LENGTH_TO_GENERATE),
            }
          : {}),
      }

      const user = await this.userRepository.updateUser(userId, newUserData)

      return res.status(SuccessCode.OK).send(user)
    } catch (error) {
      return next(error)
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params

      if (!userId) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      const targetUser = await this.userRepository.getUserById(userId)

      if (!targetUser) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'User does not exist')
      }

      await this.userRepository.deleteUser(userId)

      return res.status(SuccessCode.NoContent).end()
    } catch (error) {
      return next(error)
    }
  }
}

export default UserController
