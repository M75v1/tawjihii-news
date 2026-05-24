# نشر TAWJIHII على Vercel (مجاني)

## الخطوة 1 — حساب Vercel

1. ادخل إلى [vercel.com](https://vercel.com) وسجّل بحساب **GitHub**.
2. اضغط **Add New → Project**.
3. اختر المستودع: `M75v1/tawjihii-news`.
4. اضغط **Import**.

## الخطوة 2 — إعداد المشروع

| الإعداد | القيمة |
|---------|--------|
| Framework Preset | Other |
| Build Command | *(اتركه فارغاً)* |
| Output Directory | *(اتركه فارغاً)* |
| Install Command | `npm install` |

## الخطوة 3 — متغيرات البيئة

في **Environment Variables** أضف:

| المتغير | القيمة |
|---------|--------|
| `NODE_ENV` | `production` |
| `ADMIN_USER` | `M75.zz` |
| `ADMIN_PASS` | كلمة مرور لوحة الإدارة |
| `SESSION_SECRET` | نص عشوائي طويل |

## الخطوة 4 — تخزين الأخبار (مهم)

لحفظ الأخبار بشكل دائم على Vercel:

1. في لوحة المشروع → **Storage** → **Create Database**.
2. اختر **Blob** → أنشئ Store باسم `tawjihii-blob`.
3. اربطه بالمشروع — يُضاف تلقائياً `BLOB_READ_WRITE_TOKEN`.

بدون Blob، الأخبار قد لا تُحفظ بعد إعادة التشغيل.

## الخطوة 5 — النشر

اضغط **Deploy** وانتظر 1–3 دقائق.

---

## روابطك

```
https://tawjihii-news.vercel.app
https://tawjihii-news.vercel.app/admin.html
https://tawjihii-news.vercel.app/api/news
```

*(قد يختلف الاسم حسب إعدادات المشروع)*

---

## تطبيق Android

```
https://YOUR-PROJECT.vercel.app/api/news
```

---

## تحديث الموقع

كل `git push` على `main` يعيد النشر تلقائياً.

---

## رابط سريع

**https://vercel.com/new/clone?repository-url=https://github.com/M75v1/tawjihii-news**
