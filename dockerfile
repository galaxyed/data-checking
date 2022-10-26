FROM node:14.19.3-alpine
RUN mkdir -p /code 
WORKDIR /code

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      chromium 

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./

# Install dependencies
RUN yarn install --frozen-lockfile
# Build app
# RUN yarn build
COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]