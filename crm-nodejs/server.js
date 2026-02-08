const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 10000;

// АБСОЛЮТНЫЙ ПУТЬ К ФРОНТЕНДУ
const publicPath = path.join(__dirname, "public");
console.log("📁 Путь к фронтенду:", publicPath);

// Проверяем, существует ли папка public
if (!fs.existsSync(publicPath)) {
  console.error("❌ ОШИБКА: Папка 'public' не найдена по пути:", publicPath);
  console.error("   Содержимое текущей директории:");
  fs.readdirSync(__dirname).forEach(file => console.error("   -", file));
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// СТАТИЧЕСКИЕ ФАЙЛЫ
app.use(express.static(publicPath, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    const mimeTypes = {
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml"
    };
    if (mimeTypes[ext]) {
      res.setHeader("Content-Type", mimeTypes[ext]);
    }
  }
}));

// DEBUG маршрут - показывает список JS файлов
app.get("/api/debug/js-files", (req, res) => {
  try {
    const jsPath = path.join(publicPath, "js", "modules");
    const files = fs.existsSync(jsPath) ? fs.readdirSync(jsPath) : [];
    res.json({
      success: true,
      publicPath: publicPath,
      jsModules: files,
      allFiles: fs.readdirSync(publicPath)
    });
  } catch (error) {
    res.json({ error: error.message, path: publicPath });
  }
});

// API Health
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "CRM работает",
    version: "2.0",
    time: new Date().toISOString()
  });
});

// Все маршруты -> index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`
========================================
🚀 ВЕРТУМ CRM ЗАПУЩЕН
========================================
📍 Порт: ${PORT}
📍 URL: https://crm-nodejs-xtr8.onrender.com
📍 Фронтенд: ${publicPath}
========================================
  `);
});
