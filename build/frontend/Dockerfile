# Base image
FROM node:22.1.0 as base
WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .

# Development stage
FROM base as dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Production stage
FROM base as prod
ENV NODE_ENV=production
RUN npm run build
CMD ["npm", "run", "start"]
