const userRepo = require('../repositories/user.repository');

exports.getProfile = async (uid) => {
  const user = await userRepo.findById(uid);
  if (!user) throw new Error('User not found');
  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
    credits: {
      remaining: user.creditRemaining || 0,
      limit: user.creditLimit || 240,
    },
  };
};

exports.list = async (uid) => {
  // Admin only - untuk MVP semua user bisa lihat semua
  return userRepo.findAll();
};

exports.resetCredits = async (uid, targetUid) => {
  // Admin only - untuk MVP
  const user = await userRepo.findById(targetUid);
  if (!user) throw new Error('User not found');
  await userRepo.update(targetUid, { creditRemaining: user.creditLimit || 240 });
};