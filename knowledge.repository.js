const admin = require('firebase-admin');
const db = admin.firestore();

exports.create = async (uid, data) => {
  const ref = await db.collection('knowledge').add({
    userId: uid,
    ...data,
    createdAt: new Date(),
  });
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
};

exports.findByUser = async (uid) => {
  const snap = await db.collection('knowledge')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  const list = [];
  snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
  return list;
};

exports.findById = async (id) => {
  const doc = await db.collection('knowledge').doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

exports.delete = async (id) => {
  await db.collection('knowledge').doc(id).delete();
};