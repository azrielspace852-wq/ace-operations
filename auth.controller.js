const authService = require('../services/auth.service');

exports.verify = async (req) => {
  const { token } = req.body;
  if (!token) throw new Error('Token required');
  return authService.verify(token);
};