# use official Node image
FROM node:18

# create app directory
WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy app code
COPY . .

# expose port
EXPOSE 3000

# start app
CMD ["npm", "start"]
