FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install 

RUN npx playwright install

COPY . .

# EXPOSE 3000

CMD ["npx", "playwright", "test"]
