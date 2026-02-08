const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🎯 ПРАВИЛЬНЫЙ ПАРСЕР ТП');
console.log('='.repeat(50));

try {
    const filePath = path.join(__dirname, '../database/срм база.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.log('❌ Файл не найден');
        return;
    }
    
    console.log('✅ Файл найден: ' + path.basename(filePath));
    
    // Читаем Excel
    const workbook = XLSX.readFile(filePath);
    
    console.log('\n📊 АНАЛИЗ ЛИСТА "Лист1" (скорее всего основные данные тут):');
    const sheet = workbook.Sheets['Лист1'];
    
    // Читаем как массив
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: true });
    
    console.log('   • Всего строк: ' + rawData.length);
    
    // Ищем строку с заголовками
    let headerRowIndex = -1;
    let headers = [];
    
    // Пропускаем пустые строки в начале
    for (let i = 0; i < Math.min(20, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
            // Ищем строку, где есть "Код" или "Наименование"
            const hasHeaders = row.some(cell => 
                cell && typeof cell === 'string' && (
                    cell.includes('Код') ||
                    cell.includes('Наименование') ||
                    cell.includes('торг') ||
                    cell.includes('представ')
                )
            );
            
            if (hasHeaders) {
                headerRowIndex = i;
                headers = row.map(cell => cell || '');
                break;
            }
        }
    }
    
    if (headerRowIndex >= 0) {
        console.log('✅ Заголовки найдены в строке ' + (headerRowIndex + 1));
        console.log('📋 Всего столбцов: ' + headers.length);
        
        // Покажем только заполненные заголовки
        console.log('\n📌 ЗАПОЛНЕННЫЕ ЗАГОЛОВКИ:');
        headers.forEach((header, i) => {
            if (header && header.toString().trim()) {
                console.log('   ' + (i + 1) + '. "' + header + '"');
            }
        });
        
        // Читаем данные с заголовками
        const data = XLSX.utils.sheet_to_json(sheet, { 
            defval: '', 
            header: headers,
            range: headerRowIndex
        });
        
        console.log('\n📊 ДАННЫХ С ЗАГОЛОВКАМИ: ' + data.length + ' строк');
        
        if (data.length > 0) {
            // Покажем первую строку данных
            console.log('\n📄 ПЕРВАЯ СТРОКА ДАННЫХ:');
            const firstRow = data[0];
            Object.keys(firstRow).forEach(key => {
                if (firstRow[key]) {
                    console.log('   • ' + key + ': ' + firstRow[key]);
                }
            });
        }
        
        // Ищем столбец с ТП
        const tpColumns = headers.filter(h => 
            h && h.toString().toLowerCase().includes('торг') || 
            h.toString().toLowerCase().includes('представ') ||
            h.toString().toLowerCase().includes('менедж')
        );
        
        if (tpColumns.length > 0) {
            console.log('\n👥 СТОЛБЦЫ С ТП:');
            tpColumns.forEach(col => {
                console.log('   • "' + col + '"');
                
                // Анализируем этот столбец
                const tpStats = {};
                data.forEach(row => {
                    const tp = row[col] || '';
                    if (tp && tp.toString().trim()) {
                        tpStats[tp] = (tpStats[tp] || 0) + 1;
                    }
                });
                
                console.log('     Всего значений: ' + Object.keys(tpStats).length);
                
                // Покажем топ 10
                const topTP = Object.entries(tpStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                    
                if (topTP.length > 0) {
                    console.log('     Топ значений:');
                    topTP.forEach(([tp, count]) => {
                        console.log('       - ' + tp + ': ' + count);
                    });
                }
            });
            
        } else {
            console.log('\n❌ Столбцы ТП не найдены');
            console.log('🔍 Ищу возможные столбцы...');
            
            // Пробуем найти по содержимому
            const sampleRows = data.slice(0, 10);
            const possibleTPColumns = [];
            
            headers.forEach(col => {
                if (col) {
                    // Собираем уникальные значения из первых 10 строк
                    const values = new Set();
                    sampleRows.forEach(row => {
                        const val = row[col];
                        if (val && val.toString().trim()) {
                            values.add(val.toString().substring(0, 50));
                        }
                    });
                    
                    // Если в значениях есть имена (Хитров, Хисматуллин и т.д.)
                    const valuesArray = Array.from(values);
                    const hasNames = valuesArray.some(v => 
                        v.includes('Хитров') || 
                        v.includes('Хисмат') ||
                        v.includes('Рустам') ||
                        v.includes('Кирилл') ||
                        v.includes('Иванов') ||
                        v.includes('Петров')
                    );
                    
                    if (hasNames) {
                        possibleTPColumns.push({
                            column: col,
                            sampleValues: valuesArray.slice(0, 3)
                        });
                    }
                }
            });
            
            if (possibleTPColumns.length > 0) {
                console.log('🎯 ВОЗМОЖНЫЕ СТОЛБЦЫ С ТП:');
                possibleTPColumns.forEach(item => {
                    console.log('   • "' + item.column + '"');
                    console.log('     Примеры: ' + item.sampleValues.join(', '));
                });
            } else {
                console.log('   Не найдено столбцов с именами ТП');
            }
        }
        
    } else {
        console.log('❌ Заголовки не найдены в первых 20 строках');
        
        // Покажем содержимое первых 15 строк
        console.log('\n🔍 СОДЕРЖИМОЕ ПЕРВЫХ 15 СТРОК:');
        for (let i = 0; i < Math.min(15, rawData.length); i++) {
            const row = rawData[i];
            const nonEmptyCells = row.filter(cell => cell !== null && cell !== '').length;
            if (nonEmptyCells > 0) {
                console.log('Строка ' + (i + 1) + ': ' + 
                    row.map(cell => cell === null ? 'null' : 
                                  cell === '' ? '""' : 
                                  '"' + cell.toString().substring(0, 30) + '"'
                    ).join(' ')
                );
            }
        }
    }
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
}