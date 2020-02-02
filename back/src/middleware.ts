import { Express } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { Application } from './app'
import { ErrorHandler } from './error'
import { ErrorCode, UserPermission, RequestWithUser } from './types'

const publicEndpoints = ['/ping', '/login', '/register', '/confirm']

export default function injectMiddleware(app: Application, server: Express) {
  server.use(cors())
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  // Authorization layer
  server.use(async (req: RequestWithUser, res, next) => {
    if (
      !publicEndpoints.includes(req.url) &&
      !req.url.includes('/confirm/') &&
      !req.url.includes('/register/')
    ) {
      const authorizationHeader = req.headers.authorization

      if (authorizationHeader == null) {
        const error = new ErrorHandler(
          ErrorCode.Unauthorized,
          'No authorization header',
        )
        return next(error)
      } else {
        const chunks = authorizationHeader.split(' ')

        if (chunks.length !== 2) {
          const error = new ErrorHandler(
            ErrorCode.Unauthorized,
            'Bearer keyword is missing.',
          )
          return next(error)
        } else {
          const user = await app.authController.loginWithToken(chunks[1])

          if (!user) {
            const error = new ErrorHandler(
              ErrorCode.Unauthorized,
              'Unauthorized',
            )
            return next(error)
          }

          req.user = user
        }
      }
    }
    next()
  })

  // Permission layer
  server.get('/users', (req: RequestWithUser, res, next) => {
    if (!req.user) {
      const error = new ErrorHandler(ErrorCode.Unauthorized, 'Unauthorized')
      return next(error)
    }

    if (req.user.permission !== UserPermission.Admin) {
      const error = new ErrorHandler(ErrorCode.Forbidden, 'Action Forbidden')
      return next(error)
    }

    next()
  })

  server.post('/users', (req: RequestWithUser, res, next) => {
    if (!req.user) {
      const error = new ErrorHandler(ErrorCode.Unauthorized, 'Unauthorized')
      return next(error)
    }

    if (req.user.permission !== UserPermission.Admin) {
      const error = new ErrorHandler(ErrorCode.Forbidden, 'Action Forbidden')
      return next(error)
    }

    next()
  })

  server.put('/users/:userId', (req: RequestWithUser, res, next) => {
    if (!req.user) {
      const error = new ErrorHandler(ErrorCode.Unauthorized, 'Unauthorized')
      return next(error)
    }

    next()
  })

  server.delete('/users/:userId', (req: RequestWithUser, res, next) => {
    if (!req.user) {
      const error = new ErrorHandler(ErrorCode.Unauthorized, 'Unauthorized')
      return next(error)
    }

    if (req.user.permission !== UserPermission.Admin) {
      const error = new ErrorHandler(ErrorCode.Forbidden, 'Action Forbidden')
      return next(error)
    }

    next()
  })
}
