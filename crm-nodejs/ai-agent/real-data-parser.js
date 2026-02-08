// ================================================
// СПЕЦИАЛЬНЫЙ ПАРСЕР ДЛЯ срм база.xlsx
// Анализ реальных данных ТП
// ================================================

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🎯 ПАРСЕР РЕАЛЬНЫХ ДАННЫХ ТП');
console.log('='.repeat(60));

class RealDataParser {
    constructor() {
        this.results = {
            hitrov: [],
            hismatullin: [],
            otherTPs: [],
            errors: []
        };
    }

    async parseRealFile() {
        const filePath = path.join(__dirname, '../database/срм база.xlsx');
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ Файл не найден: срм база.xlsx');
            return;
        }
        
        console.log('✅ Файл найден');
        
        try {
            const workbook = XLSX.readFile(filePath, {
                type: 'buffer',
                cellFormula: false,
                cellStyles: false,
                sheetStubs: false
            });
            
            console.log(`📊 Листов: ${workbook.SheetNames.length}`);
            console.log(`📋 Названия: ${workbook.SheetNames.join(', ')}`);
            
            // Пробуем оба листа
            await this.parseSheet(workbook, 'TDSheet');
            await this.parseSheet(workbook, 'Лист1');
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Ошибка чтения файла:', error.message);
        }
    }

    async parseSheet(workbook, sheetName) {
        console.log(`\n🔍 АНАЛИЗ ЛИСТА: "${sheetName}"`);
        console.log('─'.repeat(40));
        
        try {
            const worksheet = workbook.Sheets[sheetName];
            
            // Получаем все данные как массив
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const totalRows = range.e.r + 1;
            const totalCols = range.e.c + 1;
            
            console.log(`   • Всего строк: ${totalRows}`);
            console.log(`   • Всего столбцов: ${totalCols}`);
            
            // Собираем все непустые ячейки
            const allCells = [];
            
            for (let row = 0; row < totalRows; row++) {
                for (let col = 0; col < totalCols; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                        allCells.push({
                            row: row + 1,
                            col: col + 1,
                            value: cell.v,
                            address: cellAddress
                        });
                    }
                }
            }
            
            console.log(`   • Непустых ячеек: ${allCells.length}`);
            
            // Ищем данные о ТП
            console.log(`\n   🔎 Поиск данных о ТП:`);
            
            // Ключевые слова для поиска
            const tpKeywords = [
                'Хитров', 'Кирилл',
                'Хисматуллин', 'Рустам', 
                'Хисмат', 'Торговый', 'представитель',
                'Менеджер', 'Ответственный'
            ];
            
            const foundTPData = [];
            
            allCells.forEach(cell => {
                const cellValue = String(cell.value);
                tpKeywords.forEach(keyword => {
                    if (cellValue.includes(keyword)) {
                        foundTPData.push({
                            ...cell,
                            keyword: keyword,
                            context: this.getCellContext(worksheet, cell.row - 1, cell.col - 1)
                        });
                    }
                });
            });
            
            console.log(`   • Найдено упоминаний ТП: ${foundTPData.length}`);
            
            if (foundTPData.length > 0) {
                console.log(`\n   📍 Расположение упоминаний ТП:`);
                
                foundTPData.forEach(item => {
                    console.log(`     • Строка ${item.row}, Колонка ${item.col}: "${item.value.substring(0, 50)}"`);
                    
                    // Определяем к какому ТП относится
                    if (item.value.includes('Хитров') || item.value.includes('Кирилл')) {
                        this.results.hitrov.push({
                            source: `${sheetName} - строка ${item.row}`,
                            value: item.value,
                            context: item.context
                        });
                    } else if (item.value.includes('Хисмат') || item.value.includes('Рустам')) {
                        this.results.hismatullin.push({
                            source: `${sheetName} - строка ${item.row}`,
                            value: item.value,
                            context: item.context
                        });
                    } else {
                        this.results.otherTPs.push({
                            source: `${sheetName} - строка ${item.row}`,
                            value: item.value,
                            context: item.context
                        });
                    }
                });
                
                // Покажем контекст для первого найденного
                if (foundTPData[0].context) {
                    console.log(`\n   📄 Контекст первого найденного:`);
                    console.log(`     ${foundTPData[0].context}`);
                }
            } else {
                console.log(`   ⚠️  Упоминания ТП не найдены`);
                
                // Покажем примеры данных
                console.log(`\n   📋 Примеры данных (первые 10 непустых ячеек):`);
                allCells.slice(0, 10).forEach(cell => {
                    console.log(`     • Строка ${cell.row}, Колонка ${cell.col}: "${cell.value}"`);
                });
            }
            
        } catch (error) {
            console.error(`   ❌ Ошибка анализа листа: ${error.message}`);
            this.results.errors.push(`${sheetName}: ${error.message}`);
        }
    }

    // Получение контекста ячейки (окружающие данные)
    getCellContext(worksheet, row, col) {
        const context = [];
        const rowsToShow = 2;
        const colsToShow = 3;
        
        for (let r = Math.max(0, row - rowsToShow); r <= row + rowsToShow; r++) {
            const rowData = [];
            for (let c = Math.max(0, col - colsToShow); c <= col + colsToShow; c++) {
                const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
                const cell = worksheet[cellAddress];
                const value = cell && cell.v !== undefined ? cell.v : '';
                rowData.push(value);
            }
            context.push(`Строка ${r + 1}: [${rowData.join(' | ')}]`);
        }
        
        return context.join('\n');
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 РЕАЛЬНЫЕ ДАННЫЕ О ТП');
        console.log('='.repeat(60));
        
        console.log(`\n🎯 ХИТРОВ КИРИЛЛ:`);
        console.log(`   • Найдено упоминаний: ${this.results.hitrov.length}`);
        if (this.results.hitrov.length > 0) {
            this.results.hitrov.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.source}: "${item.value.substring(0, 100)}"`);
            });
        }
        
        console.log(`\n🎯 ХИСМАТУЛЛИН РУСТАМ:`);
        console.log(`   • Найдено упоминаний: ${this.results.hismatullin.length}`);
        if (this.results.hismatullin.length > 0) {
            this.results.hismatullin.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.source}: "${item.value.substring(0, 100)}"`);
            });
        }
        
        if (this.results.otherTPs.length > 0) {
            console.log(`\n📌 ДРУГИЕ УПОМИНАНИЯ ТП:`);
            console.log(`   • Найдено: ${this.results.otherTPs.length}`);
            this.results.otherTPs.slice(0, 5).forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.source}: "${item.value.substring(0, 100)}"`);
            });
        }
        
        if (this.results.errors.length > 0) {
            console.log(`\n❌ ОШИБКИ:`);
            this.results.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
        }
        
        console.log(`\n💡 РЕКОМЕНДАЦИИ:`);
        if (this.results.hitrov.length === 0 && this.results.hismatullin.length === 0) {
            console.log(`   1. Возможно данные в другом формате`);
            console.log(`   2. Проверьте, правильно ли записаны имена ТП`);
            console.log(`   3. Попробуйте экспортировать данные в CSV`);
        } else {
            console.log(`   ✅ Данные найдены! Можно создавать отчеты.`);
        }
    }
}

// Запуск
const parser = new RealDataParser();
parser.parseRealFile().catch(console.error);