# TAWJIHII News

موقع أخبار لتطبيق **TAWJIHII** (Android) مع API JSON ولوحة إدارة محمية.

## الميزات

- صفحة أخبار عامة (عربي، RTL، Responsive، Dark Mode)
- API: `GET /api/news`
- لوحة Admin: إضافة / تعديل / حذف الأخبار
- زر اختياري «التسجيل في المدرسة» مع رابط مخصص لكل خبر

## التشغيل محلياً

```bash
npm install
cp .env.example .env
# عدّل .env (اسم المستخدم وكلمة المرور)
npm start
```

- الموقع: http://localhost:3000  
- الإدارة: http://localhost:3000/admin.html  
- API: http://localhost:3000/api/news  

## متغيرات البيئة (`.env`)

| المتغير | الوصف |
|---------|--------|
| `ADMIN_USER` | اسم مستخدم لوحة الإدارة |
| `ADMIN_PASS` | كلمة المرور |
| `SESSION_SECRET` | مفتاح الجلسات |
| `PORT` | المنفذ (افتراضي 3000) |

> لا ترفع ملف `.env` إلى GitHub.

## API للأندرويد

```http
GET /api/news
```

```json
{
  "success": true,
  "count": 1,
  "news": [
    {
      "id": "1",
      "title": "...",
      "description": "...",
      "image": "https://...",
      "date": "2026-05-24",
      "registrationLink": "https://..."
    }
  ]
}
```

`registrationLink` اختياري — يظهر فقط عند تفعيل زر التسجيل.

## النشر على الإنترنت

المشروع يحتاج **Node.js** (Express). استخدم خدمات مثل:

- [Render](https://render.com)
- [Railway](https://railway.app)
- VPS

GitHub Pages لا يدعم خادم Node مباشرة.

## الترخيص

MIT
