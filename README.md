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

## استضافة مجانية

### Koyeb (موصى به)

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&builder=dockerfile&repository=github.com/M75v1/tawjihii-news&branch=main&name=tawjihii-news&ports=3000;http;/&env[NODE_ENV]=production&env[ADMIN_USER]=M75.zz)

**دليل Koyeb بالعربية:** [DEPLOY-KOYEB.md](./DEPLOY-KOYEB.md)

1. اضغط الزر → سجّل بحساب GitHub.
2. أضف `ADMIN_PASS` و `SESSION_SECRET`.
3. الرابط: `https://tawjihii-news-<حسابك>.koyeb.app`

### Render (بديل)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/M75v1/tawjihii-news)

**دليل Render:** [DEPLOY-AR.md](./DEPLOY-AR.md)

| المتغير | مطلوب |
|---------|--------|
| `ADMIN_USER` | نعم |
| `ADMIN_PASS` | نعم |
| `SESSION_SECRET` | نعم |

## الترخيص

MIT
