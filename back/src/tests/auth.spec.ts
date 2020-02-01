import chai from 'chai'
import chaiHttp from 'chai-http'
import { host, testClientToken, newUser } from './test.utils'
import { ErrorCode, SuccessCode } from '../types'

chai.should()
chai.use(chaiHttp)

describe('Authentication', () => {
  describe('Login with token', () => {
    it('should not let you authenticate if no auth header is provided', done => {
      chai
        .request(host)
        .get('/auth')
        .end((err, res) => {
          res.should.have.status(ErrorCode.Unauthorized)
          done()
        })
    })
    it('should not let you authenticate if no Bearer keyword is provided', done => {
      chai
        .request(host)
        .get('/auth')
        .set('authorization', testClientToken)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Unauthorized)
          done()
        })
    })

    it('should return the user object if token is supplied', done => {
      chai
        .request(host)
        .get('/auth')
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('object')
          res.body.should.have.property('_id')
          res.body.should.have.property('isVerified')
          res.body.should.have.property('token')
          res.body.should.have.property('permission')

          done()
        })
    })
  })

  describe('Registration', () => {
    it('should not register a new account without email or password', done => {
      chai
        .request(host)
        .post('/register')
        .send({})
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Missing values')

          done()
        })
    })

    it('should not register a new account with invalid email', done => {
      chai
        .request(host)
        .post('/register')
        .send({ email: 'notreallyanemail', password: 'somenicepassword' })
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Invalid email address')

          done()
        })
    })

    it('should not register a new account with invalid password', done => {
      chai
        .request(host)
        .post('/register')
        .send({ email: 'realemail@gmail.com', password: 'short' })
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql(
            'Password must be at least 6 characters long',
          )

          done()
        })
    })

    it('should let users register a new account', done => {
      chai
        .request(host)
        .post('/register')
        .send(newUser())
        .end((err, res) => {
          res.should.have.status(SuccessCode.Created)
          res.body.should.be.an('object')
          res.body.should.have.property('_id')
          res.body.should.not.have.property('token')
          res.body.should.have.property('isVerified')
          res.body.should.have.property('permission')

          done()
        })
    })

    it('should not let users register with already used email', done => {
      const user = newUser()
      chai
        .request(host)
        .post('/register')
        .send(user)
        .then(() => {
          chai
            .request(host)
            .post('/register')
            .send(user)
            .set('authorization', `Bearer ${testClientToken}`)
            .end((err, res) => {
              res.should.have.status(ErrorCode.Forbidden)
              res.body.should.be.an('object')
              res.body.should.have.property('message')
              res.body.message.should.eql('Email already exists')

              done()
            })
        })
    })
  })

  describe('Login', () => {
    it('should not login without email and password', done => {
      chai
        .request(host)
        .post('/login')
        .send({})
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Missing values')

          done()
        })
    })

    it('should not login with incorrect credentials', done => {
      chai
        .request(host)
        .post('/login')
        .send({ ...newUser(), email: '123@gmai.com' })
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Invalid email/password combination')

          done()
        })
    })

    it('should not login unverified user', done => {
      const user = newUser()
      chai
        .request(host)
        .post('/register')
        .send(user)
        .then(() => {
          chai
            .request(host)
            .post('/login')
            .send(user)
            .end((err, res) => {
              res.should.have.status(ErrorCode.Forbidden)
              res.body.should.be.an('object')
              res.body.should.have.property('message')
              res.body.message.should.eql('Unverified user')

              done()
            })
        })
    })

    it('should login with verified user', done => {
      const user = newUser()
      chai
        .request(host)
        .post('/register')
        .send(user)
        .then(registrationResponse => {
          chai
            .request(host)
            .get(`/confirm/${registrationResponse.body.invitationToken}`)
            .then(() => {
              chai
                .request(host)
                .post('/login')
                .send(user)
                .end((err, res) => {
                  res.should.have.status(SuccessCode.OK)
                  res.body.should.be.an('object')
                  res.body.should.have.property('email')
                  res.body.should.have.property('isVerified')
                  res.body.should.have.property('permission')
                  res.body.email.should.eql(user.email)

                  done()
                })
            })
        })
    })
  })
})
