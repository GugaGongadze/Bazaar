import chai from 'chai'
import chaiHttp from 'chai-http'
import {
  host,
  testClientToken,
  testRealtorToken,
  testAdminToken,
  newEmail,
  testRealtorId,
  testClientId,
  adminPermission,
  verifiedStatus,
  testAdminId,
  newUser,
} from './test.utils'
import { ErrorCode, SuccessCode } from '../types'

chai.use(chaiHttp)

describe('Users', () => {
  describe('GET Users', () => {
    it('should not let clients get a list of users', done => {
      chai
        .request(host)
        .get('/users')
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let realtors get a list of users', done => {
      chai
        .request(host)
        .get('/users')
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })
    it('should let admins get a list of users', done => {
      chai
        .request(host)
        .get('/users')
        .set('authorization', `Bearer ${testAdminToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('array')
          done()
        })
    })
  })

  describe('POST Users', () => {
    it('should not let clients create users', done => {
      chai
        .request(host)
        .post('/users')
        .set('authorization', `Bearer ${testClientToken}`)
        .send(newEmail())
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let realtors create users', done => {
      chai
        .request(host)
        .post('/users')
        .set('authorization', `Bearer ${testRealtorToken}`)
        .send(newEmail())
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })
    it('should let admins create users', done => {
      chai
        .request(host)
        .post('/users')
        .set('authorization', `Bearer ${testAdminToken}`)
        .send(newEmail())
        .end((err, res) => {
          res.should.have.status(SuccessCode.Created)
          res.body.should.be.an('object')
          res.body.should.have.property('email')

          done()
        })
    })
  })
  describe('PUT Users', () => {
    it('should not let clients update other users', done => {
      chai
        .request(host)
        .put(`/users/${testRealtorId}`)
        .set('authorization', `Bearer ${testClientToken}`)
        .send(adminPermission)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let non admins update their permission', done => {
      chai
        .request(host)
        .put(`/users/${testClientId}`)
        .send(adminPermission)
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let not admins update their verification status', done => {
      chai
        .request(host)
        .put(`/users/${testClientId}`)
        .send(verifiedStatus)
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should let users update their profile', done => {
      const email = newEmail()

      chai
        .request(host)
        .put(`/users/${testClientId}`)
        .send(email)
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('object')
          res.body.should.have.property('email')
          res.body.should.have.property('permission')
          res.body.email.should.eql(email.email)
          done()
        })
    })

    it('should not let realtors update other users', done => {
      chai
        .request(host)
        .put(`/users/${testClientId}`)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .send(newEmail())
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let realtors update their permission', done => {
      chai
        .request(host)
        .put(`/users/${testRealtorId}`)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .send(adminPermission)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should not let realtors update their verification status', done => {
      chai
        .request(host)
        .put(`/users/${testRealtorId}`)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .send(verifiedStatus)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should let realtors update their profile', done => {
      const email = newEmail()

      chai
        .request(host)
        .put(`/users/${testRealtorId}`)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .send(email)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('object')
          res.body.should.have.property('email')
          res.body.should.have.property('permission')
          res.body.email.should.eql(email.email)
          done()
        })
    })

    it("should let admins update users' profile", done => {
      const email = newEmail()

      chai
        .request(host)
        .put(`/users/${testClientId}`)
        .set('authorization', `Bearer ${testAdminToken}`)
        .send(email)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('object')
          res.body.should.have.property('email')
          res.body.should.have.property('permission')
          res.body.email.should.eql(email.email)
          done()
        })
    })

    it('should let admins update own profile', done => {
      const email = newEmail()

      chai
        .request(host)
        .put(`/users/${testAdminId}`)
        .set('authorization', `Bearer ${testAdminToken}`)
        .send(email)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('object')
          res.body.should.have.property('email')
          res.body.should.have.property('permission')
          res.body.email.should.eql(email.email)
          done()
        })
    })
  })
  describe('DELETE Users', () => {
    it('should not let clients delete users', done => {
      chai
        .request(host)
        .delete(`/users/${testRealtorId}`)
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Action Forbidden')
          done()
        })
    })

    it('should let admins delete users', done => {
      chai
        .request(host)
        .post('/register')
        .send(newUser())
        .then(registrationResponse => {
          chai
            .request(host)
            .delete(`/users/${registrationResponse.body._id.toString()}`)
            .set('authorization', `Bearer ${testAdminToken}`)
            .end((err, res) => {
              res.should.have.status(SuccessCode.NoContent)
              done()
            })
        })
    })
  })
})
