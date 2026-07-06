const admin = require('firebase-admin');
const db = admin.firestore();

exports.findById = async (uid) => {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

exports.create = async (uid, data) => {
  await db.collection('users').doc(uid).set(data);
  return exports.findById(uid);
};

exports.update = async (uid, data) => {
  await db.collection('users').doc(uid).update(data);
};

exports.findAll = async () => {
  const snap = await db.collection('users').get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  return list;
};