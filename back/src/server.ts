import express, { Response, Request, NextFunction } from 'express'
import { connectDb } from './models'
import { createApp } from './app'
import injectMiddleware from './middleware'
import injectRoutes from './routes'
import { handleError } from './error'

const app = createApp()
const server = express()

injectMiddleware(app, server)
injectRoutes(app, server)

// Error Layer
server.use((err: any, _: Request, res: Response, next: NextFunction) => {
  handleError(err, res)
})

connectDb().then(async () => {
  server.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}!`),
  )
})
