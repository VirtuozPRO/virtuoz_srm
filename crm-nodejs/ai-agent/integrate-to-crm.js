// ================================================
// ИНТЕГРАЦИЯ ТАБЛИЦ ТП В CRM ПО СЦЕНАРИЯМ
// ================================================

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('🚀 ИНТЕГРАЦИЯ ТП ДАННЫХ В CRM');
console.log('='.repeat(60));

class CRMIntegration {
    constructor() {
        this.dataDir = path.join(__dirname, '../database');
        this.scenariosDir = path.join(__dirname, '../scenarios');
        this.uploadDir = path.join(__dirname, '../uploads');
        
        // Создаем директории если нет
        [this.scenariosDir, this.uploadDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // 1. Найти последние таблицы ТП
    findLatestTPTables() {
        const files = fs.readdirSync(this.dataDir)
            .filter(f => f.includes('tp_tables_') && f.endsWith('.xlsx'))
            .sort()
            .reverse();
        
        if (files.length === 0) {
            console.log('❌ Таблицы ТП не найдены');
            return null;
        }
        
        console.log(`✅ Найдена таблица: ${files[0]}`);
        return path.join(this.dataDir, files[0]);
    }

    // 2. Загрузить данные для Хитрова
    createHitrovScenario(tpData) {
        const scenario = {
            name: "Сценарий Хитрова Кирилла",
            manager: "Хитров Кирилл",
            created: new Date().toISOString(),
            totalClients: tpData.length,
            clients: [],
            statistics: {
                byRegion: {},
                byProduct: {},
                byStatus: {}
            }
        };

        tpData.forEach(client => {
            scenario.clients.push({
                id: client['Код'] || 'Нет',
                name: client['Наименование'] || 'Не указан',
                region: client['Бизнес-регион'] || 'Не указан',
                product: client['Основная товарная группа'] || 'Не указана',
                address: client['Адрес'] || 'Не указан',
                registrationDate: client['Дата регистрации'] || 'Не указана',
                status: client['Обслуживается торговыми представителями'] || 'Нет',
                segment: client['Сегментация КБ'] || 'Не указан'
            });

            // Статистика по регионам
            const region = client['Бизнес-регион'] || 'Не указан';
            scenario.statistics.byRegion[region] = (scenario.statistics.byRegion[region] || 0) + 1;

            // Статистика по продуктам
            const product = client['Основная товарная группа'] || 'Не указана';
            scenario.statistics.byProduct[product] = (scenario.statistics.byProduct[product] || 0) + 1;

            // Статистика по статусу
            const status = client['Обслуживается торговыми представителями'] || 'Нет';
            scenario.statistics.byStatus[status] = (scenario.statistics.byStatus[status] || 0) + 1;
        });

        // Сохраняем сценарий
        const scenarioFile = path.join(this.scenariosDir, 'hitrov_scenario.json');
        fs.writeFileSync(scenarioFile, JSON.stringify(scenario, null, 2), 'utf8');
        
        console.log(`✅ Сценарий Хитрова создан: ${scenario.clients.length} клиентов`);
        return scenario;
    }

    // 3. Загрузить данные для Хисматуллина
    createHismatullinScenario(tpData) {
        const scenario = {
            name: "Сценарий Хисматуллина Рустама",
            manager: "Хисматуллин Рустам",
            created: new Date().toISOString(),
            totalClients: tpData.length,
            clients: [],
            statistics: {
                byRegion: {},
                byProduct: {},
                byStatus: {}
            }
        };

        tpData.forEach(client => {
            scenario.clients.push({
                id: client['Код'] || 'Нет',
                name: client['Наименование'] || 'Не указан',
                region: client['Бизнес-регион'] || 'Не указан',
                product: client['Основная товарная группа'] || 'Не указана',
                address: client['Адрес'] || 'Не указан',
                registrationDate: client['Дата регистрации'] || 'Не указана',
                status: client['Обслуживается торговыми представителями'] || 'Нет',
                segment: client['Сегментация КБ'] || 'Не указан'
            });

            // Статистика по регионам
            const region = client['Бизнес-регион'] || 'Не указан';
            scenario.statistics.byRegion[region] = (scenario.statistics.byRegion[region] || 0) + 1;

            // Статистика по продуктам
            const product = client['Основная товарная группа'] || 'Не указана';
            scenario.statistics.byProduct[product] = (scenario.statistics.byProduct[product] || 0) + 1;

            // Статистика по статусу
            const status = client['Обслуживается торговыми представителями'] || 'Нет';
            scenario.statistics.byStatus[status] = (scenario.statistics.byStatus[status] || 0) + 1;
        });

        // Сохраняем сценарий
        const scenarioFile = path.join(this.scenariosDir, 'hismatullin_scenario.json');
        fs.writeFileSync(scenarioFile, JSON.stringify(scenario, null, 2), 'utf8');
        
        console.log(`✅ Сценарий Хисматуллина создан: ${scenario.clients.length} клиентов`);
        return scenario;
    }

    // 4. Создать HTML отчеты для CRM
    createHTMLReports(hitrovData, hismatullinData) {
        console.log('\n🌐 СОЗДАНИЕ HTML ОТЧЕТОВ ДЛЯ CRM');
        
        // HTML для Хитрова
        const hitrovHTML = this.generateHTMLReport(hitrovData, 'Хитров Кирилл');
        const hitrovPath = path.join(this.uploadDir, 'hitrov_report.html');
        fs.writeFileSync(hitrovPath, hitrovHTML, 'utf8');
        console.log(`✅ HTML отчет Хитрова: ${hitrovPath}`);
        
        // HTML для Хисматуллина
        const hismatullinHTML = this.generateHTMLReport(hismatullinData, 'Хисматуллин Рустам');
        const hismatullinPath = path.join(this.uploadDir, 'hismatullin_report.html');
        fs.writeFileSync(hismatullinPath, hismatullinHTML, 'utf8');
        console.log(`✅ HTML отчет Хисматуллина: ${hismatullinPath}`);
        
        // Сводный HTML
        const summaryHTML = this.generateSummaryHTML(hitrovData, hismatullinData);
        const summaryPath = path.join(this.uploadDir, 'tp_summary.html');
        fs.writeFileSync(summaryPath, summaryHTML, 'utf8');
        console.log(`✅ Сводный отчет: ${summaryPath}`);
    }

    // 5. Генерация HTML отчета
    generateHTMLReport(data, managerName) {
        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM - ${managerName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
        .clients-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .clients-table th, .clients-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .clients-table th { background: #f2f2f2; }
        .status-active { color: green; font-weight: bold; }
        .status-inactive { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 CRM: ${managerName}</h1>
        <p>Обновлено: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>👥 Всего клиентов</h3>
            <p style="font-size: 24px; font-weight: bold;">${data.length}</p>
        </div>
        <div class="stat-card">
            <h3>🏙️ Основной регион</h3>
            <p>${this.getTopRegion(data.statistics.byRegion)}</p>
        </div>
        <div class="stat-card">
            <h3>📦 Популярный товар</h3>
            <p>${this.getTopProduct(data.statistics.byProduct)}</p>
        </div>
    </div>
    
    <h2>📋 Список клиентов</h2>
    <table class="clients-table">
        <thead>
            <tr>
                <th>Код</th>
                <th>Клиент</th>
                <th>Регион</th>
                <th>Товар</th>
                <th>Статус</th>
            </tr>
        </thead>
        <tbody>
            ${data.clients.slice(0, 20).map(client => `
            <tr>
                <td>${client.id}</td>
                <td>${client.name}</td>
                <td>${client.region}</td>
                <td>${client.product}</td>
                <td class="${client.status === 'Да' ? 'status-active' : 'status-inactive'}">
                    ${client.status === 'Да' ? '✅ Активен' : '❌ Не активен'}
                </td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    ${data.clients.length > 20 ? `<p>... и еще ${data.clients.length - 20} клиентов</p>` : ''}
    
    <script>
        // JavaScript для CRM
        console.log('CRM отчет загружен для ${managerName}');
        
        // Можно добавить фильтрацию, поиск и т.д.
        function filterClients() {
            const search = document.getElementById('search').value.toLowerCase();
            const rows = document.querySelectorAll('.clients-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(search) ? '' : 'none';
            });
        }
    </script>
</body>
</html>`;
    }

    // 6. Сводный HTML отчет
    generateSummaryHTML(hitrovData, hismatullinData) {
        const totalClients = hitrovData.totalClients + hismatullinData.totalClients;
        const hitrovPercent = ((hitrovData.totalClients / totalClients) * 100).toFixed(1);
        const hismatullinPercent = ((hismatullinData.totalClients / totalClients) * 100).toFixed(1);
        
        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM - Сводный отчет по ТП</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .dashboard { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .manager-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .progress-bar { height: 20px; background: #eee; border-radius: 10px; margin: 10px 0; overflow: hidden; }
        .progress { height: 100%; background: #3498db; }
        .comparison { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: center; }
    </style>
</head>
<body>
    <h1>📊 Сводный отчет по торговым представителям</h1>
    <p>Обновлено: ${new Date().toLocaleString()}</p>
    
    <div class="dashboard">
        <div class="manager-card">
            <h2>🎯 Хитров Кирилл</h2>
            <p><strong>Клиентов:</strong> ${hitrovData.totalClients}</p>
            <p><strong>Доля:</strong> ${hitrovPercent}%</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${hitrovPercent}%"></div>
            </div>
            <p><strong>Топ регион:</strong> ${this.getTopRegion(hitrovData.statistics.byRegion)}</p>
            <p><strong>Топ товар:</strong> ${this.getTopProduct(hitrovData.statistics.byProduct)}</p>
        </div>
        
        <div class="manager-card">
            <h2>🎯 Хисматуллин Рустам</h2>
            <p><strong>Клиентов:</strong> ${hismatullinData.totalClients}</p>
            <p><strong>Доля:</strong> ${hismatullinPercent}%</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${hismatullinPercent}%"></div>
            </div>
            <p><strong>Топ регион:</strong> ${this.getTopRegion(hismatullinData.statistics.byRegion)}</p>
            <p><strong>Топ товар:</strong> ${this.getTopProduct(hismatullinData.statistics.byProduct)}</p>
        </div>
    </div>
    
    <div class="comparison">
        <h2>📈 Сравнение эффективности</h2>
        <table>
            <thead>
                <tr>
                    <th>Показатель</th>
                    <th>Хитров Кирилл</th>
                    <th>Хисматуллин Рустам</th>
                    <th>Разница</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Количество клиентов</td>
                    <td>${hitrovData.totalClients}</td>
                    <td>${hismatullinData.totalClients}</td>
                    <td>${Math.abs(hitrovData.totalClients - hismatullinData.totalClients)}</td>
                </tr>
                <tr>
                    <td>Активных клиентов</td>
                    <td>${hitrovData.statistics.byStatus['Да'] || 0}</td>
                    <td>${hismatullinData.statistics.byStatus['Да'] || 0}</td>
                    <td>${Math.abs((hitrovData.statistics.byStatus['Да'] || 0) - (hismatullinData.statistics.byStatus['Да'] || 0))}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <script>
        // Авто-обновление каждые 5 минут
        setTimeout(() => {
            location.reload();
        }, 5 * 60 * 1000);
        
        // Экспорт в Excel
        function exportToExcel() {
            alert('Экспорт в Excel... (реализовать через сервер)');
        }
    </script>
</body>
</html>`;
    }

    // 7. Вспомогательные методы
    getTopRegion(regionStats) {
        const entries = Object.entries(regionStats);
        if (entries.length === 0) return 'Нет данных';
        
        const top = entries.sort((a, b) => b[1] - a[1])[0];
        return `${top[0]} (${top[1]} клиентов)`;
    }

    getTopProduct(productStats) {
        const entries = Object.entries(productStats);
        if (entries.length === 0) return 'Нет данных';
        
        const top = entries.sort((a, b) => b[1] - a[1])[0];
        return `${top[0]} (${top[1]} клиентов)`;
    }

    // 8. Главный метод
    async integrate() {
        console.log('🔍 Загрузка данных в CRM...\n');
        
        const tableFile = this.findLatestTPTables();
        if (!tableFile) return;
        
        try {
            const workbook = XLSX.readFile(tableFile);
            
            // Читаем данные Хитрова
            let hitrovData = [];
            if (workbook.SheetNames.includes('Хитров Кирилл')) {
                const worksheet = workbook.Sheets['Хитров Кирилл'];
                hitrovData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                console.log(`📊 Данных Хитрова: ${hitrovData.length} строк`);
            }
            
            // Читаем данные Хисматуллина
            let hismatullinData = [];
            if (workbook.SheetNames.includes('Хисматуллин Рустам')) {
                const worksheet = workbook.Sheets['Хисматуллин Рустам'];
                hismatullinData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                console.log(`📊 Данных Хисматуллина: ${hismatullinData.length} строк`);
            }
            
            // Создаем сценарии
            console.log('\n🎭 СОЗДАНИЕ СЦЕНАРИЕВ:');
            const hitrovScenario = this.createHitrovScenario(hitrovData);
            const hismatullinScenario = this.createHismatullinScenario(hismatullinData);
            
            // Создаем HTML отчеты
            this.createHTMLReports(hitrovScenario, hismatullinScenario);
            
            // Интеграция с CRM API (пример)
            this.integrateWithCRMAPI(hitrovScenario, hismatullinScenario);
            
            console.log('\n✅ ИНТЕГРАЦИЯ ЗАВЕРШЕНА!');
            console.log('📁 Файлы сохранены в:');
            console.log(`   • Сценарии: ${this.scenariosDir}`);
            console.log(`   • Отчеты: ${this.uploadDir}`);
            
        } catch (error) {
            console.error('❌ Ошибка интеграции:', error.message);
        }
    }

    // 9. Интеграция с CRM API (пример)
    integrateWithCRMAPI(hitrovScenario, hismatullinScenario) {
        console.log('\n🔗 ИНТЕГРАЦИЯ С CRM API:');
        
        // Пример отправки данных в CRM
        const crmData = {
            timestamp: new Date().toISOString(),
            managers: [
                {
                    name: hitrovScenario.manager,
                    clients: hitrovScenario.clients.length,
                    activeClients: hitrovScenario.statistics.byStatus['Да'] || 0
                },
                {
                    name: hismatullinScenario.manager,
                    clients: hismatullinScenario.clients.length,
                    activeClients: hismatullinScenario.statistics.byStatus['Да'] || 0
                }
            ],
            summary: {
                totalClients: hitrovScenario.clients.length + hismatullinScenario.clients.length,
                activePercentage: (((hitrovScenario.statistics.byStatus['Да'] || 0) + 
                                  (hismatullinScenario.statistics.byStatus['Да'] || 0)) / 
                                 (hitrovScenario.clients.length + hismatullinScenario.clients.length) * 100).toFixed(1)
            }
        };
        
        // Сохраняем данные для API
        const apiDataPath = path.join(this.scenariosDir, 'crm_api_data.json');
        fs.writeFileSync(apiDataPath, JSON.stringify(crmData, null, 2), 'utf8');
        
        console.log(`✅ Данные для CRM API сохранены: ${apiDataPath}`);
        console.log(`💡 Для отправки в CRM используйте POST запрос на ваш API`);
    }
}

// Запуск
const integration = new CRMIntegration();
integration.integrate().catch(console.error);