const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

const { authenticate } = require('./middlewares/auth');

// Controllers
const authCtrl = require('./controllers/auth.controller');
const instanceCtrl = require('./controllers/instance.controller');
const knowledgeCtrl = require('./controllers/knowledge.controller');
const userCtrl = require('./controllers/user.controller');
const playgroundCtrl = require('./controllers/playground.controller');

function success(data) {
  return { success: true, data };
}

function error(err, status = 500) {
  return {
    success: false,
    error: {
      code: status,
      message: err.message || 'Internal server error',
    },
  };
}

function matchRoute(path, pattern) {
  const pParts = pattern.split('/');
  const pathParts = path.split('/');
  if (pParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = pathParts[i];
    } else if (pParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

const routes = [
  // Auth (public)
  { method: 'POST', path: '/api/v1/auth/verify', handler: authCtrl.verify, public: true },

  // Instances
  { method: 'GET', path: '/api/v1/instances', handler: instanceCtrl.list },
  { method: 'POST', path: '/api/v1/instances', handler: instanceCtrl.create },
  { method: 'PUT', path: '/api/v1/instances/:id', handler: instanceCtrl.update },
  { method: 'DELETE', path: '/api/v1/instances/:id', handler: instanceCtrl.delete },

  // Knowledge
  { method: 'GET', path: '/api/v1/knowledge', handler: knowledgeCtrl.list },
  { method: 'POST', path: '/api/v1/knowledge', handler: knowledgeCtrl.create },
  { method: 'DELETE', path: '/api/v1/knowledge/:id', handler: knowledgeCtrl.delete },

  // Users
  { method: 'GET', path: '/api/v1/users', handler: userCtrl.list },
  { method: 'POST', path: '/api/v1/users/:id/reset', handler: userCtrl.reset },

  // Playground
  { method: 'POST', path: '/api/v1/playground/chat', handler: playgroundCtrl.chat },

  // Profile
  { method: 'GET', path: '/api/v1/user/profile', handler: userCtrl.profile },
];

exports.handler = async (event) => {
  const { path, httpMethod, headers, body } = event;
  const parsedBody = body ? JSON.parse(body) : {};

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  let matched = null;
  let params = {};
  for (const route of routes) {
    if (route.method !== httpMethod) continue;
    const result = matchRoute(path, route.path);
    if (result !== null) {
      matched = route;
      params = result;
      break;
    }
  }

  if (!matched) {
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(error(new Error('Not Found'), 404)),
    };
  }

  try {
    let user = null;
    if (!matched.public) {
      user = await authenticate(headers);
    }

    const result = await matched.handler(
      { body: parsedBody, params, headers },
      user,
      params
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(success(result)),
    };
  } catch (err) {
    console.error('API Error:', err);
    const statusCode =
      err.message.includes('token') || err.message.includes('Unauthorized') ? 401
      : err.message.includes('Kredit') ? 429
      : 500;

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(error(err, statusCode)),
    };
  }
};