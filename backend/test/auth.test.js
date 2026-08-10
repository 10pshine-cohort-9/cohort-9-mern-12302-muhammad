require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { connectDB, sequelize } = require('../src/config/db');
const { User } = require('../src/models');

describe('Auth API Integration Tests', () => {
  let userToken;
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await User.destroy({ where: {}, truncate: false });
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'User registered successfully');
      expect(res.body).to.have.property('token').that.is.a('string');
      expect(res.body.user).to.have.property('name', testUser.name);
      expect(res.body.user).to.have.property('email', testUser.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should fail when registering with a duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email is already registered');
    });

    it('should fail when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'incomplete@example.com' })
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with valid credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body).to.have.property('token').that.is.a('string');
      expect(res.body.user).to.have.property('email', testUser.email);

      userToken = res.body.token;
    });

    it('should fail login with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });

    it('should fail login with a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    it('should access protected user profile with a valid JWT token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('email', testUser.email);
    });

    it('should reject access to protected route when no token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });

    it('should reject access with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_xyz')
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });
});
