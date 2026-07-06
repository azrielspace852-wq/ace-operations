const knowledgeRepo = require('../repositories/knowledge.repository');

exports.list = async (uid) => {
  return knowledgeRepo.findByUser(uid);
};

exports.create = async (uid, data) => {
  return knowledgeRepo.create(uid, data);
};

exports.delete = async (uid, id) => {
  const kb = await knowledgeRepo.findById(id);
  if (!kb || kb.userId !== uid) throw new Error('Knowledge not found');
  await knowledgeRepo.delete(id);
};