FROM node:alpine

# Create a working directory
WORKDIR /usr/app

# Relative to build context
COPY ./package.json ./
RUN npm install

# After dependencies are done, copy the rest
# This won't invalidate the cache on file change requiring new npm installs
COPY ./ ./

# Default command
CMD ["npm", "start"]
