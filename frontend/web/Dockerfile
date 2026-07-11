FROM node:22-alpine AS builder

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL=http://localhost:3000
ARG VITE_RECAPTCHA_SITE_KEY=

RUN if [ -z "$VITE_CLERK_PUBLISHABLE_KEY" ]; then echo "ERROR: VITE_CLERK_PUBLISHABLE_KEY is required"; exit 1; fi

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
