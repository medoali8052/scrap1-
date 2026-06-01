# استخدام بيئة Node.js خفيفة
FROM node:20-alpine

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملفات الحزم وتسطيبها
COPY package*.json ./
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# فتح البورت اللي بيحتاجه Hugging Face
EXPOSE 7860

# أمر التشغيل
CMD ["npm", "start"]
