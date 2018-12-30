import express from 'express';
import { Response, Request } from "express";


export class FormServer {
  constructor(
    app = express()
  ){
    app.get('/login', this.sendForm('login'));
    app.get('/styles/:style_name([A-Za-z0-9_]+).css', this.sendStyle);
  }

  private sendForm(form_name: string) {
    return function(_: Request, res: Response) {
      res.sendfile(`${__dirname}/forms/${form_name}.html`)
    }
  }

  private sendStyle(req: Request, res: Response) {
    res.sendfile(`${__dirname}/styles/${req.param('style_name')}.css`)
  }

}
