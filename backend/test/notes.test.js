require('dotenv').config();
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'notes_app_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');
const { connectDB, sequelize } = require('../src/config/db');
const { User, Note } = require('../src/models');

describe('Notes API Integration Tests', () => {
  let userToken;
  let userId;
  let testNoteId;
  const testUser = {
    name: 'Note Test User',
    email: 'notetest@example.com',
    password: 'password123',
  };

  before(async () => {
    try {
      await connectDB();
      if (!sequelize.config.database.includes('test')) {
        throw new Error('Safety guard: Not connected to a test database');
      }
      await sequelize.sync({ force: true });

      // Create a test user directly via model to get ID and bypass route validation
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
      
      userToken = res.body.token;
      
      // Get the created user from db
      const dbUser = await User.findOne({ where: { email: testUser.email } });
      userId = dbUser.id;
    } catch (error) {
      throw error;
    }
  });

  after(async () => {
    try {
      await Note.destroy({ where: {}, truncate: false });
      await User.destroy({ where: {}, truncate: false });
    } catch (error) {
      throw error;
    }
  });

  describe('Unauthorized Access', () => {
    it('should reject POST /api/notes without token', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'Test Note', content: 'Test Content' })
        .expect(401);
      
      expect(res.body).to.have.property('success', false);
    });

    it('should reject GET /api/notes without token', async () => {
      const res = await request(app)
        .get('/api/notes')
        .expect(401);
      
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Notes CRUD Operations', () => {
    it('should create a new note', async () => {
      const noteData = {
        title: 'My First Note',
        content: 'This is the content of my first note',
      };

      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('title', noteData.title);
      expect(res.body.data).to.have.property('content', noteData.content);
      expect(res.body.data).to.have.property('user_id', userId);

      testNoteId = res.body.data.id;
    });

    it('should fail to create a note without a title', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Only content' })
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('should fetch all notes for the logged-in user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.at.least(1);
      expect(res.body.data[0]).to.have.property('id', testNoteId);
    });

    it('should fetch a single note by id', async () => {
      const res = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('id', testNoteId);
    });

    it('should return 404 when fetching a non-existent note', async () => {
      const res = await request(app)
        .get('/api/notes/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(res.body).to.have.property('success', false);
    });

    it('should update an existing note', async () => {
      const updateData = {
        title: 'Updated Note Title',
        content: 'Updated content',
      };

      const res = await request(app)
        .put(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('title', updateData.title);
      expect(res.body.data).to.have.property('content', updateData.content);
    });

    it('should delete an existing note', async () => {
      const res = await request(app)
        .delete(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.equal('Note deleted successfully');

      // Verify it's actually deleted
      const checkRes = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
        
      expect(checkRes.body).to.have.property('success', false);
    });
  });
});
