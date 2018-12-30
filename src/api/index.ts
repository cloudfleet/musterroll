import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import passport from 'passport';


import { Response, Request } from "express";

import { UserStore } from '../common/types';
import { UserStoreJson } from '../user_store';
import { configurePassport, isAdmin, isAdminOrSelf, isAuthenticated, login, logout } from './auth';
import { currentUser, userForAlias, allUsers, userById, createUser, updateUser, deleteUser, setPassword } from './api';

export class UserAPIServer {

  constructor(
    private userStore: UserStore = new UserStoreJson(),
    app = express()
  ){

    // better invalidate cookies on server reboot than having an insecure default
    const sessionSecret = process.env.SESSION_SECRET || Math.random().toString(36).slice(2);

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    configurePassport(userStore);

    app.get('/', this.index);
    app.post('/login', login);
    app.get('/logout', logout);

    app.get('/api/v1/currentUser', isAuthenticated, currentUser)
    app.get('/api/v1/users/from_alias/:alias', isAuthenticated, userForAlias(this.userStore));
    app.get('/api/v1/users', isAdmin, allUsers(this.userStore));
    app.get('/api/v1/users/:user_id', isAdminOrSelf, userById(this.userStore));

    app.post('/api/v1/users', isAdmin, createUser(this.userStore));
    app.put('/api/v1/users/:user_id', isAdminOrSelf, updateUser(this.userStore));
    app.delete('/api/v1/users/:user_id', isAdmin, deleteUser(this.userStore));
    app.put('/api/v1/users/:user_id/password', isAdminOrSelf, setPassword(this.userStore));

    //app.get('/api/userinfo', routes.user.info);
    //app.get('/api/clientinfo', routes.client.info);

  }

  private index(_: Request, response: Response): void {
    response.send('Musterroll Server');
  }

};
