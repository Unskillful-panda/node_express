FROM node:16.13.1
ADD . /app/
WORKDIR /app
RUN npm install
EXPOSE 3300
CMD [ "npm","run", "start" ]