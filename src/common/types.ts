import uuid from 'uuid';
import bcrypt from 'bcrypt';


export abstract class UserStore {
  constructor(
    protected domain: string = 'example.com'
  ) {}

  abstract authenticate(username: string, password: string): boolean;
  abstract getUsers(): User[];
  abstract getUser(id: string): User;
  abstract getGroups(): Group[];
  abstract getGroup(id: string): Group;
  abstract addUser(
    user_id: string,
    aliases?: string[],
    firstname?: string,
    lastname?: string,
    email?: string
  ): User;
  abstract updateUser(user_id: string, user_update_properties: {}): User;
  abstract deleteUser(user_id: string): User
  abstract setPassword(user_id: string, password_plain: string): void;
  abstract setAdmin(user_id: string, is_admin: boolean): void;
  abstract isInitialized(): boolean;



  getUserForAlias(alias: string): User | undefined {
    return this.getUsers().find((user) => user.id === alias || user.aliases.indexOf(alias) > -1);
  };

  userIdAvailable(user_id: string): boolean {
    return !this.getUserForAlias(user_id);
  }


}

export class User {
  uuid: string;
  private password_set: boolean = false;



  constructor(
    public id: string,
    private domain: string,
    public firstname: string = '',
    public lastname: string = '',
    public aliases: string[] = [],
    public isAdmin: boolean = false,
    private passwordHash: string = '',
    private _email?: string | undefined,
  ) {
    this.uuid = uuid.v4();
    if(passwordHash) {
      this.password_set = true;
    }
  }

  get email(): string {
    return this._email || `${this.id}@${this.domain}`;
  }
  set email(email: string) {
    this._email = email;
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
