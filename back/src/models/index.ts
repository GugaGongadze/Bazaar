import mongoose from 'mongoose'
import User from './user.model'

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL!, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

const models = { User }

export { connectDb }

export default models
