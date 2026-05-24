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

## استضافة مجانية (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/M75v1/tawjihii-news)

**دليل مفصل بالعربية:** [DEPLOY-AR.md](./DEPLOY-AR.md)

1. اضغط الزر أعلاه (حساب Render مجاني).
2. أدخل **ADMIN_PASS** عند الإنشاء.
3. بعد 5–10 دقائق: `https://tawjihii-news.onrender.com`

| المتغير | مطلوب |
|---------|--------|
| `ADMIN_USER` | نعم |
| `ADMIN_PASS` | نعم |
| `SESSION_SECRET` | يُولَّد تلقائياً |

## الترخيص

MIT
