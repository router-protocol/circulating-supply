FROM node:20.13-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5001
CMD [ "node", "src/index.js" ]
