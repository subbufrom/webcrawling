FROM node:8

WORKDIR /usr/src/app

COPY . .

# RUN mkdir common/logger/log
RUN npm i

EXPOSE 3001

RUN node --version
CMD ["npm", "start"]