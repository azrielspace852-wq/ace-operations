const instanceRepo = require('../repositories/instance.repository');

exports.list = async (uid) => {
  return instanceRepo.findByUser(uid);
};

exports.create = async (uid, data) => {
  return instanceRepo.create(uid, data);
};

exports.update = async (uid, id, data) => {
  const inst = await instanceRepo.findById(id);
  if (!inst || inst.userId !== uid) throw new Error('Instance not found');
  await instanceRepo.update(id, data);
};

exports.delete = async (uid, id) => {
  const inst = await instanceRepo.findById(id);
  if (!inst || inst.userId !== uid) throw new Error('Instance not found');
  await instanceRepo.delete(id);
};