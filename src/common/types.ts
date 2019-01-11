import uuid from 'uuid';
import bcrypt from 'bcrypt';


export interface UserStore {
  authenticate(username: string, password: string): boolean;
  getUsers(): User[];
  getUser(id: string): User;
  getGroups(): Group[];
  getGroup(id: string): Group;
  addUser(user: User): User;
  updateUser(user_id: string, user_update_properties: {}): User;
  deleteUser(user_id: string): User
  setPassword(user_id: string, password_plain: string): void;
  setAdmin(user_id: string, is_admin: boolean): void;
  isInitialized(): boolean;
  getUserForAlias(alias: string): User | undefined;
  userIdAvailable(user_id: string): boolean;
}

export class User {
  uuid: string;
  private password_set: boolean = false;



  constructor(
    public id: string,
    public firstname: string = '',
    public lastname: string = '',
    public aliases: string[] = [],
    public isAdmin: boolean = false,
    private passwordHash: string = '',
    public email?: string | undefined,
  ) {
    this.uuid = uuid.v4();
    if(passwordHash) {
      this.password_set = true;
    }
  }


  authenticate(password: string): boolean
  {
    return this.password_set && bcrypt.compareSync(password, this.passwordHash);
  };

  setPassword(password: string): void {
    this.passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync());
    this.password_set = true;
  }


}

export class Group {
  constructor(public cn: string, public gid: number, public members: string[]){}
}
