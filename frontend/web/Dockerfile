FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
