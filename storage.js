const fs = require("fs");
const path = require("path");

const BLOB_PATHNAME = "tawjihii-news.json";

function getBundledPath() {
  return path.join(__dirname, "news.json");
}

function getLocalNewsPath() {
  const bundled = getBundledPath();
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const dataDir = process.env.DATA_DIR || path.join("/tmp", "tawjihii");
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const cloudFile = path.join(dataDir, "news.json");
      if (!fs.existsSync(cloudFile) && fs.existsSync(bundled)) {
        fs.copyFileSync(bundled, cloudFile);
      }
      if (fs.existsSync(cloudFile)) return cloudFile;
    } catch {
      /* fallback */
    }
  }
  return bundled;
}

function readNewsSync() {
  const raw = fs.readFileSync(getLocalNewsPath(), "utf8");
  return JSON.parse(raw);
}

function writeNewsSync(data) {
  fs.writeFileSync(getLocalNewsPath(), JSON.stringify(data, null, 2), "utf8");
}

function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readNewsBlob() {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });

  if (blobs.length > 0) {
    const res = await fetch(blobs[0].url);
    if (res.ok) return res.json();
  }

  const initial = readNewsSync();
  await writeNewsBlob(initial);
  return initial;
}

async function writeNewsBlob(data) {
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readNews() {
  if (useBlobStorage()) return readNewsBlob();
  return readNewsSync();
}

async function writeNews(data) {
  if (useBlobStorage()) return writeNewsBlob(data);
  writeNewsSync(data);
}

module.exports = { readNews, writeNews, readNewsSync, writeNewsSync };
