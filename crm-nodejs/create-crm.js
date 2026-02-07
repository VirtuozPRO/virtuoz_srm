const fs = require('fs');
const path = require('path');

console.log('🚀 СОЗДАНИЕ ПОЛНОГО CRM...');

// ПОЛНЫЙ КОД CRM
const fullCRMCode = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ВЕРТУМ CRM - Торговая система управления клиентами</title>
    
    <!-- ВСЕ зависимости из CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
    
    <style>
    /* ========== ВСЕ СТИЛИ ВНУТРИ HTML ========== */
    :root {
        --primary-color: #667eea;
        --secondary-color: #764ba2;
        --success-color: #4CAF50;
        --warning-color: #FF9800;
        --danger-color: #f44336;
        --info-color: #2196F3;
        --light-bg: #f8f9fa;
        --dark-text: #2d3748;
        --border-radius: 8px;
        --box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        --transition: all 0.3s ease;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
    }
    
    body {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: var(--dark-text);
        line-height: 1.6;
    }
    
    /* ШАПКА */
    .crm-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
        padding: 12px 0;
    }
    
    .header-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        font-weight: bold;
        color: var(--secondary-color);
    }
    
    .logo i {
        font-size: 24px;
        color: var(--primary-color);
    }
    
    /* МЕНЮ */
    .crm-main {
        max-width: 1400px;
        margin: 20px auto;
        padding: 0 20px;
        min-height: calc(100vh - 200px);
    }
    
    .menu-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 25px 0;
    }
    
    .menu-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        cursor: pointer;
        border: 2px solid var(--primary-color);
        transition: var(--transition);
        box-shadow: var(--box-shadow);
    }
    
    .menu-card:hover {
        transform: translateY(-5px);
        border-color: var(--secondary-color);
    }
    
    .menu-icon {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    
    .menu-icon i {
        font-size: 32px;
        color: var(--primary-color);
    }
    
    .menu-badge {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
    }
    
    .menu-title {
        font-size: 20px;
        font-weight: bold;
        color: var(--dark-text);
        margin-bottom: 8px;
    }
    
    .menu-subtitle {
        font-size: 13px;
        color: #666;
        margin-bottom: 20px;
    }
    
    /* ФУТЕР */
    .crm-footer {
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        color: white;
        padding: 30px 20px 20px;
        margin-top: 40px;
        border-top: 3px solid var(--primary-color);
    }
    
    /* УВЕДОМЛЕНИЯ */
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    }
    
    .notification {
        background: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        margin-bottom: 10px;
        border-left: 5px solid var(--success-color);
    }
    
    /* МОДАЛЬНЫЕ ОКНА */
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .modal {
        background: white;
        border-radius: 12px;
        padding: 30px;
        min-width: 500px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        border: 2px solid var(--primary-color);
    }
    
    /* АДАПТИВНОСТЬ */
    @media (max-width: 768px) {
        .menu-grid { grid-template-columns: 1fr; }
        .modal { min-width: 95vw; padding: 20px; }
    }
    </style>
</head>
<body>
    <!-- ШАПКА -->
    <header class="crm-header">
        <div class="header-container">
            <div class="logo">
                <i class="fas fa-chart-line"></i>
                <span>ВЕРТУМ CRM</span>
            </div>
            <div class="header-actions">
                <button class="btn-visit-header" onclick="startVisit()">
                    <i class="fas fa-play-circle"></i> НАЧАТЬ ВИЗИТ
                </button>
            </div>
        </div>
    </header>

    <!-- УВЕДОМЛЕНИЯ -->
    <div class="notification-container" id="notificationContainer"></div>

    <!-- ОСНОВНОЙ КОНТЕЙНЕР -->
    <main class="crm-main">
        <!-- ГЛАВНОЕ МЕНЮ -->
        <div class="menu-grid" id="mainMenu">
            <div class="menu-card active" onclick="showSection('clients')">
                <div class="menu-icon">
                    <i class="fas fa-users"></i>
                    <span class="menu-badge" id="clientsCount">0</span>
                </div>
                <div class="menu-title">ВСЕ КЛИЕНТЫ</div>
                <div class="menu-subtitle">Таблица с фильтрами и поиском</div>
            </div>

            <div class="menu-card" onclick="showSection('excelData')">
                <div class="menu-icon">
                    <i class="fas fa-file-excel"></i>
                    <span class="menu-badge">Excel</span>
                </div>
                <div class="menu-title">ДАННЫЕ EXCEL</div>
                <div class="menu-subtitle">Импорт/экспорт данных</div>
            </div>

            <div class="menu-card" onclick="showSection('fileUpload')">
                <div class="menu-icon">
                    <i class="fas fa-file-upload"></i>
                    <span class="menu-badge">PDF/Excel</span>
                </div>
                <div class="menu-title">ПАРСИНГ ФАЙЛОВ</div>
                <div class="menu-subtitle">Обработка Excel и PDF</div>
            </div>
        </div>

        <!-- РАЗДЕЛ КЛИЕНТОВ -->
        <div id="clientsSection" class="section-container" style="display: none;">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-users"></i>
                    ВСЕ КЛИЕНТЫ
                </div>
            </div>
            <div style="padding: 20px;">
                <h3>Раздел клиентов</h3>
                <p>Здесь будет таблица клиентов</p>
                <button onclick="showSection('main')">Назад</button>
            </div>
        </div>

        <!-- РАЗДЕЛ EXCEL -->
        <div id="excelDataSection" class="section-container" style="display: none;">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-file-excel"></i>
                    ДАННЫЕ EXCEL
                </div>
            </div>
            <div style="padding: 20px;">
                <h3>Работа с Excel</h3>
                <input type="file" id="excelFile" accept=".xlsx,.xls,.csv">
                <button onclick="parseExcel()">Загрузить Excel</button>
                <button onclick="showSection('main')">Назад</button>
            </div>
        </div>

        <!-- РАЗДЕЛ ЗАГРУЗКИ ФАЙЛОВ -->
        <div id="fileUploadSection" class="section-container" style="display: none;">
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-file-upload"></i>
                    ПАРСИНГ ФАЙЛОВ
                </div>
            </div>
            <div style="padding: 20px;">
                <h3>Загрузка и парсинг файлов</h3>
                <div style="border: 2px dashed var(--primary-color); padding: 40px; text-align: center; border-radius: var(--border-radius); margin: 20px 0;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: var(--primary-color);"></i>
                    <p>Перетащите файлы Excel или PDF сюда</p>
                    <input type="file" id="fileInput" multiple accept=".xlsx,.xls,.csv,.pdf">
                </div>
                <button onclick="uploadFiles()">Обработать файлы</button>
                <button onclick="showSection('main')">Назад</button>
            </div>
        </div>
    </main>

    <!-- ФУТЕР -->
    <footer class="crm-footer">
        <div style="max-width: 1400px; margin: 0 auto; text-align: center;">
            <p>© 2024 ВЕРТУМ CRM • Версия 2.2</p>
        </div>
    </footer>

    <!-- МОДАЛЬНЫЕ ОКНА -->
    <div class="modal-overlay" id="visitModal">
        <div class="modal">
            <h2>Начать визит</h2>
            <p>Выберите клиента для визита</p>
            <button onclick="closeModal()">Закрыть</button>
        </div>
    </div>

    <!-- ВЕСЬ JAVASCRIPT КОД -->
    <script>
    console.log('🚀 ВЕРТУМ CRM загружен');
    
    // ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
    let allClientsData = [];
    let selectedFiles = [];
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // ОСНОВНЫЕ ФУНКЦИИ
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = \`
            <i class="fas fa-info-circle"></i>
            <span>\${message}</span>
        \`;
        container.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
    
    function showSection(sectionId) {
        console.log('Показать секцию:', sectionId);
        
        // Скрыть все секции
        document.querySelectorAll('.section-container').forEach(el => {
            el.style.display = 'none';
        });
        
        // Скрыть главное меню
        document.getElementById('mainMenu').style.display = 'none';
        
        // Показать выбранную секцию
        const section = document.getElementById(sectionId + 'Section');
        if (section) {
            section.style.display = 'block';
            showNotification(\`Открыт раздел: \${sectionId}\`);
        }
    }
    
    function closeModal() {
        document.getElementById('visitModal').style.display = 'none';
    }
    
    function startVisit() {
        document.getElementById('visitModal').style.display = 'flex';
    }
    
    // РАБОТА С ФАЙЛАМИ
    document.getElementById('fileInput')?.addEventListener('change', function(e) {
        selectedFiles = Array.from(e.target.files);
        showNotification(\`Выбрано файлов: \${selectedFiles.length}\`);
    });
    
    async function uploadFiles() {
        if (selectedFiles.length === 0) {
            showNotification('Выберите файлы', 'warning');
            return;
        }
        
        showNotification('Загрузка файлов...');
        
        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch(\`\${API_BASE_URL}/parse-file\`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    showNotification(\`Файл "\${file.name}" обработан\`, 'success');
                } else {
                    showNotification(\`Ошибка: \${result.error}\`, 'error');
                }
            } catch (error) {
                showNotification('Ошибка сети', 'error');
            }
        }
        
        selectedFiles = [];
        document.getElementById('fileInput').value = '';
    }
    
    async function parseExcel() {
        const fileInput = document.getElementById('excelFile');
        if (!fileInput.files[0]) {
            showNotification('Выберите Excel файл', 'warning');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        showNotification('Обработка Excel...');
        
        try {
            const response = await fetch(\`\${API_BASE_URL}/parse-file\`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                showNotification('Excel успешно обработан', 'success');
                console.log('Результат:', result);
            }
        } catch (error) {
            showNotification('Ошибка обработки', 'error');
        }
    }
    
    // ИНИЦИАЛИЗАЦИЯ
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ CRM инициализирован');
        showNotification('ВЕРТУМ CRM готов к работе', 'success');
        
        // Проверка сервера
        checkServer();
    });
    
    async function checkServer() {
        try {
            const response = await fetch(\`\${API_BASE_URL}/health\`);
            const data = await response.json();
            showNotification(\`Сервер: \${data.status}\`);
        } catch (error) {
            showNotification('Сервер недоступен', 'warning');
        }
    }
    </script>
</body>
</html>`;

// Путь для сохранения
const indexPath = path.join(__dirname, 'public', 'index.html');

// Создаем папку public если её нет
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
    console.log('📁 Создана папка public');
}

// Записываем файл
fs.writeFileSync(indexPath, fullCRMCode, 'utf8');

console.log('✅ index.html создан успешно!');
console.log('📂 Путь:', indexPath);
console.log('📏 Размер:', (fullCRMCode.length / 1024).toFixed(2), 'KB');
console.log('\n🚀 ЗАПУСТИТЕ СЕРВЕР:');
console.log('1. node server.js');
console.log('2. Откройте http://localhost:3000');