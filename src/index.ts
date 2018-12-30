import express from 'express';
import ldap from 'ldapjs';

import { UserStoreJson } from './user_store';
import { LdapUserServer } from './ldap';
import { UserAPIServer } from './api';
import { OAuthServer } from './oauth';
import { FormServer } from './forms';
import { WebfingerServer } from './webfinger';

const userStoragePath: string = process.env.USER_STORAGE_PATH || "/opt/cloudfleet/data";
const domain: string = process.env.DOMAIN || "example.com";
const testing_mode: boolean = process.env.DEBUG == "true";

const userStore = new UserStoreJson(userStoragePath);


if(testing_mode){
  console.log("Starting in TESTING mode");
}

if(process.env.LDAP_ENABLED == 'true') {
  console.log("Starting LDAP server with base domain " + domain);

  const ldapServer = ldap.createServer();
  const rootDN = domain.split(".").map((part) => "dc=" + part).join(", ");

  new LdapUserServer(ldapServer, rootDN, userStore, domain);

  try{
    const ldap_port: number = Number(process.env.LDAP_PORT) || 389;
    ldapServer.listen(ldap_port, function() {
        console.log('LDAP server listening at ' + ldapServer.url);
    });
  }
  catch(error)
  {
      console.log(error);
  }

}


if(process.env.API_ENABLED == 'true' || process.env.WEBFINGER_ENABLED) {
  const server = express();

  if(process.env.API_ENABLED == 'true') {
    new UserAPIServer(userStore, server);
    new FormServer(server);
  }

  if(process.env.OAUTH_ENABLED == 'true') {
    new OAuthServer(userStore, server);
  }


  if(process.env.WEBFINGER_ENABLED) {
    new WebfingerServer(server);
  }


  const api_port: number = Number(process.env.API_PORT) || 80;

  server.listen(api_port, function() {
      console.log(`API server listening on port ${api_port}`);
  });
}
