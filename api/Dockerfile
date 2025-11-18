FROM node:25-alpine

# make the 'app' folder the current working directory
WORKDIR /app

# Copy package[-lock].json
COPY package*.json ./

# Install node modules
# NOTE: if node_modules is on a volume, this might causes
#   issues when e.g. changing node/npm versions (package will seem
#   to be installed already, but it's not the correct version and will not work,
#   so you have to enter the container, remove the node_modules dir and install again)
RUN npm install

# Copy project files
COPY . .

# Open port 3001, the port we use with Express
EXPOSE 3001

# Script that will start the server
CMD [ "npm", "start"]
