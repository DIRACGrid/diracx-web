# Minimize the size and complexity of the final Docker image by separating the
# build stage and the runtime stage into two different steps

# Stage 1: Build the Next.js application
FROM node:alpine AS build
WORKDIR /app
# Copy the application to the working directory
COPY package*.json ./
COPY packages/diracx-web ./packages/diracx-web
COPY packages/diracx-web-components ./packages/diracx-web-components
# Install the project dependencies
RUN npm ci
# Build the static export with telemetry disabled (https://nextjs.org/telemetry)
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# Stage 2: Copy the website from the previous container to a Nginx container
FROM nginxinc/nginx-unprivileged:alpine
EXPOSE 8080
COPY --from=build /app/packages/diracx-web/out /usr/share/nginx/html
COPY ./config/nginx/default.conf /etc/nginx/conf.d/default.conf
