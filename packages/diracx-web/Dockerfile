# Minimize the size and complexity of the final Docker image by separating the
# build stage and the runtime stage into two different steps

# Stage 1: Build the Next.js application
FROM node:alpine AS build
WORKDIR /app
# Install the project dependencies
COPY package*.json ./
RUN npm ci
# Copy the rest of the application to the working directory
COPY . .
# Build the static export with telemetry disabled (https://nextjs.org/telemetry)
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# Stage 2: Copy the website from the previous container to a Nginx container
FROM nginxinc/nginx-unprivileged:alpine
EXPOSE 8080
COPY --from=build /app/out /usr/share/nginx/html
COPY ./config/nginx/default.conf /etc/nginx/conf.d/default.conf
