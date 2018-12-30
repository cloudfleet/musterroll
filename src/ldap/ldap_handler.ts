import { SearchRequest, Response, DN, parseDN } from 'ldapjs';

import { UserStore, User, Group } from '../common/types';

class LdapObject {
  structuralObjectClass?: string;
  constructor(public dn: DN) {}

  get attributes() {
    return {};
  }

}

class LdapUser extends LdapObject {
  constructor(private user: User, baseDN: DN, private domain: string) {
    super(parseDN(`cn=${user.id}, ${baseDN.toString()}`));
  }

  get attributes() {
    const email = this.user.email || (this.user.id + "@" + this.domain);
    return {
      objectClass: 'inetOrgPerson',
      hasSubordinates: 'FALSE',
      cn: this.user.id,
      uuid: this.user.uuid,
      givenName: this.user.firstname,
      sn: this.user.lastname,
      email: email,
      mail: email,

      userPassword: '',
    }
  }
}

class LdapGroup extends LdapObject {
  constructor(private group: Group, baseDN: DN) {
    super(parseDN(`cn=${group.cn}, ${baseDN.toString()}`));
  }

  get attributes() {
    return {
      objectClass: 'groupOfNames',
      hasSubordinates: 'FALSE',
      cn: this.group.cn,
      gid: this.group.gid,
      members: this.group.members
    }
  }
}


export class LdapHandler {
  public rootObject: LdapObject;
  public groupBase: LdapObject;
  public userBase: LdapObject;

  constructor(private userStore: UserStore, private rootDN: DN, private domain: string) {
    this.rootObject = {
        dn: this.rootDN,
        attributes: {
            objectclass: ['top', 'dcObject', 'organization'],
            hasSubordinates: ['TRUE']
        }
    };
    this.groupBase = {
        dn: parseDN('ou=Groups, ' + this.rootDN),
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };
    this.userBase = {
        dn: parseDN('ou=Users, ' + this.rootDN),
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };

  }

  handleSearch(req: SearchRequest, res: Response) {
    if (req.baseObject.equals(this.groupBase.dn)) {
        this.handleGroups(req, res);
    }
    else if (req.baseObject.equals(this.userBase.dn)) {
        this.handleUsers(req, res);
    }
    else if (req.baseObject.equals(this.rootObject.dn)) {
        this.handleBase(req, res);
    }
    else if (req.baseObject.childOf(this.userBase.dn)) {
        this.handleSingleUser(req, res);
    }
    else if (req.baseObject.childOf(this.groupBase.dn)) {
        this.handleSingleGroup(req, res);
    }
  }

  private sendFilteredObjects(req: SearchRequest, res: Response, objects: LdapObject[]): void
  {
      objects
      .filter((obj) => req.filter.matches(obj.attributes))
      .forEach((obj) => res.send(obj));
  }

  private handleGroups(req: SearchRequest, res: Response): void
  {
    let result: LdapObject[] = [];
    if('base' == req.scope || 'sub' == req.scope) {
      result.push(this.groupBase);
    }
    if('one' == req.scope || 'sub' == req.scope) {
       result.push(...this.getGroups());
    }
    this.sendFilteredObjects(req, res, result);
  }

  private handleUsers(req: SearchRequest, res: Response): void
  {
    let result: LdapObject[] = [];
    if('base' == req.scope || 'sub' == req.scope) {
      result.push(this.userBase);
    }
    if('one' == req.scope || 'sub' == req.scope) {
       result.push(...this.getUsers());
    }
    this.sendFilteredObjects(req, res, result);
  }

  private handleSingleUser(req: SearchRequest, res: Response) {
    if('one' == req.scope) {
        // Do nothing
    }
    else
    {
      const cn = req.baseObject.rdns[0].cn;
      const user = this.getUser(cn);
      if(user)
      {
          res.send(user);
      }
    }
  }

  private handleSingleGroup(req: SearchRequest, res: Response) {
    if('one' == req.scope) {
        // Do nothing
    }
    else
    {
      const cn = req.baseObject.rdns[0].cn;
      const group = this.getGroup(cn);
      if(group)
      {
          res.send(group);
      }
    }
  }

  private handleBase(req: SearchRequest, res: Response) {
    let result: LdapObject[] = [];
    if('base' == req.scope) {
      result.push(this.rootObject);
    }
    else if('one' == req.scope) {
      result.push(this.groupBase, this.userBase);
    }
    else if('sub' == req.scope) {
      result.push(this.rootObject, this.groupBase, this.userBase);
      result.push(...this.getGroups());
      result.push(...this.getUsers());
      this.sendFilteredObjects(req, res, result);
    }
  };

  private getUser(cn: string) {
    return new LdapUser(this.userStore.getUser(cn), this.userBase.dn, this.domain);
  };

  private getGroup(cn: string) {
    return new LdapGroup(this.userStore.getGroup(cn), this.groupBase.dn);
  };

  private getUsers() {
    return this.userStore.getUsers().map((user) => new LdapUser(user, this.userBase.dn, this.domain));
  };

  private getGroups(){
    return this.userStore.getGroups().map((group) => new LdapGroup(group, this.groupBase.dn));
  }

}
