FROM node:alpine

WORKDIR /home/node/app

COPY package.json /home/node/app
COPY yarn.lock /home/node/app

RUN apk add -t .builddeps python make g++ && yarn install && apk del .builddeps

COPY . /home/node/app

RUN yarn build:main

CMD node build/main/index.js
