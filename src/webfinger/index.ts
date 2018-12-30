import express from 'express';
import ejs from 'ejs';
import fs from 'fs';

export class WebfingerServer {
  constructor(
    app = express()
  ){
    app.get('/webfinger/:type?resource=:uri', function(req, res){

      const type = req.params.type;

      const [user, domain] = req.params.resource.replace(/^acct:/, '').split('@');

      const response = {
          'links': [ {
              'rel':      'remoteStorage',
              'api':      'simple',
              'auth':     'https://' + domain + '/musterroll/oauth/' + user,
              'template': 'https://' + domain + '/storage/' + user + '/{category}'
          } ]
      };

      if(type === 'jrd') {
          res.json(response);
      }
      else
      {
          const body = ejs.render(fs.readFileSync(__dirname + '/templates/account.xml').toString(), {locals: response});
          res.setHeader('Content-Length', body.length);
          res.end(body);
      }
    });
  }
}
