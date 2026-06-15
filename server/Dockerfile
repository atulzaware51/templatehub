FROM node:20-alpine
WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci --production

# copy source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/server.js"]
