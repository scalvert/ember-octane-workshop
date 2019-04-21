/* eslint-env node */
const jsonServer = require('json-server');
const url = require('url');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(
  '/api',
  (req, res, next) => {
    const _send = res.send;
    res.send = function(body) {
      if (url.parse(req.url, true).query['singular']) {
        try {
          const json = JSON.parse(body);
          if (Array.isArray(json)) {
            if (json.length === 1) {
              return _send.call(this, JSON.stringify(json[0]));
            } else if (json.length === 0) {
              return _send.call(this, '{}', 404);
            }
          }
        } catch (e) {
          throw new Error('Problem unwrapping array');
        }
      }
      return _send.call(this, body);
    };
    next();
  },
  ...middlewares
);

server.use(
  jsonServer.rewriter({
    '/api/teams/:id': '/api/teams/:id?_embed=channels',
    '/api/teams/:id/channels': '/api/channels?teamId=:id',
    '/api/teams/:id/channels/:channelId':
      '/api/channels?id=:channelId&teamId=:id&singular=1',
    '/api/teams/:id/channels/:channelId/messages':
      '/api/messages?_expand=user&teamId=:id&channelId=:channelId'
  })
);

server.use('/api', router);

server.listen(3000, () => {
  console.log('JSON Server is running');
});

module.exports = server;
