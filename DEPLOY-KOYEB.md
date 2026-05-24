# نشر TAWJIHII على Koyeb (مجاني)

[Koyeb](https://www.koyeb.com) يقدم خطة مجانية مناسبة لتطبيق Node.js + Express.

---

## الطريقة السريعة (زر واحد)

1. افتح الرابط:

   **https://app.koyeb.com/deploy?type=git&builder=dockerfile&repository=github.com/M75v1/tawjihii-news&branch=main&name=tawjihii-news&ports=3000;http;/&env[NODE_ENV]=production&env[ADMIN_USER]=M75.zz**

2. سجّل الدخول بحساب **GitHub** واربط المستودع.
3. في **Environment variables** أضف:
   - `ADMIN_PASS` = كلمة مرور لوحة الإدارة
   - `SESSION_SECRET` = نص عشوائي طويل (مثل: `abc123xyz789secret`)
4. اضغط **Deploy**.
5. انتظر 3–8 دقائق حتى تصبح الحالة **Healthy**.

---

## الطريقة اليدوية (لوحة التحكم)

1. ادخل إلى [app.koyeb.com](https://app.koyeb.com)
2. **Create Web Service** → **GitHub**
3. اختر المستودع: `M75v1/tawjihii-news` — الفرع `main`
4. **Builder:** Dockerfile (أو Buildpack إذا أردت بدون Docker)
5. **Instance:** Nano (مجاني)
6. **Ports:** `3000` — HTTP — المسار `/`
7. **Environment variables:**

| المتغير | القيمة |
|---------|--------|
| `NODE_ENV` | `production` |
| `ADMIN_USER` | `M75.zz` |
| `ADMIN_PASS` | كلمة مرورك |
| `SESSION_SECRET` | نص عشوائي طويل |

8. **Deploy**

---

## روابطك بعد النشر

```
https://<اسم-التطبيق>-<اسم-الحساب>.koyeb.app
https://<اسم-التطبيق>-<اسم-الحساب>.koyeb.app/admin.html
https://<اسم-التطبيق>-<اسم-الحساب>.koyeb.app/api/news
```

ستجد الرابط الدقيق في لوحة Koyeb → Service → **Public URL**.

---

## تطبيق Android

غيّر عنوان API من `localhost` إلى:

```
https://YOUR-APP.koyeb.app/api/news
```

---

## تحديث الموقع

كل `git push` على `main` يعيد النشر تلقائياً إذا كان الربط مع GitHub مفعّلاً.

```bash
git add .
git commit -m "تحديث"
git push origin main
```

---

## ملاحظات

- الخطة المجانية: الخدمة قد تتوقف عند عدم الاستخدام (Scale to Zero) — أول زيارة قد تتأخر قليلاً.
- الأخبار تُحفظ في `/tmp` أثناء التشغيل؛ عند إعادة تشغيل الحاوية قد تعود للنسخة الافتراضية من `news.json`.
- لا ترفع ملف `.env` — استخدم متغيرات البيئة في Koyeb فقط.
