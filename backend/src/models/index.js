const { sequelize } = require('../config/db');
const User = require('./User');
const Note = require('./Note');
const Task = require('./Task');

// Relationships: User 1 ---- * Notes
User.hasMany(Note, {
  foreignKey: 'user_id',
  as: 'notes',
  onDelete: 'CASCADE',
});

Note.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Relationships: User 1 ---- * Tasks
User.hasMany(Task, {
  foreignKey: 'user_id',
  as: 'tasks',
  onDelete: 'CASCADE',
});

Task.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Note,
  Task,
};
