import { Model } from 'mongoose'
import { User } from '../types'

class UserRepository {
  constructor(private userModel: Model<User, {}>) {
    this.userModel = userModel
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email })
  }

  public async getUserById(userId: string): Promise<User | null> {
    return await this.userModel.findOne(
      { _id: userId },
      {
        email: 1,
        avatar: 1,
        permission: 1,
        isVerified: 1,
        token: 1,
      },
    )
  }

  public async getUserByInvitationToken(
    invitationToken: string,
  ): Promise<User | null> {
    return await this.userModel.findOne({ invitationToken })
  }

  public async listUsers(): Promise<User[]> {
    return await this.userModel.find(
      {},
      { email: 1, avatar: 1, permission: 1, isVerified: 1, token: 1 },
    )
  }

  public async register(newUserData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(newUserData)
    return await newUser.save()
  }

  public async setToken(userId: string, token: string) {
    await this.userModel.findOneAndUpdate({ _id: userId }, { token })
  }

  public async updateUser(userId: string, newUserData: Partial<User>) {
    return await this.userModel.findOneAndUpdate({ _id: userId }, newUserData, {
      projection: {
        _id: 1,
        email: 1,
        avatar: 1,
        permission: 1,
        isVerified: 1,
        token: 1,
        invitationToken: 1,
      },
      new: true,
    })
  }

  public async deleteUser(userId: string) {
    await this.userModel.findOneAndRemove({ _id: userId })
  }
}

export default UserRepository
