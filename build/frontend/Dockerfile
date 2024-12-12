FROM node:22.1.0

WORKDIR /frontend

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .

EXPOSE 3000

CMD [ "sh","-c","npm run dev" ]