FROM node:16-alpine
EXPOSE 3000

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Disable telemetry. Further details: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js app for production
RUN npm run build

# Define the command to run the app
CMD [ "npm", "start" ]
