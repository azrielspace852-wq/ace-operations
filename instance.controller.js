const instanceService = require('../services/instance.service');

exports.list = async (req, user) => {
  return { instances: await instanceService.list(user.uid) };
};

exports.create = async (req, user) => {
  const instance = await instanceService.create(user.uid, req.body);
  return { instance };
};

exports.update = async (req, user, params) => {
  await instanceService.update(user.uid, params.id, req.body);
  return { success: true };
};

exports.delete = async (req, user, params) => {
  await instanceService.delete(user.uid, params.id);
  return { success: true };
};