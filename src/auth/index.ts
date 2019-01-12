import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import passport from 'passport';


import { Response, Request } from "express";

import { UserStore } from '../common/types';
import { UserStoreJson } from '../user_store';
import { configurePassport, login, logout, checkAuth } from './auth';

export class UserAuthServer {

  constructor(
    userStore: UserStore = new UserStoreJson('example.com'),
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
    app.get('/login', (_, res) => res.render('auth/login'));
    app.get('/checkAuth', checkAuth);

    //app.get('/api/userinfo', routes.user.info);
    //app.get('/api/clientinfo', routes.client.info);

  }

  private index(_: Request, response: Response): void {
    response.send('Musterroll Server');
  }

};
