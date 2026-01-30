FROM node:20-alpine
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install --legacy-peer-deps
COPY . /app
EXPOSE 4200
CMD ["npm", "start"]
