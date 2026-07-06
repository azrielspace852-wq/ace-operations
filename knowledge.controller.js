const knowledgeService = require('../services/knowledge.service');

exports.list = async (req, user) => {
  return { knowledge: await knowledgeService.list(user.uid) };
};

exports.create = async (req, user) => {
  const knowledge = await knowledgeService.create(user.uid, req.body);
  return { knowledge };
};

exports.delete = async (req, user, params) => {
  await knowledgeService.delete(user.uid, params.id);
  return { success: true };
};