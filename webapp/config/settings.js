module.exports = {
  sessionSecret: process.env.SESSION_SECRET || 'Custom session secret',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  socketPort: 8124,
  socketIp: '127.0.0.1'
};