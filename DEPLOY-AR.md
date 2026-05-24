# نشر TAWJIHII على استضافة مجانية

أفضل خيار مجاني لمشروع Node.js + Express هو **Render** (مجاني مع بعض القيود).

---

## الخيار 1: Render (موصى به — مجاني)

### الخطوة 1 — حساب Render

1. ادخل إلى [render.com](https://render.com) وسجّل بحساب GitHub.
2. افتح رابط النشر المباشر:

   **https://render.com/deploy?repo=https://github.com/M75v1/tawjihii-news**

### الخطوة 2 — الإعداد

| الإعداد | القيمة |
|---------|--------|
| الاسم | `tawjihii-news` |
| **ADMIN_PASS** | كلمة مرور لوحة الإدارة (مطلوب) |
| **ADMIN_USER** | `M75.zz` |
| **SESSION_SECRET** | يُولَّد تلقائياً |

اضغط **Apply** ثم **Create Web Service**.

### الخطوة 3 — الانتظار

- أول نشر يستغرق **5–10 دقائق**.
- عند النجاح ستظهر حالة **Live**.

### روابطك بعد النشر

```
https://tawjihii-news.onrender.com
https://tawjihii-news.onrender.com/admin.html
https://tawjihii-news.onrender.com/api/news
```

استخدم رابط API في تطبيق Android.

### ملاحظات الخطة المجانية

- الخادم **ينام** بعد 15 دقيقة بدون زيارات — أول طلب قد يستغرق ~30 ثانية.
- الأخبار تُحفظ أثناء التشغيل؛ عند إعادة تشغيل الخادم قد تعود للنسخة الافتراضية من `news.json`.

---

## الخيار 2: Render يدوياً (بدون Blueprint)

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. اربط مستودع: `M75v1/tawjihii-news`
3. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `ADMIN_USER` = `M75.zz`
   - `ADMIN_PASS` = (كلمة مرورك)
   - `SESSION_SECRET` = نص عشوائي طويل
5. **Create Web Service**

---

## الخيار 3: Koyeb (مجاني — موصى به)

راجع الدليل الكامل: **[DEPLOY-KOYEB.md](./DEPLOY-KOYEB.md)**

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&builder=dockerfile&repository=github.com/M75v1/tawjihii-news&branch=main&name=tawjihii-news&ports=3000;http;/&env[NODE_ENV]=production&env[ADMIN_USER]=M75.zz)

---

## ما لا يعمل مجاناً لهذا المشروع

| الخدمة | السبب |
|--------|--------|
| GitHub Pages | لا يشغّل Node.js/Express |
| Netlify (عادي) | للمواقع الثابتة فقط |

---

## بعد النشر

1. افتح `/admin.html` وسجّل الدخول.
2. أضف أخباراً من لوحة الإدارة.
3. في Android غيّر عنوان API إلى رابط Render.

---

## تحديث الموقع لاحقاً

كل `git push` على GitHub يعيد النشر تلقائياً على Render إذا كان الربط مفعّلاً.

```bash
git add .
git commit -m "تحديث"
git push origin main
```
