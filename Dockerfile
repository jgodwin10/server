FROM node:latest

WORKDIR /app

ENV JWT_SECRET=test@123
ENV NODE_ENV=development
ENV API_KEY=293539513478673
ENV API_SECRET=F4X4iJctqKJ1hn2rjcNaKvpp_KY
ENV CLOUD_NAME=dpp62zrrn

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]