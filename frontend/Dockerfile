FROM node:22-alpine

WORKDIR /app

COPY package.json ./

# 1. Install dependencies with legacy support for React 19
RUN npm install --legacy-peer-deps

# 2. FORCE UNINSTALL any accidental v4 versions (ADD FLAG HERE)
RUN npm uninstall tailwindcss postcss autoprefixer --legacy-peer-deps

# 3. FORCE INSTALL specific stable v3 versions
RUN npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17 --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]