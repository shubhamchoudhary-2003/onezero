FROM node:18.17.1-buster-slim 

WORKDIR /app/medusa

RUN apt-get update &&  \
    apt-get install -y python3.11 && \ 
    apt-get install -y build-essential && \
    npm install -g npm@latest --python=python3.11
#RUN npm config set python python3.11
ARG NPM_TOKEN  

ENV NPM_TOKEN=${NPM_TOKEN}

#COPY .npmrc  .npmrc

COPY yarn.lock  yarn.lock

COPY package.json package.json

COPY medusa-config.js medusa-config.js

COPY src/ src/

COPY develop.sh ./

COPY tsconfig.json tsconfig.json
COPY tsconfig.admin.json tsconfig.admin.json
COPY tsconfig.server.json tsconfig.server.json



RUN npm install -g @medusajs/medusa-cli@latest 

RUN yarn global add node-gyp
#RUN --mount=type=secret,id=npmrc,target=/root/.npmrc yarn

RUN yarn --ignore-engines

RUN rm -f .npmrc

RUN yarn run build

RUN yarn cache clean

ENTRYPOINT ["./develop.sh", "develop"]
