const { sequelize } = require('../config/db');

const getHealthStatus = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'OK',
      message: 'Backend server and database connection are healthy',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthStatus,
};
