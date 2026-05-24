const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
const NEWS_FILE = path.join(__dirname, "news.json");

const ADMIN_USER = process.env.ADMIN_USER || "M75.zz";
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "tawjihii-dev-secret";
const SESSION_MS = 24 * 60 * 60 * 1000;

const sessions = new Map();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function readNews() {
  const raw = fs.readFileSync(NEWS_FILE, "utf8");
  return JSON.parse(raw);
}

function writeNews(data) {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), "utf8");
}

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

  if (link) {
    item.registrationLink = link;
  }

  return item;
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

function isValidSession(token) {
  if (!token || !sessions.has(token)) return false;
  const expiry = sessions.get(token);
  if (Date.now() > expiry) {
    sessions.delete(token);
    return false;
  }
  return true;
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

  const token = createToken();
  sessions.set(token, Date.now() + SESSION_MS);

  res.json({
    success: true,
    token,
    expiresIn: SESSION_MS,
  });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = getBearerToken(req);
  sessions.delete(token);
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

app.get("/api/admin/me", (req, res) => {
  const token = getBearerToken(req);
  if (!isValidSession(token)) {
    return res.status(401).json({ success: false, authenticated: false });
  }
  res.json({ success: true, authenticated: true, user: ADMIN_USER });
});

app.get("/api/news", (req, res) => {
  try {
    const data = readNews();
    res.json({
      success: true,
      count: data.news.length,
      news: data.news,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر قراءة الأخبار" });
  }
});

app.post("/api/news", requireAdmin, (req, res) => {
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

    const data = readNews();
    const newItem = {
      id: String(Date.now()),
      ...buildNewsFields(req.body),
    };

    data.news.unshift(newItem);
    writeNews(data);

    res.status(201).json({ success: true, news: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حفظ الخبر" });
  }
});

app.put("/api/news/:id", requireAdmin, (req, res) => {
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

    const data = readNews();
    const index = data.news.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "الخبر غير موجود" });
    }

    const updated = {
      id: req.params.id,
      ...buildNewsFields(req.body, data.news[index].date),
    };

    data.news[index] = updated;
    writeNews(data);

    res.json({ success: true, news: updated, message: "تم تحديث الخبر" });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر تحديث الخبر" });
  }
});

app.delete("/api/news/all", requireAdmin, (req, res) => {
  try {
    const data = readNews();
    const count = data.news.length;
    data.news = [];
    writeNews(data);
    res.json({ success: true, message: "تم حذف جميع الأخبار", deleted: count });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حذف الأخبار" });
  }
});

app.delete("/api/news/:id", requireAdmin, (req, res) => {
  try {
    if (req.params.id === "all") {
      return res.status(400).json({ success: false, message: "استخدم DELETE /api/news/all" });
    }

    const data = readNews();
    const before = data.news.length;
    data.news = data.news.filter((item) => item.id !== req.params.id);

    if (data.news.length === before) {
      return res.status(404).json({ success: false, message: "الخبر غير موجود" });
    }

    writeNews(data);
    res.json({ success: true, message: "تم حذف الخبر" });
  } catch (err) {
    res.status(500).json({ success: false, message: "تعذر حذف الخبر" });
  }
});

function startServer(port, attempt = 0) {
  const server = app.listen(port);

  server.on("listening", () => {
    const activePort = server.address().port;
    console.log(`\n  TAWJIHII News Server`);
    console.log(`  الموقع:  http://localhost:${activePort}`);
    console.log(`  Admin:   http://localhost:${activePort}/admin.html`);
    console.log(`  API:     http://localhost:${activePort}/api/news`);
    if (activePort !== BASE_PORT) {
      console.log(`  ملاحظة: المنفذ ${BASE_PORT} كان مشغولاً — تم استخدام ${activePort}`);
    }
    console.log("");
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

startServer(BASE_PORT);
