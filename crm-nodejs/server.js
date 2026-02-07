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
app.use(express.static(path.join(__dirname, "public")));
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

// ========== ОТПРАВКА ОТЧЕТА (ПРАВИЛЬНЫЙ КОД) ==========
app.post("/api/send-report", async (req, res) => {
    console.log("📧 API send-report вызван");
    
    try {
        const { managerEmail, subject, reportText } = req.body;

        if (!isEmailConfigured()) {
            console.log("❌ Почта не настроена");
            return res.json({ 
                success: false, 
                message: "Email не настроен в системе" 
            });
        }

        console.log("✅ Почта настроена");
        console.log("📨 Менеджер email:", managerEmail || 'не указан');
        console.log("📝 Тема:", subject || 'не указана');
        
        const transporter = nodemailer.createTransport(emailConfig);
        
        // ОПРЕДЕЛЯЕМ АДРЕСА ДЛЯ ОТПРАВКИ
        let toAddresses;
        
        if (managerEmail === 'hky@vertum.su') {
            // Хитров Кирилл Юрьевич
            toAddresses = 'hky@vertum.su, ddn@vertum.su';
            console.log("👤 Отправка для Хитрова");
        } else {
            // По умолчанию: Хисматуллин Рустам Шафкатович
            toAddresses = 'hrs@vertum.su, ddn@vertum.su';
            console.log("👤 Отправка для Хисматуллина");
        }
        
        const mailOptions = {
            from: `"VERTUM CRM" <${emailConfig.auth.user}>`,
            to: toAddresses,
            subject: subject || "Отчет CRM",
            text: reportText || "Отчет сгенерирован автоматически",
            html: `<div style="font-family: Arial, sans-serif;">
                     <h2>${subject || "Отчет CRM"}</h2>
                     <pre style="white-space: pre-wrap;">${reportText || "Отчет CRM"}</pre>
                     <hr>
                     <p><small>Отправлено из VERTUM CRM</small></p>
                   </div>`
        };

        console.log("📤 Отправка письма на адреса:", toAddresses);

        const info = await transporter.sendMail(mailOptions);
        
        console.log("✅ Письмо отправлено успешно!");
        console.log("📫 ID сообщения:", info.messageId);
        console.log("🔍 Ответ сервера:", info.response);
        
        res.json({ 
            success: true, 
            messageId: info.messageId,
            message: `Отчет отправлен на адреса: ${toAddresses}`,
            recipients: toAddresses.split(', ')
        });

    } catch (error) {
        console.error("❌ Ошибка отправки:", error);
        console.error("🔧 Детали ошибки:", {
            code: error.code,
            command: error.command,
            message: error.message
        });
        
        res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code,
            details: "Ошибка отправки email"
        });
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
    console.log(`📍 Email: ${isEmailConfigured() ? '✅ Настроен' : '❌ Не настроен'}`);
    if (isEmailConfigured()) {
        console.log(`📍 Почтовый сервер: ${emailConfig.host}:${emailConfig.port}`);
        console.log(`📍 Отправка с: ${emailConfig.auth.user}`);
    }
    console.log("========================================");

    // Создаем папки
    ["uploads", "uploads/reports", "uploads/parsed"].forEach(folder => {
        const fullPath = path.join(__dirname, folder);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
});