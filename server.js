const express = require("express");
const fs = require("fs");
const path = require("path");
const { readNews, writeNews } = require("./storage");
const {
  SESSION_MS,
  signToken,
  verifyToken,
  getBearerToken,
} = require("./auth");

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
}

loadEnv();

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3000;
const MAX_TRIES = 20;

const ADMIN_USER = process.env.ADMIN_USER || "M75.zz";
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "tawjihii-dev-secret";

if (process.env.NODE_ENV === "production" && !ADMIN_PASS && !process.env.VERCEL) {
  console.warn("تحذير: عيّن ADMIN_PASS في متغيرات البيئة");
}

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function buildNewsFields(body, fallbackDate) {
  const { title, description, image, date, registrationLink } = body;

  const item = {
    title: title.trim(),
    description: description.trim(),
    image: image.trim(),
    date: date || fallbackDate || new Date().toISOString().split("T")[0],
  };

  const link =
    registrationLink && String(registrationLink).trim()
      ? String(registrationLink).trim()
      : "";

  if (link) item.registrationLink = link;

  return item;
}

function isValidSession(token) {
  return Boolean(verifyToken(token, SESSION_SECRET));
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  if (!isValidSession(token)) {
    return res.status(401).json({
      success: false,
      message: "يجب تسجيل الدخول كمسؤول",
    });
  }
  next();
}

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({
      success: false,
      message: "اسم المستخدم أو كلمة المرور غير صحيحة",
    });
  }

  const token = signToken(ADMIN_USER, SESSION_SECRET);

  res.json({
    success: true,
    token,
    expiresIn: SESSION_MS,
  });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

app.get("/api/admin/me", (req, res) => {
  const token = getBearerToken(req);
  const session = verifyToken(token, SESSION_SECRET);
  if (!session) {
    return res.status(401).json({ success: false, authenticated: false });
  }
  res.json({ success: true, authenticated: true, user: ADMIN_USER });
});

app.get("/api/news", async (req, res) => {
  try {
    const data = await readNews();
    res.json({
      success: true,
      count: data.news.length,
      news: data.news,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر قراءة الأخبار" });
  }
});

app.post("/api/news", requireAdmin, async (req, res) => {
  try {
    const { title, description, image, registrationLink, enableRegistration } =
      req.body || {};

    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "العنوان والوصف والصورة مطلوبة",
      });
    }

    if (enableRegistration && !registrationLink?.trim()) {
      return res.status(400).json({
        success: false,
        message: "أدخل رابط التسجيل في المدرسة",
      });
    }

    const data = await readNews();
    const newItem = {
      id: String(Date.now()),
      ...buildNewsFields(req.body),
    };

    data.news.unshift(newItem);
    await writeNews(data);

    res.status(201).json({ success: true, news: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حفظ الخبر" });
  }
});

app.put("/api/news/:id", requireAdmin, async (req, res) => {
  try {
    const { title, description, image, registrationLink, enableRegistration } =
      req.body || {};

    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "العنوان والوصف والصورة مطلوبة",
      });
    }

    if (enableRegistration && !registrationLink?.trim()) {
      return res.status(400).json({
        success: false,
        message: "أدخل رابط التسجيل في المدرسة",
      });
    }

    const data = await readNews();
    const index = data.news.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "الخبر غير موجود" });
    }

    const updated = {
      id: req.params.id,
      ...buildNewsFields(req.body, data.news[index].date),
    };

    data.news[index] = updated;
    await writeNews(data);

    res.json({ success: true, news: updated, message: "تم تحديث الخبر" });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر تحديث الخبر" });
  }
});

app.delete("/api/news/all", requireAdmin, async (req, res) => {
  try {
    const data = await readNews();
    const count = data.news.length;
    data.news = [];
    await writeNews(data);
    res.json({ success: true, message: "تم حذف جميع الأخبار", deleted: count });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حذف الأخبار" });
  }
});

app.delete("/api/news/:id", requireAdmin, async (req, res) => {
  try {
    if (req.params.id === "all") {
      return res.status(400).json({
        success: false,
        message: "استخدم DELETE /api/news/all",
      });
    }

    const data = await readNews();
    const before = data.news.length;
    data.news = data.news.filter((item) => item.id !== req.params.id);

    if (data.news.length === before) {
      return res.status(404).json({ success: false, message: "الخبر غير موجود" });
    }

    await writeNews(data);
    res.json({ success: true, message: "تم حذف الخبر" });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حذف الخبر" });
  }
});

function getPublicUrl(port) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.KOYEB_PUBLIC_DOMAIN) {
    return `https://${process.env.KOYEB_PUBLIC_DOMAIN}`;
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  return `http://localhost:${port}`;
}

function logStarted(port) {
  const host = getPublicUrl(port);
  console.log(`\n  TAWJIHII News Server`);
  console.log(`  الموقع:  ${host}`);
  console.log(`  Admin:   ${host}/admin.html`);
  console.log(`  API:     ${host}/api/news\n`);
}

function startProduction() {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0", () => logStarted(port));
}

function startServer(port, attempt = 0) {
  const server = app.listen(port, "0.0.0.0");

  server.on("listening", () => {
    const activePort = server.address().port;
    logStarted(activePort);
    if (activePort !== BASE_PORT) {
      console.log(`  ملاحظة: المنفذ ${BASE_PORT} كان مشغولاً — تم استخدام ${activePort}`);
    }
  });

  server.on("error", (err) => {
    server.close();

    if (err.code === "EADDRINUSE" && attempt < MAX_TRIES) {
      const nextPort = port + 1;
      console.warn(`  المنفذ ${port} مشغول، جاري تجربة ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    if (err.code === "EADDRINUSE") {
      console.error(`\n  تعذر إيجاد منفذ متاح (${BASE_PORT}–${BASE_PORT + MAX_TRIES}).`);
      console.error(`  أوقف العمليات القديمة: npm run stop\n`);
      process.exit(1);
    }

    throw err;
  });
}

module.exports = app;

if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === "production") {
    startProduction();
  } else {
    startServer(BASE_PORT);
  }
}
