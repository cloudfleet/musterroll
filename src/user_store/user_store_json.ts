import { UserStore, User, Group } from '../common/types';
import fs from 'fs';
import _ from 'lodash';



export class UserStoreJson extends UserStore
{
  users: User[];

  constructor(
    domain: string,
    private config_file_location: string = 'data/',
    private config_file_name: string = 'users.json'
  ) {
    super(domain);
    if(!fs.existsSync(this.config_file_location))
    {
        fs.mkdirSync(this.config_file_location);
    }
    this.users = this.loadUsers();
  }


  private loadUsers(): User[]
  {
      try{
          console.log("UserStoreJson - Loading users from " + this.config_file_location + this.config_file_name);
          const fileContent = fs.readFileSync(this.config_file_location + this.config_file_name).toString();
          return JSON.parse(fileContent).map((user_data: any) => Object.assign(new User(user_data['id'], this.domain), user_data));
      }
      catch (e) {
          console.log("Could not read file " + this.config_file_location + this.config_file_name + ", creating empty store");
          return [];

      }


  }

  private saveUsers(users: User[])
  {
      fs.writeFileSync(this.config_file_location + this.config_file_name + ".tmp", JSON.stringify(users));
      fs.renameSync(this.config_file_location + this.config_file_name + ".tmp", this.config_file_location + this.config_file_name);
  }


  authenticate(username: string, password: string): boolean
  {
    const user2bind: User = this.getUser(username);

    return user2bind && user2bind.authenticate(password);
  };

  getUsers(): User[]
  {
    return this.users;
  };

  getUser(id: string): User {
    const user = this.users.find((user) => user.id == id);
    if(user)
    {
      return user;
    }
    else
    {
      throw `User ${id} not found`;
    }
  }

  getGroups(): Group[]
  {
    return [
      {
        "cn": "admins",
        "gid": 0,
        "members": this.users.filter((user) => user.isAdmin).map((user) => user.id)
      }
    ];
  };

  getGroup(id: string): Group
  {
    const group = this.getGroups().find((group) => group.cn == id);
    if(group)
    {
      return group;
    }
    else
    {
      throw `User ${id} not found`;
    }
  }

  addUser(
    user_id: string,
    aliases?: string[],
    firstname?: string,
    lastname?: string,
    email?: string
  ): User {
    const user = new User(user_id, this.domain, firstname, lastname, aliases, false, email);
    this.users.push(user);
    this.saveUsers(this.users);
    return user;
  }

  updateUser(user_id: string, user_update_properties: {}): User
  {
    const user_to_update = this.getUser(user_id);
    Object.assign(user_to_update, user_update_properties);
    this.saveUsers(this.users);
    return user_to_update;
  };

  deleteUser(user_id: string): User
  {
    const user_to_delete = this.getUser(user_id);
    this.users = this.users.filter((user) => user.id != user_id);
    this.saveUsers(this.users);
    return user_to_delete;
  };

  setPassword(user_id: string, password_plain: string): void
  {
    const user = this.getUser(user_id);
    if(user)
    {
      user.setPassword(password_plain);
      this.saveUsers(this.users);
    }
  };

  setAdmin(user_id: string, is_admin: boolean): void
  {
    const user = this.getUser(user_id);
    if(user)
    {
      user.isAdmin = is_admin;
      this.saveUsers(this.users);
    }
  };

  isInitialized(): boolean
  {
      return this.users.length > 0;
  };

};
