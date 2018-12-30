import { Server, InvalidCredentialsError, parseDN } from 'ldapjs';

import { UserStore } from '../common/types';
import { LdapHandler } from './ldap_handler';

export class LdapUserServer {

  constructor(
    server: Server,
    public rootDN: string = 'dc=users, dc=example, dc=com',
    public userStore: UserStore,
    public domain: string
  )
  {
    const searchHandler = new LdapHandler(userStore, parseDN(rootDN), domain);

    server.bind('ou=Users,'+rootDN, function(req, res, next) {

      const password = req.credentials;
      const username = req.dn.rdns[0].attrs.cn.value;

      if (!userStore.authenticate(username, password))
      {
          return next(new InvalidCredentialsError());
      }
      else
      {
        res.end();
        return next();
      }
    });


    server.search(rootDN, function(req, res, next) {
        searchHandler.handleSearch(req, res);
        res.end();
        return next();
    });

    /*
     * Configuration searches (TODO: Check if we really need this?)
     */

    server.search('', function(req, res, next) {

        const baseObject = {
            dn: '',
            structuralObjectClass: 'OpenLDAProotDSE',
            configContext: 'cn=config',
            attributes: {
                objectclass: ['top', 'OpenLDAProotDSE'],
                namingContexts: [rootDN],
                supportedLDAPVersion: ['3'],
                subschemaSubentry:['cn=Subschema']
            }
        };
        if('base' == req.scope
            && '(objectclass=*)' == req.filter.toString()
            && req.baseObject.toString() == ''){
            res.send(baseObject);
        }
        res.end();
        return next();
    });

    server.search('cn=Subschema', function(_, res, next) {
        const schema = {
            dn: 'cn=Subschema',
            attributes: {
                objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
                cn: ['Subschema']
            }
        };
        res.send(schema);
        res.end();
        return next();
    });
  }
}
