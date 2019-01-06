import passport from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import { Response, Request } from "express";


import { UserStore, User } from '../common/types';

export function configurePassport(userStore: UserStore) {
  passport.use(new LocalStrategy(
      function(username: string, password: string, done) {
        if(userStore.authenticate(username, password))
        {
            done(null, userStore.getUser(username));
        }
        else
        {
            done(null, false, { message: 'Incorrect credentials.' });
        }
      }
  ));
  passport.serializeUser(function(user: User, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function(id: string, done) {
      done(null, userStore.getUser(id));
  });

}


export let login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

export function logout(req: Request, res: Response) {
  req.logout();
  res.redirect('/login');
}

export function checkAuth(req: Request, res: Response) {

    let user = req.user;

    if(user)
    {
      res.setHeader('X-Authenticated-User', user.id);
      res.setHeader('X-Authenticated-User-Admin', user.isAdmin);
    }
    else
    {
        res.status(401).send('Authentication Needed');
    }
}
