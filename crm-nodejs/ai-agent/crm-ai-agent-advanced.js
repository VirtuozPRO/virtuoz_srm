const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const math = require('mathjs');
const { format, differenceInDays, addDays } = require('date-fns');
const fs = require('fs').promises;
const path = require('path');

// Продвинутый ИИ-агент для CRM с математикой и Excel
class CRM_AI_Agent_Advanced {
    constructor() {
        this.name = "CRM AI Assistant Pro";
        this.version = "3.0";
        this.knowledge = {};
        this.excelData = {};
        this.statistics = {};
        this.formulas = {
            // Финансовые формулы
            revenue: (price, quantity) => price * quantity,
            profit: (revenue, cost) => revenue - cost,
            margin: (revenue, cost) => ((revenue - cost) / revenue) * 100,
            growth: (current, previous) => ((current - previous) / previous) * 100,
            
            // Статистические формулы
            average: (arr) => math.mean(arr),
            median: (arr) => math.median(arr),
            stdDev: (arr) => math.std(arr),
            sum: (arr) => math.sum(arr),
            
            // Бизнес-метрики
            customerLTV: (avgPurchase, frequency, lifespan) => avgPurchase * frequency * lifespan,
            churnRate: (lostCustomers, totalCustomers) => (lostCustomers / totalCustomers) * 100,
            conversionRate: (conversions, visitors) => (conversions / visitors) * 100
        };
    }

    async init() {
        console.log('\n🧮 ' + this.name + ' v' + this.version + ' запускается...');
        
        await this.loadKnowledgeBase();
        await this.parseExcelFiles();
        await this.calculateStatistics();
        
        console.log('✅ ' + this.name + ' готов к работе с расчетами!\n');
        return this;
    }

    async loadKnowledgeBase() {
        // ... предыдущий код загрузки JSON ...
        console.log('📂 Загрузка базы знаний...');
        
        try {
            const dataDir = path.join(__dirname, '../database');
            
            // Проверяем и загружаем clients.json
            const clientsPath = path.join(dataDir, 'clients.json');
            if (await this.fileExists(clientsPath)) {
                const clientsData = await fs.readFile(clientsPath, 'utf8');
                this.knowledge.clients = JSON.parse(clientsData);
                console.log('📋 Загружено ' + this.knowledge.clients.length + ' клиентов');
            } else {
                this.knowledge.clients = [];
            }
            
            // Проверяем и загружаем products.json
            const productsPath = path.join(dataDir, 'products.json');
            if (await this.fileExists(productsPath)) {
                const productsData = await fs.readFile(productsPath, 'utf8');
                this.knowledge.products = JSON.parse(productsData);
                console.log('📦 Загружено ' + this.knowledge.products.length + ' продуктов');
            } else {
                this.knowledge.products = [];
            }
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error.message);
            this.knowledge = { clients: [], products: [] };
        }
    }

    async parseExcelFiles() {
        console.log('📊 Парсинг Excel файлов для анализа...');
        
        try {
            const dataDir = path.join(__dirname, '../database');
            const files = await fs.readdir(dataDir);
            const excelFiles = files.filter(f => f.match(/\.xlsx?$/i));
            
            for (const fileName of excelFiles) {
                const filePath = path.join(dataDir, fileName);
                console.log('📄 Анализ:', fileName);
                
                try {
                    const workbook = XLSX.readFile(filePath);
                    
                    this.excelData[fileName] = {
                        name: fileName,
                        sheets: {}
                    };
                    
                    // Обрабатываем каждый лист
                    for (const sheetName of workbook.SheetNames) {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        
                        this.excelData[fileName].sheets[sheetName] = {
                            name: sheetName,
                            data: jsonData,
                            rows: jsonData.length,
                            columns: Object.keys(jsonData[0] || {}),
                            summary: this.analyzeSheet(jsonData, sheetName)
                        };
                        
                        console.log('   📈 Лист "' + sheetName + '": ' + jsonData.length + ' строк');
                    }
                    
                } catch (error) {
                    console.log('   ❌ Ошибка:', error.message);
                }
            }
            
        } catch (error) {
            console.log('⚠️ Ошибка парсинга Excel:', error.message);
        }
    }

    // Анализ листа Excel
    analyzeSheet(data, sheetName) {
        if (data.length === 0) return { empty: true };
        
        const summary = {
            totalRows: data.length,
            numericColumns: {},
            dateColumns: {},
            textColumns: [],
            calculated: {}
        };
        
        const firstRow = data[0];
        const columns = Object.keys(firstRow);
        
        // Анализируем каждую колонку
        columns.forEach(column => {
            const values = data.map(row => row[column]).filter(v => v !== undefined);
            
            // Определяем тип данных колонки
            if (this.isNumericColumn(values)) {
                const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
                
                if (numericValues.length > 0) {
                    summary.numericColumns[column] = {
                        count: numericValues.length,
                        sum: math.sum(numericValues),
                        avg: math.mean(numericValues),
                        min: math.min(numericValues),
                        max: math.max(numericValues),
                        median: math.median(numericValues),
                        stdDev: math.std(numericValues)
                    };
                    
                    // Автоматические расчеты для финансовых колонок
                    if (column.toLowerCase().includes('цена') || column.toLowerCase().includes('price')) {
                        summary.calculated.totalRevenue = math.sum(numericValues);
                    }
                    
                    if (column.toLowerCase().includes('количество') || column.toLowerCase().includes('quantity')) {
                        summary.calculated.totalQuantity = math.sum(numericValues);
                    }
                }
            }
            else if (this.isDateColumn(values)) {
                summary.dateColumns[column] = {
                    count: values.length,
                    minDate: this.minDate(values),
                    maxDate: this.maxDate(values)
                };
            }
            else {
                summary.textColumns.push(column);
            }
        });
        
        // Автоматически определяем тип данных листа
        summary.sheetType = this.determineSheetType(columns, data);
        
        return summary;
    }

    // Расчет статистики по всем данным
    async calculateStatistics() {
        console.log('📈 Расчет статистики...');
        
        this.statistics = {
            clients: {},
            products: {},
            sales: {},
            financial: {},
            trends: {}
        };
        
        // Статистика по клиентам
        if (this.knowledge.clients.length > 0) {
            const cities = {};
            const managers = {};
            const totalSpent = this.knowledge.clients.map(c => c.total_spent || 0).filter(v => !isNaN(v));
            
            this.knowledge.clients.forEach(client => {
                // Статистика по городам
                if (client.city) {
                    cities[client.city] = (cities[client.city] || 0) + 1;
                }
                
                // Статистика по менеджерам
                if (client.manager) {
                    managers[client.manager] = (managers[client.manager] || 0) + 1;
                }
            });
            
            this.statistics.clients = {
                total: this.knowledge.clients.length,
                byCity: cities,
                byManager: managers,
                avgSpent: totalSpent.length > 0 ? math.mean(totalSpent) : 0,
                totalRevenue: math.sum(totalSpent),
                topClients: this.knowledge.clients
                    .filter(c => c.total_spent)
                    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                    .slice(0, 5)
            };
        }
        
        // Статистика по продуктам
        if (this.knowledge.products.length > 0) {
            const categories = {};
            const prices = this.knowledge.products.map(p => p.price || 0).filter(v => !isNaN(v));
            
            this.knowledge.products.forEach(product => {
                if (product.category) {
                    categories[product.category] = (categories[product.category] || 0) + 1;
                }
            });
            
            this.statistics.products = {
                total: this.knowledge.products.length,
                byCategory: categories,
                avgPrice: prices.length > 0 ? math.mean(prices) : 0,
                minPrice: prices.length > 0 ? math.min(prices) : 0,
                maxPrice: prices.length > 0 ? math.max(prices) : 0
            };
        }
        
        // Анализ Excel данных для продаж
        this.analyzeSalesFromExcel();
        
        console.log('✅ Статистика рассчитана');
    }

    // Анализ продаж из Excel файлов
    analyzeSalesFromExcel() {
        for (const [fileName, fileData] of Object.entries(this.excelData)) {
            for (const [sheetName, sheet] of Object.entries(fileData.sheets)) {
                if (sheet.summary.sheetType === 'sales' || sheet.summary.sheetType === 'orders') {
                    this.processSalesData(sheet.data, fileName + ' - ' + sheetName);
                }
            }
        }
    }

    processSalesData(data, source) {
        // Ищем колонки с датами и суммами
        const dateColumns = Object.keys(data[0] || {}).filter(col => 
            col.toLowerCase().includes('дата') || col.toLowerCase().includes('date')
        );
        
        const amountColumns = Object.keys(data[0] || {}).filter(col =>
            col.toLowerCase().includes('сумма') || col.toLowerCase().includes('amount') ||
            col.toLowerCase().includes('стоимость') || col.toLowerCase().includes('price')
        );
        
        if (dateColumns.length > 0 && amountColumns.length > 0) {
            const dateCol = dateColumns[0];
            const amountCol = amountColumns[0];
            
            const salesByMonth = {};
            let totalSales = 0;
            
            data.forEach(row => {
                const date = row[dateCol];
                const amount = parseFloat(row[amountCol]) || 0;
                
                if (date && !isNaN(amount)) {
                    const month = this.getMonthFromDate(date);
                    salesByMonth[month] = (salesByMonth[month] || 0) + amount;
                    totalSales += amount;
                }
            });
            
            this.statistics.sales[source] = {
                total: totalSales,
                byMonth: salesByMonth,
                count: data.length,
                avgSale: data.length > 0 ? totalSales / data.length : 0
            };
        }
    }

    // Создание Excel отчета
    async createExcelReport(reportType = 'full') {
        console.log('📊 Создание Excel отчета...');
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CRM AI Assistant';
        workbook.created = new Date();
        
        // 1. Лист со сводной статистикой
        const summarySheet = workbook.addWorksheet('Сводка');
        
        summarySheet.columns = [
            { header: 'Показатель', key: 'metric', width: 30 },
            { header: 'Значение', key: 'value', width: 20 },
            { header: 'Примечание', key: 'note', width: 40 }
        ];
        
        summarySheet.addRow({ metric: 'Общая статистика', value: '', note: '' }).font = { bold: true };
        summarySheet.addRow({ metric: 'Всего клиентов', value: this.statistics.clients.total || 0, note: '' });
        summarySheet.addRow({ metric: 'Всего продуктов', value: this.statistics.products.total || 0, note: '' });
        summarySheet.addRow({ metric: 'Общая выручка', value: this.statistics.clients.totalRevenue || 0, note: 'руб.' });
        summarySheet.addRow({ metric: 'Средний чек клиента', value: this.statistics.clients.avgSpent || 0, note: 'руб.' });
        
        // 2. Лист с клиентами
        if (this.knowledge.clients.length > 0) {
            const clientsSheet = workbook.addWorksheet('Клиенты');
            
            const clientColumns = Object.keys(this.knowledge.clients[0]);
            clientsSheet.columns = clientColumns.map(col => ({
                header: col,
                key: col,
                width: 15
            }));
            
            this.knowledge.clients.forEach(client => {
                clientsSheet.addRow(client);
            });
            
            // Добавляем итоги
            clientsSheet.addRow({});
            const totalRow = clientColumns.reduce((obj, col) => {
                obj[col] = '';
                return obj;
            }, {});
            
            totalRow[Object.keys(this.knowledge.clients[0])[0]] = 'ИТОГО:';
            totalRow['total_spent'] = { formula: 'SUM(' + this.getColumnLetter('total_spent', clientColumns) + '2:' + this.getColumnLetter('total_spent', clientColumns) + (this.knowledge.clients.length + 1) + ')' };
            
            clientsSheet.addRow(totalRow);
        }
        
        // 3. Лист с графиками (если есть данные по продажам)
        if (Object.keys(this.statistics.sales).length > 0) {
            const salesSheet = workbook.addWorksheet('Продажи');
            
            salesSheet.columns = [
                { header: 'Месяц', key: 'month', width: 15 },
                { header: 'Сумма продаж', key: 'amount', width: 20 },
                { header: 'Количество сделок', key: 'count', width: 20 }
            ];
            
            // Собираем все продажи по месяцам
            const allSales = {};
            Object.values(this.statistics.sales).forEach(salesData => {
                Object.entries(salesData.byMonth || {}).forEach(([month, amount]) => {
                    allSales[month] = (allSales[month] || 0) + amount;
                });
            });
            
            Object.entries(allSales).forEach(([month, amount]) => {
                salesSheet.addRow({ month, amount, count: 1 });
            });
        }
        
        // 4. Лист с математическими расчетами
        const calcSheet = workbook.addWorksheet('Расчеты');
        
        calcSheet.columns = [
            { header: 'Формула', key: 'formula', width: 30 },
            { header: 'Описание', key: 'description', width: 40 },
            { header: 'Результат', key: 'result', width: 20 }
        ];
        
        // Примеры расчетов
        const calculations = [
            {
                formula: 'Средняя цена продукта',
                description: 'AVG(products.price)',
                result: this.statistics.products.avgPrice || 0
            },
            {
                formula: 'Маржинальность (примерная)',
                description: 'Предполагаемая маржа 30%',
                result: (this.statistics.clients.totalRevenue || 0) * 0.3
            },
            {
                formula: 'Рост клиентской базы',
                description: 'Новые клиенты / Всего клиентов',
                result: this.calculateGrowthRate()
            }
        ];
        
        calculations.forEach(calc => {
            calcSheet.addRow(calc);
        });
        
        // Сохраняем файл
        const reportDir = path.join(__dirname, '../database/reports');
        await fs.mkdir(reportDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `crm_report_${timestamp}.xlsx`;
        const filePath = path.join(reportDir, fileName);
        
        await workbook.xlsx.writeFile(filePath);
        
        console.log('✅ Отчет сохранен:', filePath);
        
        return {
            filePath,
            fileName,
            downloadUrl: `/reports/${fileName}`,
            stats: {
                clients: this.statistics.clients.total || 0,
                products: this.statistics.products.total || 0,
                revenue: this.statistics.clients.totalRevenue || 0
            }
        };
    }

    // Выполнение математических расчетов
    calculate(formula, variables = {}) {
        try {
            // Заменяем переменные в формуле
            let expression = formula;
            Object.entries(variables).forEach(([key, value]) => {
                expression = expression.replace(new RegExp(key, 'g'), value);
            });
            
            // Вычисляем результат
            const result = math.evaluate(expression);
            
            return {
                success: true,
                formula,
                variables,
                result,
                formatted: this.formatNumber(result)
            };
            
        } catch (error) {
            return {
                success: false,
                formula,
                error: error.message,
                suggestion: 'Проверьте синтаксис формулы. Используйте: + - * / ^ sin() cos() sqrt()'
            };
        }
    }

    // Генерация прогнозов
    generateForecast(data, periods = 12) {
        if (!data || data.length < 3) {
            return { error: 'Недостаточно данных для прогноза' };
        }
        
        const values = data.map(d => typeof d === 'object' ? d.value : d);
        
        try {
            // Простая линейная регрессия
            const n = values.length;
            const x = Array.from({ length: n }, (_, i) => i);
            
            const sumX = math.sum(x);
            const sumY = math.sum(values);
            const sumXY = math.sum(x.map((xi, i) => xi * values[i]));
            const sumX2 = math.sum(x.map(xi => xi * xi));
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            // Прогноз на будущие периоды
            const forecast = [];
            for (let i = 0; i < periods; i++) {
                forecast.push({
                    period: i + 1,
                    value: intercept + slope * (n + i),
                    trend: slope > 0 ? 'рост' : slope < 0 ? 'снижение' : 'стабильно'
                });
            }
            
            return {
                success: true,
                currentTrend: slope > 0 ? '📈 Восходящий тренд' : slope < 0 ? '📉 Нисходящий тренд' : '➡️ Стабильный',
                slope,
                intercept,
                forecast,
                confidence: Math.min(0.95, 0.7 + (n / 100)) // Простая оценка доверия
            };
            
        } catch (error) {
            return { error: 'Ошибка расчета прогноза: ' + error.message };
        }
    }

    // Вспомогательные методы
    isNumericColumn(values) {
        return values.some(v => !isNaN(parseFloat(v)) && isFinite(v));
    }

    isDateColumn(values) {
        return values.some(v => 
            v instanceof Date || 
            (typeof v === 'string' && !isNaN(Date.parse(v)))
        );
    }

    determineSheetType(columns, data) {
        const colNames = columns.map(c => c.toLowerCase());
        
        if (colNames.some(c => c.includes('заказ') || c.includes('order') || c.includes('sale'))) {
            return 'sales';
        }
        if (colNames.some(c => c.includes('клиент') || c.includes('customer'))) {
            return 'clients';
        }
        if (colNames.some(c => c.includes('товар') || c.includes('product'))) {
            return 'products';
        }
        if (colNames.some(c => c.includes('финанс') || c.includes('finance'))) {
            return 'financial';
        }
        
        return 'general';
    }

    getMonthFromDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        } catch {
            return 'Неизвестно';
        }
    }

    minDate(dates) {
        const validDates = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
        return validDates.length > 0 ? format(Math.min(...validDates), 'dd.MM.yyyy') : 'Нет данных';
    }

    maxDate(dates) {
        const validDates = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
        return validDates.length > 0 ? format(Math.max(...validDates), 'dd.MM.yyyy') : 'Нет данных';
    }

    getColumnLetter(columnName, columns) {
        const index = columns.indexOf(columnName);
        if (index === -1) return 'A';
        
        let letter = '';
        let i = index + 1;
        while (i > 0) {
            i--;
            letter = String.fromCharCode(65 + (i % 26)) + letter;
            i = Math.floor(i / 26);
        }
        return letter;
    }

    formatNumber(num) {
        if (typeof num !== 'number') return num;
        
        if (Math.abs(num) >= 1000000) {
            return (num / 1000000).toFixed(2) + ' млн';
        }
        if (Math.abs(num) >= 1000) {
            return (num / 1000).toFixed(1) + ' тыс';
        }
        
        return num.toFixed(2);
    }

    calculateGrowthRate() {
        // Упрощенный расчет роста
        const newClients = this.knowledge.clients.filter(c => c.status === 'новый').length;
        const totalClients = this.knowledge.clients.length;
        
        return totalClients > 0 ? (newClients / totalClients * 100).toFixed(1) + '%' : '0%';
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    // Основной метод обработки запросов
    async process(query) {
        console.log('🧮 Обработка: "' + query + '"');
        
        const q = query.toLowerCase();
        let response = '';
        
        // Математические расчеты
        if (q.includes('рассчитай') || q.includes('посчитай') || q.includes('формула')) {
            response = this.handleCalculation(query);
        }
        // Создание отчетов
        else if (q.includes('отчет') || q.includes('excel') || q.includes('таблиц')) {
            response = await this.handleReportRequest(query);
        }
        // Статистика
        else if (q.includes('статистик') || q.includes('анализ')) {
            response = this.handleStatisticsRequest(query);
        }
        // Прогнозы
        else if (q.includes('прогноз') || q.includes('тренд') || q.includes('предсказ')) {
            response = this.handleForecastRequest(query);
        }
        // Общая информация
        else {
            response = this.generateGeneralResponse(query);
        }
        
        return {
            success: true,
            query,
            response,
            timestamp: new Date().toISOString(),
            hasData: true
        };
    }

    handleCalculation(query) {
        // Извлекаем формулу из запроса
        const formulaMatch = query.match(/рассчитай (.+)/i) || query.match(/посчитай (.+)/i);
        
        if (formulaMatch) {
            const formula = formulaMatch[1];
            const result = this.calculate(formula);
            
            if (result.success) {
                return `📊 Результат расчета:\nФормула: ${formula}\nРезультат: ${result.formatted}`;
            } else {
                return `❌ Ошибка расчета: ${result.error}\nПодсказка: ${result.suggestion}`;
            }
        }
        
        return '📝 Укажите формулу для расчета. Например: "рассчитай 1000 * 1.2 ^ 5"';
    }

    async handleReportRequest(query) {
        try {
            const report = await this.createExcelReport();
            
            return `✅ Excel отчет создан!\n` +
                   `📁 Файл: ${report.fileName}\n` +
                   `📊 Статистика:\n` +
                   `   • Клиентов: ${report.stats.clients}\n` +
                   `   • Продуктов: ${report.stats.products}\n` +
                   `   • Выручка: ${this.formatNumber(report.stats.revenue)} руб.\n\n` +
                   `📈 Отчет содержит: сводку, список клиентов, анализ продаж и расчеты.`;
                   
        } catch (error) {
            return `❌ Ошибка создания отчета: ${error.message}`;
        }
    }

    handleStatisticsRequest(query) {
        let statsText = '📈 СТАТИСТИКА CRM:\n\n';
        
        // Клиенты
        if (this.statistics.clients.total > 0) {
            statsText += '👥 КЛИЕНТЫ:\n';
            statsText += `   • Всего: ${this.statistics.clients.total}\n`;
            statsText += `   • Выручка: ${this.formatNumber(this.statistics.clients.totalRevenue)} руб.\n`;
            statsText += `   • Средний чек: ${this.formatNumber(this.statistics.clients.avgSpent)} руб.\n`;
            
            if (this.statistics.clients.byCity) {
                const topCities = Object.entries(this.statistics.clients.byCity)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);
                    
                if (topCities.length > 0) {
                    statsText += `   • Топ городов: ${topCities.map(([city, count]) => `${city} (${count})`).join(', ')}\n`;
                }
            }
            
            statsText += '\n';
        }
        
        // Продукты
        if (this.statistics.products.total > 0) {
            statsText += '📦 ПРОДУКТЫ:\n';
            statsText += `   • Всего: ${this.statistics.products.total}\n`;
            statsText += `   • Средняя цена: ${this.formatNumber(this.statistics.products.avgPrice)} руб.\n`;
            statsText += `   • Диапазон цен: ${this.formatNumber(this.statistics.products.minPrice)} - ${this.formatNumber(this.statistics.products.maxPrice)} руб.\n`;
            
            if (this.statistics.products.byCategory) {
                statsText += `   • Категории: ${Object.keys(this.statistics.products.byCategory).length}\n`;
            }
            
            statsText += '\n';
        }
        
        // Продажи из Excel
        if (Object.keys(this.statistics.sales).length > 0) {
            statsText += '💰 ПРОДАЖИ (из Excel):\n';
            
            Object.entries(this.statistics.sales).forEach(([source, data]) => {
                statsText += `   • ${source}: ${this.formatNumber(data.total)} руб. (${data.count} сделок)\n`;
            });
        }
        
        if (statsText === '📈 СТАТИСТИКА CRM:\n\n') {
            statsText = '📊 Данных для статистики пока недостаточно. Загрузите Excel файлы с данными.';
        }
        
        return statsText;
    }

    handleForecastRequest(query) {
        // Пример данных для прогноза (в реальности брать из статистики)
        const sampleData = [
            { month: 'Янв', value: 100000 },
            { month: 'Фев', value: 120000 },
            { month: 'Мар', value: 150000 },
            { month: 'Апр', value: 140000 },
            { month: 'Май', value: 160000 }
        ];
        
        const forecast = this.generateForecast(sampleData.map(d => d.value), 6);
        
        if (forecast.error) {
            return `❌ ${forecast.error}`;
        }
        
        let forecastText = `🔮 ПРОГНОЗ ПРОДАЖ (на примере данных):\n\n`;
        forecastText += `${forecast.currentTrend}\n`;
        forecastText += `Доверие прогноза: ${Math.round(forecast.confidence * 100)}%\n\n`;
        forecastText += `📅 ПРОГНОЗ НА 6 МЕСЯЦЕВ:\n`;
        
        forecast.forecast.forEach((item, index) => {
            forecastText += `   ${index + 1}. ${this.formatNumber(item.value)} руб. (${item.trend})\n`;
        });
        
        forecastText += `\n💡 Совет: Для точного прогноза загрузите исторические данные в Excel.`;
        
        return forecastText;
    }

    generateGeneralResponse(query) {
        const q = query.toLowerCase();
        
        if (q.includes('привет') || q.includes('здравств')) {
            return `👋 Привет! Я ${this.name} - ИИ-помощник для CRM.\n` +
                   `Умею анализировать данные, считать статистику, создавать Excel отчеты и делать прогнозы.\n` +
                   `Спросите: "статистика", "создай отчет", "рассчитай формулу" или "прогноз продаж".`;
        }
        
        if (q.includes('помощь') || q.includes('команды')) {
            return `🛠️ ДОСТУПНЫЕ КОМАНДЫ:\n\n` +
                   `📊 Аналитика:\n` +
                   `• "статистика" - сводная статистика CRM\n` +
                   `• "анализ продаж" - анализ данных о продажах\n` +
                   `• "топ клиентов" - лучшие клиенты по выручке\n\n` +
                   `🧮 Расчеты:\n` +
                   `• "рассчитай [формула]" - математический расчет\n` +
                   `• "маржа от 100000" - расчет маржинальности\n` +
                   `• "прогноз продаж" - прогноз на будущие периоды\n\n` +
                   `📁 Отчеты:\n` +
                   `• "создай отчет" - генерация Excel отчета\n` +
                   `• "excel файлы" - список загруженных файлов\n` +
                   `• "обнови статистику" - пересчет всех данных\n\n` +
                   `❓ Примеры: "рассчитай 50000 * 1.15 ^ 3", "создай отчет", "статистика клиентов"`;
        }
        
        return `🤔 Понял ваш запрос: "${query}".\n` +
               `Могу помочь с анализом данных, расчетами или созданием отчетов.\n` +
               `Скажите "помощь" для списка команд.`;
    }
}

module.exports = CRM_AI_Agent_Advanced;