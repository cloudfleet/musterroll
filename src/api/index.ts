import express from 'express';

import { UserStore } from '../common/types';
import { UserStoreJson } from '../user_store';
import { currentUser, userForAlias, allUsers, userById, createUser, updateUser,
  deleteUser, setPassword, isAdmin, isAdminOrSelf, isAuthenticated } from './api';

export class UserAPIServer {

  constructor(
    private userStore: UserStore = new UserStoreJson(),
    app = express()
  ){

    app.get('/api/v1/currentUser', isAuthenticated, currentUser)
    app.get('/api/v1/users/from_alias/:alias', isAuthenticated, userForAlias(this.userStore));
    app.get('/api/v1/users', isAdmin, allUsers(this.userStore));
    app.get('/api/v1/users/:user_id', isAdminOrSelf, userById(this.userStore));

    app.post('/api/v1/users', isAdmin, createUser(this.userStore));
    app.put('/api/v1/users/:user_id', isAdminOrSelf, updateUser(this.userStore));
    app.delete('/api/v1/users/:user_id', isAdmin, deleteUser(this.userStore));
    app.put('/api/v1/users/:user_id/password', isAdminOrSelf, setPassword(this.userStore));

  }

};
