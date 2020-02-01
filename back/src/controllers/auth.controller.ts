import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserRepository from '../repositories/user.repository'
import { ErrorHandler } from '../error'
import {
  ErrorCode,
  SuccessCode,
  User,
  UserPermission,
} from '../types'

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

class AuthController {
  constructor(
    private uuid: () => string,
    private userRepository: UserRepository,
    private JWT_ENCRYPTION: string,
    private JWT_EXPIRES_IN_SECS: number,
    private SALT_LENGTH_TO_GENERATE: number,
    private sgMail: any,
  ) {}

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, permission } = req.body as User

      if (!email || !password) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      if (password.length < 6) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Password must be at least 6 characters long',
        )
      }

      const isValidEmail = emailRegex.test(email)

      if (!isValidEmail) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Invalid email address')
      }

      const existingUser = await this.userRepository.getUserByEmail(email)

      if (existingUser !== null) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Email already exists')
      }

      const hashedPassword = bcrypt.hashSync(
        password,
        this.SALT_LENGTH_TO_GENERATE,
      )

      const newUser = await this.userRepository.register({
        email,
        password: hashedPassword,
        permission: permission ? permission : UserPermission.Regular,
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
        `,
      }

      try {
        await this.sgMail.send(msg)
      } catch (error) {
        console.error('Unable to send confirmation email')
      }

      const userWithToken = await this.userRepository.updateUser(newUser._id, {
        invitationToken,
      })

      return res.status(SuccessCode.Created).send(userWithToken)
    } catch (error) {
      return next(error)
    }
  }

  public async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirmationToken } = req.params

      if (!confirmationToken) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'No token provided')
      }

      const user = await this.userRepository.getUserByInvitationToken(
        confirmationToken,
      )

      if (user === null) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Invalid token provided')
      }

      const token = this.createSecureTokenFor(user._id)

      await this.userRepository.updateUser(user._id, {
        token,
        isVerified: true,
      })

      return res.redirect(`http://localhost:3000/login?token=${token}`)
    } catch (error) {
      return next(error)
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as Partial<User>

      if (!email || !password) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      const user = await this.userRepository.getUserByEmail(email)

      if (user === null) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Invalid email/password combination',
        )
      }

      if (!user.isVerified) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Unverified user')
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password)

      if (!isPasswordCorrect) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Invalid email/password combination',
        )
      }

      const token = this.createSecureTokenFor(user._id)

      await this.userRepository.setToken(user._id, token)

      return res.status(SuccessCode.OK).send({
        _id: user._id,
        email: user.email,
        avatar: user.avatar,
        permission: user.permission,
        isVerified: user.isVerified,
        token: user.token,
      })
    } catch (error) {
      return next(error)
    }
  }

  public async loginWithToken(token: string) {
    try {
      const data = jwt.verify(token, this.JWT_ENCRYPTION) as {
        userId: string
        exp: string
      }

      if (!('userId' in data)) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Token does not contain userId.',
        )
      }

      if (!data.hasOwnProperty('exp')) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Token does not contain expiration date.',
        )
      }

      const now = Date.now()
      const exp = new Date(data.exp).getTime() * 1000 // Format to milliseconds

      const isExpired = exp < now

      if (isExpired) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Token is expired.')
      }

      return await this.userRepository.getUserById(data.userId)
    } catch (error) {
      return null
    }
  }

  private createSecureTokenFor(userId: string) {
    return jwt.sign({ userId }, this.JWT_ENCRYPTION, {
      expiresIn: this.JWT_EXPIRES_IN_SECS,
    })
  }
}

export default AuthController
