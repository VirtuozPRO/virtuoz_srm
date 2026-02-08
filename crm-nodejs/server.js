const express = require("express");
const app = express();
const path = require("path");

// ========== НАСТРОЙКА КОДИРОВКИ UTF-8 ==========
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  next();
});

// Обслуживание статических файлов (фронтенд)
app.use(express.static(path.join(__dirname, "public")));

// API маршруты
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CRM работает" });
});

// Основной маршрут - отдаем index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`
========================================
🚀 ВЕРТУМ CRM ЗАПУЩЕН НА RENDER!
========================================
📍 Порт: ${PORT}
📍 Ссылка: https://your-app.onrender.com
📍 Путь: ${__dirname}
📅 Дата: ${new Date().toLocaleString()}
========================================

Доступные маршруты:
✅ /           - Интерфейс CRM
✅ /api/health - Проверка API
✅ /uploads/*  - Отчеты HTML
✅ /scenarios/* - JSON сценарии
`);
});
