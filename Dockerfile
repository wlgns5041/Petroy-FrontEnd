# --- React Build Stage ---
FROM node:20 AS build
WORKDIR /app

# package.json, package-lock.json만 먼저 복사 (캐시 활용)
COPY package*.json ./

# CI/CD 환경에서는 npm install 대신 npm ci (더 빠르고 일관성 보장)
RUN npm ci

# 나머지 소스 코드 복사
COPY . .

# 빌드 시 Node.js 메모리 제한 확장
RUN CI=true NODE_OPTIONS="--max_old_space_size=4096" npm run build


# --- Nginx Serve Stage ---
FROM nginx:alpine
# Nginx 기본 index.html 위치에 빌드 결과 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 기본 설정 수정 가능 (예: 리액트 라우팅 대응)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]