const API_URL = "/api/news";
const newsGrid = document.getElementById("newsGrid");
const newsCountEl = document.getElementById("newsCount");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

document.getElementById("year").textContent = new Date().getFullYear();

function initTheme() {
  const saved = localStorage.getItem("tawjihii-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tawjihii-theme", next);
});

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderNews(items) {
  if (!items.length) {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <p>لا توجد أخبار حالياً.</p>
      </div>`;
    return;
  }

  newsGrid.innerHTML = items
    .map(
      (item, i) => `
      <article class="news-card" style="animation-delay: ${i * 0.08}s">
        <div class="news-card-image">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <span class="news-card-date">${formatDate(item.date)}</span>
        </div>
        <div class="news-card-body">
          <h3 class="news-card-title">${escapeHtml(item.title)}</h3>
          <p class="news-card-desc">${escapeHtml(item.description)}</p>
          ${
            item.registrationLink
              ? `<a href="${escapeHtml(item.registrationLink)}" class="btn-register" target="_blank" rel="noopener noreferrer">التسجيل في المدرسة</a>`
              : ""
          }
        </div>
      </article>`
    )
    .join("");
}

async function loadNews() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    newsCountEl.textContent = data.count;
    renderNews(data.news);
  } catch {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <p>تعذر تحميل الأخبار. تأكد أن الخادم يعمل.</p>
      </div>`;
  }
}

initTheme();
loadNews();
