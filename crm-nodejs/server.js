// ================================================
// CRM СЕРВЕР ДЛЯ RENDER.COM
// ================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/scenarios', express.static(path.join(__dirname, 'scenarios')));

// ==================== РОУТЫ CRM ====================

// 1. Главная страница CRM
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Страница торговых представителей
app.get('/tp', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRM - Торговые представители</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
            .btn:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <h1>?? CRM - Торговые представители</h1>
        <p>Версия: 2.0 | Развернуто на Render.com</p>
        
        <div class="dashboard">
            <div class="card">
                <h2>?? Хитров Кирилл</h2>
                <p>Управление клиентами и отчетами</p>
                <a href="/tp/hitrov" class="btn">?? Клиенты</a>
                <a href="/uploads/hitrov_report.html" class="btn">?? Отчет</a>
                <a href="/api/tp/hitrov/json" class="btn">?? JSON данные</a>
            </div>
            
            <div class="card">
                <h2>?? Хисматуллин Рустам</h2>
                <p>Управление клиентами и отчетами</p>
                <a href="/tp/hismatullin" class="btn">?? Клиенты</a>
                <a href="/uploads/hismatullin_report.html" class="btn">?? Отчет</a>
                <a href="/api/tp/hismatullin/json" class="btn">?? JSON данные</a>
            </div>
            
            <div class="card">
                <h2>?? Аналитика</h2>
                <p>Сводные отчеты и статистика</p>
                <a href="/uploads/tp_summary.html" class="btn">?? Сводный отчет</a>
                <a href="/api/tp/analyze" class="btn">?? Анализ</a>
                <a href="/api/tp/update" class="btn">?? Обновить данные</a>
            </div>
            
            <div class="card">
                <h2>?? Администрирование</h2>
                <p>Управление системой</p>
                <a href="/admin" class="btn">?? Панель управления</a>
                <a href="/api/tp/export/excel" class="btn">?? Экспорт в Excel</a>
                <a href="/api/tp/email/report" class="btn">?? Отправить отчет</a>
            </div>
        </div>
        
        <h2>?? Быстрые действия</h2>
        <div>
            <button onclick="analyzeData()" class="btn">?? Проанализировать данные</button>
            <button onclick="createReports()" class="btn">?? Создать отчеты</button>
            <button onclick="updateFromExcel()" class="btn">?? Обновить из Excel</button>
        </div>
        
        <script>
            async function analyzeData() {
                const response = await fetch('/api/tp/analyze');
                const data = await response.json();
                alert('Анализ завершен: ' + data.message);
            }
            
            async function createReports() {
                const response = await fetch('/api/tp/reports/create');
                const data = await response.json();
                alert('Отчеты созданы: ' + data.message);
            }
            
            async function updateFromExcel() {
                const response = await fetch('/api/tp/update');
                const data = await response.json();
                alert('Данные обновлены: ' + data.message);
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// 3. API для торговых представителей
app.get('/api/tp/analyze', async (req, res) => {
    try {
        const dataDir = path.join(__dirname, 'database');
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));
        
        if (files.length === 0) {
            return res.json({ success: false, message: 'Excel файлы не найдены' });
        }
        
        // Анализ данных
        const analysis = await analyzeTPData();
        
        res.json({
            success: true,
            message: `Проанализировано ${files.length} файлов`,
            data: analysis
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. API для получения данных Хитрова
app.get('/api/tp/hitrov/json', (req, res) => {
    try {
        const scenarioPath = path.join(__dirname, 'scenarios', 'hitrov_scenario.json');
        
        if (fs.existsSync(scenarioPath)) {
            const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: 'Сценарий Хитрова не найден' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. API для получения данных Хисматуллина
app.get('/api/tp/hismatullin/json', (req, res) => {
    try {
        const scenarioPath = path.join(__dirname, 'scenarios', 'hismatullin_scenario.json');
        
        if (fs.existsSync(scenarioPath)) {
            const data = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: 'Сценарий Хисматуллина не найден' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. API для создания отчетов
app.get('/api/tp/reports/create', async (req, res) => {
    try {
        // Запускаем создание отчетов
        const { exec } = require('child_process');
        const scriptPath = path.join(__dirname, 'ai-agent', 'integrate-to-crm.js');
        
        exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
            if (error) {
                return res.json({ success: false, error: error.message });
            }
            
            res.json({
                success: true,
                message: 'Отчеты успешно созданы',
                output: stdout
            });
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. API для отправки email отчетов
app.get('/api/tp/email/report', async (req, res) => {
    try {
        const email = req.query.email || process.env.EMAIL_USER;
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return res.json({ 
                success: false, 
                message: 'Email не настроен. Добавьте переменные в Render Dashboard' 
            });
        }
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.yandex.ru',
            port: parseInt(process.env.EMAIL_PORT) || 465,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: '?? Отчет по торговым представителям CRM',
            text: 'Отчет по торговым представителям прикреплен к письму.',
            html: `
                <h1>?? Отчет CRM</h1>
                <p>Отчет по торговым представителям создан: ${new Date().toLocaleString()}</p>
                <p>Ссылки на отчеты:</p>
                <ul>
                    <li><a href="https://${req.headers.host}/uploads/tp_summary.html">Сводный отчет</a></li>
                    <li><a href="https://${req.headers.host}/uploads/hitrov_report.html">Отчет Хитрова</a></li>
                    <li><a href="https://${req.headers.host}/uploads/hismatullin_report.html">Отчет Хисматуллина</a></li>
                </ul>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            message: `Отчет отправлен на ${email}`
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

async function analyzeTPData() {
    const dataDir = path.join(__dirname, 'database');
    const files = fs.readdirSync(dataDir).filter(f => f.includes('tp_tables_') && f.endsWith('.xlsx'));
    
    if (files.length === 0) {
        return { message: 'Таблицы не найдены' };
    }
    
    const latestFile = files.sort().reverse()[0];
    const filePath = path.join(dataDir, latestFile);
    const workbook = XLSX.readFile(filePath);
    
    const analysis = {
        file: latestFile,
        sheets: workbook.SheetNames,
        stats: {}
    };
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        analysis.stats[sheetName] = {
            clients: data.length,
            columns: Object.keys(data[0] || {}).length
        };
    });
    
    return analysis;
}

// ==================== ЗАПУСК СЕРВЕРА ====================

app.listen(PORT, () => {
    console.log(`
    ?? CRM СИСТЕМА ЗАПУЩЕНА НА RENDER!
    ====================================
    ?? Порт: ${PORT}
    ?? Ссылка: https://vertum-crm.onrender.com
    ?? Путь: ${__dirname}
    ? Время: ${new Date().toLocaleString()}
    ====================================
    
    Доступные роуты:
    • /           - Главная страница CRM
    • /tp         - Панель торговых представителей
    • /api/tp/*   - API для работы с данными ТП
    • /uploads/*  - HTML отчеты
    • /scenarios/* - JSON сценарии
    `);
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('? Ошибка сервера:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Обратитесь к администратору'
    });
});

module.exports = app;
