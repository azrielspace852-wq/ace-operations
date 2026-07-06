const admin = require('firebase-admin');
const instanceRepo = require('../repositories/instance.repository');
const aiProvider = require('../providers/ai.provider');

exports.chat = async (uid, messages, instanceSlug) => {
  // Cari instance
  let instance;
  if (instanceSlug && instanceSlug !== 'default') {
    instance = await instanceRepo.findBySlug(uid, instanceSlug);
  }
  
  if (!instance) {
    // Cari instance pertama user
    const instances = await instanceRepo.findByUser(uid);
    instance = instances[0] || null;
  }

  if (!instance) {
    throw new Error('No AI instance configured. Please create one first.');
  }

  // Cari API key aktif
  const activeKey = (instance.apiKeys || []).find(k => k.status === 'active');
  if (!activeKey) {
    throw new Error('No active API key found for this instance.');
  }

  // Panggil AI provider
  const reply = await aiProvider.chat({
    provider: instance.provider,
    model: instance.model,
    apiKey: activeKey.key,
    messages: messages,
    systemPrompt: instance.systemPrompt,
    temperature: instance.temperature || 0.7,
    maxTokens: instance.maxTokens || 4096,
  });

  // Update usage
  await instanceRepo.updateUsage(instance.id, activeKey.label);

  return reply;
};