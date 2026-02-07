require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');
const multer = require('multer');
const XLSX = require('xlsx');
const PDFParser = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // ← ВАЖНО!
app.use(express.urlencoded({ extended: true }));

// ========== НАСТРОЙКА ЗАГРУЗКИ ФАЙЛОВ ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/pdf',
            'text/csv',
            'application/vnd.oasis.opendocument.spreadsheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый тип файла'));
        }
    }
});

// ========== КОНФИГУРАЦИЯ ПОЧТЫ ==========
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.yandex.ru',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
    }
};

const isEmailConfigured = () => {
    return emailConfig.auth.user && emailConfig.auth.pass;
};

// ========== ФУНКЦИИ ПАРСИНГА ==========
const parseExcelFile = (filePath) => {
    try {
        const workbook = XLSX.readFile(filePath);
        return { success: true, data: { sheets: workbook.SheetNames.length } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

const parsePdfFile = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await PDFParser(dataBuffer);
        return { success: true, data: { pages: pdfData.numpages } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ========== API МАРШРУТЫ ==========

// ГЛАВНАЯ СТРАНИЦА
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        system: "ВЕРТУМ CRM",
        version: "2.2",
        manager: "Хисматуллин Р.Ш.",
        emailConfigured: isEmailConfigured(),
        fileParsing: "Готово"
    });
});

// Загрузка файлов
app.post("/api/parse-file", upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "Файл не загружен" });
        }

        let result;
        if (req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet')) {
            result = parseExcelFile(req.file.path);
        } else if (req.file.mimetype.includes('pdf')) {
            result = await parsePdfFile(req.file.path);
        } else {
            return res.status(400).json({ success: false, error: "Неподдерживаемый формат" });
        }

        res.json({
            success: true,
            filename: req.file.originalname,
            result: result
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Отправка отчета
app.post("/api/send-report", async (req, res) => {
    try {
        const { to, subject, reportText } = req.body;
        
        if (!isEmailConfigured()) {
            return res.json({ success: true, message: "Email не настроен", saved: true });
        }

        const transporter = nodemailer.createTransport(emailConfig);
        const mailOptions = {
            from: `"CRM" <${emailConfig.auth.user}>`,
            to: to,
            subject: subject,
            text: reportText
        };

        const info = await transporter.sendMail(mailOptions);
        res.json({ success: true, messageId: info.messageId });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ========== SEGMENTS API INTEGRATION ==========
const segmentsRouter = require('./api/segments');
app.use('/api/segments', segmentsRouter);
// ========== СТАРТ СЕРВЕРА ==========
app.listen(PORT, () => {
    console.log("========================================");
    console.log("🚀 ВЕРТУМ CRM ЗАПУЩЕН");
    console.log(`📍 Порт: ${PORT}`);
    console.log(`📍 Ссылка: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/health`);
    console.log(`📍 Email: ${isEmailConfigured() ? '✅' : '❌'}`);
    console.log("========================================");

    // Создаем папки
    ["uploads", "uploads/reports", "uploads/parsed"].forEach(folder => {
        const fullPath = path.join(__dirname, folder);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
});
