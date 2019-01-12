import express from 'express';
import { UserStore } from '../common/types';
import { UserStoreJson } from '../user_store';

export class OAuthServer {
  constructor(
    userStore: UserStore = new UserStoreJson('example.com'),
    app = express()
  ){
    userStore.getUsers();
    app.get('/oauth', (_, res) => res.send('OAuth 2.0 Server'));
  }
}
