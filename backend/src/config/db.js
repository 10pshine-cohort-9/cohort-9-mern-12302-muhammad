const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const logger = require('./logger');

const dbName = process.env.DB_NAME || 'notes_app_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true,
  },
});

const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    logger.info(`Database schema checked/created: ${dbName}`);
  } catch (error) {
    logger.error({ err: error }, `Failed to verify/create database: ${dbName}`);
    throw error;
  }
};

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info(`MySQL Connected Successfully to database: ${dbName} at ${dbHost}:${dbPort}`);
  } catch (error) {
    logger.error({ err: error }, 'Unable to connect to MySQL database');
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
};
