FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Variáveis NEXT_PUBLIC_* são inlined no bundle no build, não em runtime — precisam existir
# antes do `next build`. Achado no caminho: `gcloud run deploy --set-build-env-vars` só chega em
# builds via Buildpacks, não builds a partir de Dockerfile (nosso caso) — por isso o valor vem
# direto como default do ARG aqui, e não via flag do deploy.
ARG NEXT_PUBLIC_API_URL=https://querencia-erp-backend-810890697148.southamerica-east1.run.app
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
