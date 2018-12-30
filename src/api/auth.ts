import passport from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import { Response, Request, NextFunction } from "express";


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

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        res.status(401).send('Not authenticated');
    }
};

export function isAdmin(req: Request, res: Response, next: NextFunction) {
    if(req.isAuthenticated() && req.user.isAdmin)
    {
        next();
    }
    else
    {
        res.status(401).send('Not authenticated');
    }
};

export function isAdminOrSelf(req: Request, res: Response, next: NextFunction)
{
  var user_id = req.param('user_id');
  if(user_id === req.user.id)
  {
    next();
  }
  else
  {
    isAdmin(req, res, next);
  }
};

export let login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

export function logout(req: Request, res: Response) {
  req.logout();
  res.redirect('/login');
}
