import { Response, Request } from "express";
import { UserStore, User } from '../common/types';
import _ from 'lodash';

class UserUpdateProperties {
  id?: string;
  aliases?: string[];
  firstname?: string;
  lastname?: string;
}

function sanitizeOutgoingUserData(user: User) {
  return {
    id: user.id,
    aliases: user.aliases,
    firstname: user.firstname,
    lastname: user.lastname,
    isAdmin: user.isAdmin
  };
};

function sanitizeIncomingUserData(user_properties: {}): UserUpdateProperties {
  return _.pick(user_properties, 'id', 'aliases', 'firstname', 'lastname');
};


export function currentUser(req: Request, res: Response) {

    let user = req.user;

    if(user)
    {
      if(!req.query.user || (req.query.user === user.id))
      {
        res.setHeader('X-Authenticated-User', user.id);
        res.setHeader('X-Authenticated-User-Admin', user.isAdmin);
        res.json(sanitizeOutgoingUserData(user));
      }
      else {
        res.status(403).send('Forbidden');
      }
    }
    else
    {
        res.status(401).send('Authentication Needed');
    }
}

export function userForAlias(userStore: UserStore) {
  return function(req: Request, res: Response) {
    let alias = req.param('alias');
    let user_candidate = userStore.getUserForAlias(alias);
    if(user_candidate)
    {
      res.json(sanitizeOutgoingUserData(userStore.getUser(req.param('user_id'))));
    }
    else {
      res.status(404).send('User not found');
    }
  };
}

export function allUsers(userStore: UserStore) {
  return function(_: Request, res: Response) {
    res.json(userStore.getUsers().map(sanitizeOutgoingUserData));
  };
}

export function userById(userStore: UserStore) {
  return function(req: Request, res: Response) {
    let id = req.param('user_id');
    let user_candidate = userStore.getUser(id);
    if(user_candidate)
    {
      res.json(sanitizeOutgoingUserData(user_candidate));
    }
    else {
      res.status(404).send('User not found');
    }
  };
}

export function createUser(userStore: UserStore) {
  return function(req: Request, res: Response){
      let user_properties: UserUpdateProperties = sanitizeIncomingUserData(req.body);
      let user_id = String(user_properties['id']);
      if(!user_id)
      {
        res.status(400).send('User must have non-empty user id');
      }
      else if(userStore.userIdAvailable(user_id))
      {
        res.status(409).send('User ID already taken. Might be an alias.');
      }
      else
      {
        userStore.addUser(new User(user_id))
        res.json(sanitizeOutgoingUserData(userStore.updateUser(user_id, user_properties)));
      }
  };
}

export function updateUser(userStore: UserStore) {
  return function(req: Request, res: Response){
      const user_id = req.param('user_id');
      const user_update_properties = sanitizeIncomingUserData(req.body);
      res.json(sanitizeOutgoingUserData(userStore.updateUser(user_id, user_update_properties)));
  };
}

export function deleteUser(userStore: UserStore) {
  return function(req: Request, res: Response){
      res.json(sanitizeOutgoingUserData(userStore.deleteUser(req.param('user_id'))));
  };
}

export function setPassword(userStore: UserStore) {
  return function(req: Request, res: Response) {
    const user_id = req.param('user_id');
    const password = req.body.password;
    userStore.setPassword(user_id, password);
    res.json({success: true});
  };
}
