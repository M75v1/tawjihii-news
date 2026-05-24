const TOKEN_KEY = "tawjihii_admin_token";
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const adminForm = document.getElementById("adminForm");
const formMessage = document.getElementById("formMessage");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const adminNewsList = document.getElementById("adminNewsList");
const newsListCount = document.getElementById("newsListCount");
const logoutBtn = document.getElementById("logoutBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const adminUserEl = document.getElementById("adminUser");
const themeToggle = document.getElementById("themeToggle");
const dateInput = document.getElementById("date");
const editIdInput = document.getElementById("editId");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const enableRegistration = document.getElementById("enableRegistration");
const registrationLinkRow = document.getElementById("registrationLinkRow");
const registrationLinkInput = document.getElementById("registrationLink");

let newsCache = [];

dateInput.value = new Date().toISOString().split("T")[0];

function toggleRegistrationField() {
  if (enableRegistration.checked) {
    registrationLinkRow.classList.remove("hidden");
    registrationLinkInput.required = true;
  } else {
    registrationLinkRow.classList.add("hidden");
    registrationLinkInput.required = false;
    registrationLinkInput.value = "";
  }
}

enableRegistration.addEventListener("change", toggleRegistrationField);

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function adminFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setToken(null);
    showLogin();
    throw new Error("انتهت الجلسة — سجّل الدخول مجدداً");
  }

  if (!res.ok) {
    throw new Error(data.message || "حدث خطأ");
  }

  return data;
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
  resetForm();
}

function showDashboard(username) {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  adminUserEl.textContent = username ? `@${username}` : "";
}

function initTheme() {
  const saved = localStorage.getItem("tawjihii-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute(
    "data-theme",
    saved || (prefersDark ? "dark" : "light")
  );
}

themeToggle.addEventListener("click", () => {
  const next =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tawjihii-theme", next);
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function resetForm() {
  adminForm.reset();
  editIdInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];
  enableRegistration.checked = false;
  toggleRegistrationField();
  formTitle.textContent = "إضافة خبر جديد";
  formSubtitle.textContent = "يُحفظ في news.json ويظهر فوراً في الموقع و API";
  submitBtn.textContent = "نشر الخبر";
  cancelEditBtn.classList.add("hidden");
}

function startEdit(item) {
  editIdInput.value = item.id;
  document.getElementById("title").value = item.title;
  document.getElementById("description").value = item.description;
  document.getElementById("image").value = item.image;
  dateInput.value = item.date || new Date().toISOString().split("T")[0];

  if (item.registrationLink) {
    enableRegistration.checked = true;
    registrationLinkInput.value = item.registrationLink;
  } else {
    enableRegistration.checked = false;
    registrationLinkInput.value = "";
  }
  toggleRegistrationField();

  formTitle.textContent = "تعديل الخبر";
  formSubtitle.textContent = `تعديل: ${item.title}`;
  submitBtn.textContent = "حفظ التعديلات";
  cancelEditBtn.classList.remove("hidden");
  document.querySelector(".admin-card").scrollIntoView({ behavior: "smooth" });
}

function getFormPayload() {
  const hasRegistration = enableRegistration.checked;
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    image: document.getElementById("image").value.trim(),
    date: dateInput.value,
    enableRegistration: hasRegistration,
    registrationLink: hasRegistration ? registrationLinkInput.value.trim() : "",
  };
}

cancelEditBtn.addEventListener("click", resetForm);

async function checkAuth() {
  const token = getToken();
  if (!token) {
    showLogin();
    return;
  }

  try {
    const res = await fetch("/api/admin/me", { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok || !data.authenticated) {
      setToken(null);
      showLogin();
      return;
    }

    showDashboard(data.user);
    await loadAdminNews();
  } catch {
    showLogin();
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMessage.textContent = "";
  loginMessage.className = "form-message";

  const btn = loginForm.querySelector("button[type=submit]");
  btn.disabled = true;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل تسجيل الدخول");

    setToken(data.token);
    showDashboard(document.getElementById("username").value.trim());
    loginForm.reset();
    await loadAdminNews();
  } catch (err) {
    loginMessage.textContent = err.message || "خطأ في تسجيل الدخول";
    loginMessage.classList.add("error");
  } finally {
    btn.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: authHeaders(),
    });
  } catch {
    /* ignore */
  }
  setToken(null);
  showLogin();
});

function renderAdminList(items) {
  newsListCount.textContent = `${items.length} خبر`;
  deleteAllBtn.disabled = items.length === 0;

  if (!items.length) {
    adminNewsList.innerHTML =
      '<p class="empty-state" style="padding:1rem">لا توجد أخبار. أضف خبراً من النموذج أعلاه.</p>';
    return;
  }

  adminNewsList.innerHTML = items
    .map(
      (item) => `
    <div class="admin-news-item" data-id="${escapeHtml(item.id)}">
      <img class="admin-news-thumb" src="${escapeHtml(item.image)}" alt="" />
      <div class="admin-news-info">
        <h4>${escapeHtml(item.title)}</h4>
        <span>${escapeHtml(item.date)}</span>
        ${item.registrationLink ? '<span class="badge-register">زر التسجيل مفعّل</span>' : ""}
        <p class="admin-news-desc">${escapeHtml(item.description)}</p>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="btn-edit" data-action="edit">تعديل</button>
        <button type="button" class="btn-danger" data-action="delete">حذف</button>
      </div>
    </div>`
    )
    .join("");

  adminNewsList.querySelectorAll(".admin-news-item").forEach((row) => {
    const id = row.dataset.id;
    const item = items.find((n) => n.id === id);

    row.querySelector('[data-action="edit"]').addEventListener("click", () => {
      if (item) startEdit(item);
    });

    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteNews(id, item?.title);
    });
  });
}

async function loadAdminNews() {
  try {
    const res = await fetch("/api/news");
    const data = await res.json();
    if (!data.success) throw new Error();

    newsCache = data.news;
    renderAdminList(newsCache);
  } catch {
    adminNewsList.innerHTML =
      '<p class="form-message error">تعذر تحميل الأخبار</p>';
  }
}

async function deleteNews(id, title) {
  const label = title ? `"${title}"` : "هذا الخبر";
  if (!confirm(`هل تريد حذف ${label}؟`)) return;

  try {
    await adminFetch(`/api/news/${id}`, { method: "DELETE" });
    if (editIdInput.value === id) resetForm();
    formMessage.textContent = "تم حذف الخبر";
    formMessage.className = "form-message success";
    await loadAdminNews();
  } catch (err) {
    alert(err.message || "تعذر الحذف");
  }
}

deleteAllBtn.addEventListener("click", async () => {
  if (!newsCache.length) return;

  const ok = confirm(
    `تحذير: سيتم حذف جميع الأخبار (${newsCache.length}).\nهل أنت متأكد؟`
  );
  if (!ok) return;

  const confirmAgain = confirm("تأكيد نهائي: حذف كل الأخبار لا يمكن التراجع عنه.");
  if (!confirmAgain) return;

  try {
    const data = await adminFetch("/api/news/all", { method: "DELETE" });
    resetForm();
    formMessage.textContent = data.message || "تم حذف جميع الأخبار";
    formMessage.className = "form-message success";
    await loadAdminNews();
  } catch (err) {
    alert(err.message || "تعذر الحذف");
  }
});

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "form-message";

  const btn = submitBtn;
  btn.disabled = true;

  const payload = getFormPayload();
  const editingId = editIdInput.value;

  try {
    if (editingId) {
      await adminFetch(`/api/news/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      formMessage.textContent = "تم تحديث الخبر بنجاح!";
    } else {
      await adminFetch("/api/news", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      formMessage.textContent = "تم نشر الخبر بنجاح!";
    }

    formMessage.classList.add("success");
    resetForm();
    await loadAdminNews();
  } catch (err) {
    formMessage.textContent = err.message || "حدث خطأ";
    formMessage.classList.add("error");
  } finally {
    btn.disabled = false;
  }
});

initTheme();
checkAuth();
