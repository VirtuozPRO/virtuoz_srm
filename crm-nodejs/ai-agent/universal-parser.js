// ================================================
// УНИВЕРСАЛЬНЫЙ ПАРСЕР-ШАБЛОН
// Поддерживает: CSV, Excel, JSON
// Структура: ID | Клиент | Адрес | Торговый представитель
// ================================================

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const csv = require('csv-parse/sync');

class UniversalTPParser {
    constructor() {
        this.results = {
            filesProcessed: 0,
            clientsFound: 0,
            hitrovClients: [],
            hismatullinClients: [],
            otherTPs: {},
            errors: []
        };
    }

    // Главный метод
    async parseAllFiles() {
        console.log('🎯 УНИВЕРСАЛЬНЫЙ ПАРСЕР ТП');
        console.log('='.repeat(50));
        
        const dataDir = path.join(__dirname, '../database');
        
        try {
            const files = fs.readdirSync(dataDir);
            console.log(`📁 Файлов в директории: ${files.length}`);
            
            for (const fileName of files) {
                const filePath = path.join(dataDir, fileName);
                console.log(`\n🔍 Обработка: ${fileName}`);
                
                try {
                    if (fileName.match(/\.xlsx?$/i)) {
                        await this.parseExcel(filePath, fileName);
                    } else if (fileName.match(/\.csv$/i)) {
                        await this.parseCSV(filePath, fileName);
                    } else if (fileName.match(/\.json$/i)) {
                        await this.parseJSON(filePath, fileName);
                    } else {
                        console.log(`   ⚠️  Неподдерживаемый формат`);
                    }
                } catch (error) {
                    this.results.errors.push(`${fileName}: ${error.message}`);
                    console.log(`   ❌ Ошибка: ${error.message}`);
                }
            }
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Ошибка чтения директории:', error.message);
        }
    }

    // Парсинг Excel
    async parseExcel(filePath, fileName) {
        console.log(`   📊 Excel файл`);
        
        try {
            const workbook = XLSX.readFile(filePath);
            
            for (const sheetName of workbook.SheetNames) {
                console.log(`   📄 Лист: "${sheetName}"`);
                
                const worksheet = workbook.Sheets[sheetName];
                
                // Пробуем разные способы чтения
                const data = XLSX.utils.sheet_to_json(worksheet, { 
                    defval: '', 
                    header: 1,
                    blankrows: false 
                });
                
                if (data.length === 0) {
                    console.log(`      ⚠️  Пустой лист`);
                    continue;
                }
                
                console.log(`      • Строк: ${data.length}`);
                
                // Ищем заголовки
                const headers = this.findHeaders(data);
                if (headers.length > 0) {
                    console.log(`      • Найдено столбцов: ${headers.length}`);
                    
                    // Парсим с заголовками
                    const structuredData = XLSX.utils.sheet_to_json(worksheet, {
                        defval: '',
                        header: headers
                    });
                    
                    this.analyzeStructuredData(structuredData, headers, `${fileName} - ${sheetName}`);
                } else {
                    // Пытаемся угадать структуру
                    this.guessAndParse(data, `${fileName} - ${sheetName}`);
                }
            }
            
        } catch (error) {
            throw new Error(`Excel ошибка: ${error.message}`);
        }
    }

    // Парсинг CSV
    async parseCSV(filePath, fileName) {
        console.log(`   📝 CSV файл`);
        
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Пробуем разные разделители
            const delimiters = [',', ';', '|', '\t'];
            
            for (const delimiter of delimiters) {
                try {
                    const records = csv.parse(fileContent, {
                        delimiter: delimiter,
                        columns: true,
                        skip_empty_lines: true,
                        trim: true
                    });
                    
                    if (records.length > 0) {
                        console.log(`      • Разделитель: "${delimiter}"`);
                        console.log(`      • Строк: ${records.length}`);
                        console.log(`      • Столбцов: ${Object.keys(records[0]).length}`);
                        
                        this.analyzeStructuredData(records, Object.keys(records[0]), fileName);
                        return;
                    }
                } catch {
                    // Пробуем следующий разделитель
                    continue;
                }
            }
            
            console.log(`      ⚠️  Не удалось определить структуру CSV`);
            
        } catch (error) {
            throw new Error(`CSV ошибка: ${error.message}`);
        }
    }

    // Парсинг JSON
    async parseJSON(filePath, fileName) {
        console.log(`   📋 JSON файл`);
        
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            
            if (Array.isArray(data)) {
                console.log(`      • Элементов: ${data.length}`);
                
                if (data.length > 0 && typeof data[0] === 'object') {
                    const headers = Object.keys(data[0]);
                    console.log(`      • Столбцы: ${headers.length}`);
                    
                    this.analyzeStructuredData(data, headers, fileName);
                }
            } else if (typeof data === 'object') {
                console.log(`      • Объект с ключами: ${Object.keys(data).join(', ')}`);
            }
            
        } catch (error) {
            throw new Error(`JSON ошибка: ${error.message}`);
        }
    }

    // Поиск заголовков в данных
    findHeaders(data) {
        if (!Array.isArray(data) || data.length === 0) return [];
        
        // Ищем строку с максимальным количеством текстовых значений
        let bestRowIndex = -1;
        let maxTextCells = 0;
        
        for (let i = 0; i < Math.min(20, data.length); i++) {
            const row = data[i];
            if (Array.isArray(row)) {
                const textCells = row.filter(cell => 
                    cell && typeof cell === 'string' && 
                    cell.trim().length > 0 &&
                    !cell.match(/^\d+([.,]\d+)?$/) // Не только числа
                ).length;
                
                if (textCells > maxTextCells) {
                    maxTextCells = textCells;
                    bestRowIndex = i;
                }
            }
        }
        
        if (bestRowIndex >= 0 && maxTextCells >= 2) {
            return data[bestRowIndex].map(cell => cell || '');
        }
        
        return [];
    }

    // Анализ структурированных данных
    analyzeStructuredData(data, headers, source) {
        console.log(`      🔍 Анализ структуры...`);
        
        // Нормализуем заголовки
        const normalizedHeaders = headers.map(h => 
            h.toString().toLowerCase().trim()
        );
        
        // Ищем ключевые столбцы
        const idColumn = this.findColumn(normalizedHeaders, ['id', 'код', 'номер', '№']);
        const clientColumn = this.findColumn(normalizedHeaders, ['клиент', 'client', 'наименование', 'компания', 'фио']);
        const addressColumn = this.findColumn(normalizedHeaders, ['адрес', 'address', 'location', 'город']);
        const tpColumn = this.findColumn(normalizedHeaders, ['торговый', 'представитель', 'менеджер', 'ответственный', 'tp']);
        
        console.log(`      📌 Структура:`);
        console.log(`         • ID: ${idColumn >= 0 ? headers[idColumn] : 'Не найден'}`);
        console.log(`         • Клиент: ${clientColumn >= 0 ? headers[clientColumn] : 'Не найден'}`);
        console.log(`         • Адрес: ${addressColumn >= 0 ? headers[addressColumn] : 'Не найден'}`);
        console.log(`         • ТП: ${tpColumn >= 0 ? headers[tpColumn] : 'Не найден'}`);
        
        if (tpColumn >= 0) {
            this.analyzeTPData(data, tpColumn, clientColumn, addressColumn, source, headers);
        } else {
            console.log(`      ⚠️  Столбец ТП не найден, поиск по содержимому...`);
            this.searchTPInData(data, normalizedHeaders, headers, source);
        }
    }

    // Анализ данных ТП
    analyzeTPData(data, tpCol, clientCol, addressCol, source, headers) {
        const tpStats = {};
        
        data.forEach((row, index) => {
            const tpValue = row[headers[tpCol]] || '';
            if (tpValue) {
                const normalizedTP = this.normalizeTP(tpValue);
                
                tpStats[normalizedTP] = tpStats[normalizedTP] || {
                    count: 0,
                    clients: []
                };
                
                tpStats[normalizedTP].count++;
                
                const clientName = clientCol >= 0 ? (row[headers[clientCol]] || `Клиент ${index + 1}`) : `Клиент ${index + 1}`;
                const address = addressCol >= 0 ? (row[headers[addressCol]] || 'Не указан') : 'Не указан';
                
                tpStats[normalizedTP].clients.push({
                    name: clientName,
                    address: address,
                    source: source,
                    row: index + 1
                });
            }
        });
        
        console.log(`      👥 Найдено ТП: ${Object.keys(tpStats).length}`);
        
        // Сохраняем результаты
        Object.entries(tpStats).forEach(([tp, stats]) => {
            if (tp === 'Хитров') {
                this.results.hitrovClients.push(...stats.clients);
            } else if (tp === 'Хисматуллин') {
                this.results.hismatullinClients.push(...stats.clients);
            } else {
                this.results.otherTPs[tp] = stats;
            }
            
            this.results.clientsFound += stats.count;
        });
        
        // Покажем статистику
        Object.entries(tpStats)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .forEach(([tp, stats]) => {
                console.log(`         • ${tp}: ${stats.count} клиентов`);
            });
    }

    // Поиск ТП в данных (когда нет явного столбца)
    searchTPInData(data, normalizedHeaders, headers, source) {
        const tpKeywords = ['хитров', 'хисмат', 'кирилл', 'рустам', 'менеджер', 'торговый', 'представитель'];
        
        data.forEach((row, rowIndex) => {
            headers.forEach((header, colIndex) => {
                const value = row[header];
                if (value && typeof value === 'string') {
                    const lowerValue = value.toLowerCase();
                    
                    tpKeywords.forEach(keyword => {
                        if (lowerValue.includes(keyword)) {
                            console.log(`      🔎 Найдено в строке ${rowIndex + 1}, столбец "${header}": ${value.substring(0, 30)}...`);
                            
                            // Определяем какой ТП
                            if (lowerValue.includes('хитров') || lowerValue.includes('кирилл')) {
                                this.results.hitrovClients.push({
                                    name: `Из строки ${rowIndex + 1}`,
                                    address: 'Не определен',
                                    source: source,
                                    row: rowIndex + 1,
                                    foundIn: header,
                                    value: value
                                });
                            } else if (lowerValue.includes('хисмат') || lowerValue.includes('рустам')) {
                                this.results.hismatullinClients.push({
                                    name: `Из строки ${rowIndex + 1}`,
                                    address: 'Не определен',
                                    source: source,
                                    row: rowIndex + 1,
                                    foundIn: header,
                                    value: value
                                });
                            }
                        }
                    });
                }
            });
        });
    }

    // Угадывание и парсинг неструктурированных данных
    guessAndParse(data, source) {
        console.log(`      🤔 Угадываю структуру...`);
        
        // Ищем паттерны ID|Клиент|Адрес|ТП
        for (let i = 0; i < Math.min(20, data.length); i++) {
            const row = data[i];
            if (Array.isArray(row)) {
                // Ищем строку с 3+ заполненными ячейками
                const filledCells = row.filter(cell => cell && cell.toString().trim()).length;
                if (filledCells >= 3) {
                    console.log(`      📄 Строка ${i + 1} (${filledCells} значений):`);
                    
                    // Показываем значения
                    row.forEach((cell, idx) => {
                        if (cell && cell.toString().trim()) {
                            console.log(`         ${idx}: ${cell.toString().substring(0, 50)}`);
                        }
                    });
                    
                    // Проверяем на наличие ТП
                    const rowText = row.join(' ').toLowerCase();
                    if (rowText.includes('хитров') || rowText.includes('хисмат')) {
                        console.log(`      🎯 Найдены ТП в строке ${i + 1}!`);
                    }
                    
                    break;
                }
            }
        }
    }

    // Поиск столбца по ключевым словам
    findColumn(headers, keywords) {
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            for (const keyword of keywords) {
                if (header.includes(keyword)) {
                    return i;
                }
            }
        }
        return -1;
    }

    // Нормализация имени ТП
    normalizeTP(tpValue) {
        if (!tpValue) return 'Не указан';
        
        const tpStr = tpValue.toString().toLowerCase();
        
        if (tpStr.includes('хитров') || tpStr.includes('кирилл')) {
            return 'Хитров';
        }
        if (tpStr.includes('хисмат') || tpStr.includes('рустам')) {
            return 'Хисматуллин';
        }
        if (tpStr.includes('нет') || tpStr.includes('не указан') || tpStr === '') {
            return 'Не указан';
        }
        
        return tpValue;
    }

    // Генерация отчета
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ИТОГОВЫЙ ОТЧЕТ');
        console.log('='.repeat(60));
        
        console.log(`\n📁 Обработано файлов: ${this.results.filesProcessed}`);
        console.log(`👥 Найдено клиентов: ${this.results.clientsFound}`);
        
        console.log(`\n🎯 ТОРГОВЫЕ ПРЕДСТАВИТЕЛИ:`);
        console.log(`   • Хитров: ${this.results.hitrovClients.length} клиентов`);
        console.log(`   • Хисматуллин: ${this.results.hismatullinClients.length} клиентов`);
        
        if (Object.keys(this.results.otherTPs).length > 0) {
            console.log(`   • Другие ТП: ${Object.keys(this.results.otherTPs).length}`);
            Object.entries(this.results.otherTPs)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .forEach(([tp, stats]) => {
                    console.log(`     - ${tp}: ${stats.count} клиентов`);
                });
        }
        
        if (this.results.hitrovClients.length > 0) {
            console.log(`\n📋 КЛИЕНТЫ ХИТРОВА (первые 5):`);
            this.results.hitrovClients.slice(0, 5).forEach(client => {
                console.log(`   • ${client.name} - ${client.address}`);
            });
        }
        
        if (this.results.hismatullinClients.length > 0) {
            console.log(`\n📋 КЛИЕНТЫ ХИСМАТУЛЛИНА (первые 5):`);
            this.results.hismatullinClients.slice(0, 5).forEach(client => {
                console.log(`   • ${client.name} - ${client.address}`);
            });
        }
        
        if (this.results.errors.length > 0) {
            console.log(`\n❌ ОШИБКИ (${this.results.errors.length}):`);
            this.results.errors.slice(0, 3).forEach(error => {
                console.log(`   • ${error}`);
            });
        }
        
        console.log(`\n✅ Анализ завершен!`);
    }
}

// Запуск
const parser = new UniversalTPParser();
parser.parseAllFiles().catch(console.error);