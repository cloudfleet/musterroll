import ldapjs from 'ldapjs';
import { EventEmitter } from "events";

declare module 'ldapjs' {

  export class InvalidCredentialsError {}

  export interface DN {
    childOf(dn: string | DN): boolean;
    parent(): DN;
    equals(dn: string | DN): boolean;

    rdns: any[];
  }

  export interface Request {
    credentials: string;
    dn: DN;
  }

  export interface SearchRequest extends Request {
    baseObject: DN;
    scope: string;
    filter: Filter;
  }

  export interface Response {
    end(code?: number): void;
    send(object: any): void;
  }

  export interface SearchRequestHandler {
      // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2
      (req: SearchRequest, res: Response, next: NextFunction): any;
  }

  export interface RequestHandler {
      // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2
      (req: Request, res: Response, next: NextFunction): any;
  }

  export interface NextFunction {
    // tslint:disable-next-line callable-types (In ts2.1 it thinks the type alias has no call signatures)
    (err?: any): void;
  }

  export interface ServerOptions {
    log?: any;
    certificate?: string;
    key?: string;
  }

  export interface Server extends EventEmitter {
    url: string;

    listen(port: number, callback?: Function): void;

    bind(dn: string | DN, ...handlers: RequestHandler[]): void;
    search(dn: string | DN, ...handlers: SearchRequestHandler[]): void;
  }

  export function createServer(options?: ServerOptions): Server;

  export function parseDN(dn: string): DN;

}
