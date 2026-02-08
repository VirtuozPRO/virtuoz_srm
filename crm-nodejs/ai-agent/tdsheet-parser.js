const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🔍 АНАЛИЗ ЛИСТА TDSheet');
console.log('='.repeat(50));

try {
    const filePath = path.join(__dirname, '../database/срм база.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['TDSheet'];
    
    // Читаем как массив
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: true });
    
    console.log('Всего строк: ' + rawData.length);
    
    // Пропускаем полностью пустые строки в начале
    let startRow = 0;
    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
            const nonEmpty = row.filter(cell => cell !== null && cell !== '').length;
            if (nonEmpty > 3) { // Если больше 3 непустых ячеек
                startRow = i;
                break;
            }
        }
    }
    
    console.log('Первые данные в строке: ' + (startRow + 1));
    
    // Покажем строки с данными
    console.log('\n📋 СТРОКИ С ДАННЫМИ (первые 20):');
    for (let i = startRow; i < Math.min(startRow + 20, rawData.length); i++) {
        const row = rawData[i];
        const nonEmptyCells = row.filter(cell => cell !== null && cell !== '').length;
        
        if (nonEmptyCells > 0) {
            console.log('\nСтрока ' + (i + 1) + ' (' + nonEmptyCells + ' ячеек):');
            
            // Показываем только заполненные ячейки
            row.forEach((cell, colIndex) => {
                if (cell !== null && cell !== '') {
                    console.log('  Колонка ' + colIndex + ': ' + 
                        JSON.stringify(cell).substring(0, 100));
                }
            });
        }
    }
    
    // Попробуем найти паттерны заголовков
    console.log('\n🔍 ПОИСК ПАТТЕРНОВ ЗАГОЛОВКОВ:');
    
    // Ищем строку, где много текстовых значений
    let possibleHeaderRow = -1;
    for (let i = startRow; i < Math.min(startRow + 30, rawData.length); i++) {
        const row = rawData[i];
        const textCells = row.filter(cell => 
            cell && typeof cell === 'string' && 
            cell.length > 2 && 
            !cell.match(/^\d+$/) // Не только цифры
        ).length;
        
        if (textCells > 5) { // Если много текстовых ячеек
            possibleHeaderRow = i;
            break;
        }
    }
    
    if (possibleHeaderRow >= 0) {
        console.log('Возможные заголовки в строке ' + (possibleHeaderRow + 1) + ':');
        const headerRow = rawData[possibleHeaderRow];
        
        headerRow.forEach((cell, i) => {
            if (cell && cell.toString().trim()) {
                console.log('  Колонка ' + i + ': "' + cell + '"');
            }
        });
        
        // Покажем следующую строку (данные)
        if (possibleHeaderRow + 1 < rawData.length) {
            console.log('\nПример данных (строка ' + (possibleHeaderRow + 2) + '):');
            const dataRow = rawData[possibleHeaderRow + 1];
            dataRow.forEach((cell, i) => {
                if (cell !== null && cell !== '') {
                    console.log('  ' + i + ': ' + cell);
                }
            });
        }
    } else {
        console.log('Не найдено строки с множеством текстовых значений');
        
        // Попробуем ручной поиск знакомых заголовков
        console.log('\n🔎 РУЧНОЙ ПОИСК ЗНАКОМЫХ ЗАГОЛОВКОВ:');
        const searchTerms = ['Код', 'Наименование', 'Торговый', 'представитель', 'Хитров', 'Хисмат', 'Дата', 'Регион'];
        
        for (let i = startRow; i < Math.min(startRow + 50, rawData.length); i++) {
            const row = rawData[i];
            const foundTerms = [];
            
            row.forEach(cell => {
                if (cell && typeof cell === 'string') {
                    searchTerms.forEach(term => {
                        if (cell.includes(term)) {
                            foundTerms.push({ term, cell });
                        }
                    });
                }
            });
            
            if (foundTerms.length > 0) {
                console.log('Строка ' + (i + 1) + ' содержит:');
                foundTerms.forEach(item => {
                    console.log('  • ' + item.term + ' -> ' + item.cell);
                });
                break;
            }
        }
    }
    
    // Экспорт части данных для анализа
    console.log('\n💾 Экспорт первых 30 строк для анализа...');
    const exportData = [];
    for (let i = startRow; i < Math.min(startRow + 30, rawData.length); i++) {
        const row = rawData[i];
        const nonEmptyCells = row.filter(cell => cell !== null && cell !== '').length;
        
        if (nonEmptyCells > 0) {
            exportData.push({
                row: i + 1,
                cells: row.map((cell, idx) => ({
                    column: idx,
                    value: cell
                })).filter(item => item.value !== null && item.value !== '')
            });
        }
    }
    
    // Сохраняем для анализа
    const fs = require('fs');
    const exportPath = path.join(__dirname, '../database/tdsheet_analysis.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log('✅ Данные экспортированы в: ' + exportPath);
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}