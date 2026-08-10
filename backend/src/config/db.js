require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;

if (!dbName || !dbUser) {
  logger.error('Missing required database environment variables (DB_NAME, DB_USER)');
}

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

const connectDB = async () => {
  try {
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
