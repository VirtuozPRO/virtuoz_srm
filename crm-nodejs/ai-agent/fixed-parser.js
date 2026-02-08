const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🔍 ИСПРАВЛЕННЫЙ ПАРСЕР ТП');
console.log('='.repeat(50));

try {
    const filePath = path.join(__dirname, '../database/срм база.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.log('❌ Файл не найден');
        return;
    }
    
    console.log('✅ Файл найден: ' + path.basename(filePath));
    
    // Читаем Excel с правильными настройками
    const workbook = XLSX.readFile(filePath);
    
    console.log('\n📊 ЛИСТЫ В ФАЙЛЕ:');
    workbook.SheetNames.forEach((name, i) => {
        console.log('   ' + (i + 1) + '. ' + name);
    });
    
    // Пробуем оба листа
    console.log('\n🔍 АНАЛИЗ ЛИСТА "TDSheet":');
    const sheet1 = workbook.Sheets['TDSheet'];
    
    // Пробуем разные варианты чтения
    console.log('\nВариант 1: Чтение как есть');
    const data1 = XLSX.utils.sheet_to_json(sheet1, { defval: '', header: 1 });
    console.log('   • Строк: ' + data1.length);
    if (data1.length > 0) {
        console.log('   • Первая строка:');
        data1[0].forEach((cell, i) => {
            console.log('     ' + i + ': ' + (cell || '(пусто)'));
        });
    }
    
    console.log('\nВариант 2: Чтение с заголовками из строки 1');
    const data2 = XLSX.utils.sheet_to_json(sheet1, { defval: '', header: 1, range: 0 });
    if (data2.length > 1) {
        console.log('   • Заголовки (строка 1):');
        data2[0].forEach((cell, i) => {
            console.log('     ' + i + ': "' + (cell || '') + '"');
        });
        
        console.log('   • Данные (строка 2):');
        if (data2[1]) {
            data2[1].forEach((cell, i) => {
                console.log('     ' + i + ': ' + (cell || '(пусто)'));
            });
        }
    }
    
    console.log('\nВариант 3: Ручной поиск заголовков');
    // Читаем весь лист как массив
    const rawData = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: null });
    
    // Ищем строку с заголовками (ищем "Код", "Наименование" и т.д.)
    let headerRowIndex = -1;
    let headers = [];
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
            // Ищем знакомые заголовки
            const hasKnownHeaders = row.some(cell => 
                cell && typeof cell === 'string' && (
                    cell.includes('Код') ||
                    cell.includes('Наименование') ||
                    cell.includes('Торговый') ||
                    cell.includes('представитель')
                )
            );
            
            if (hasKnownHeaders) {
                headerRowIndex = i;
                headers = row.map(cell => cell || '');
                break;
            }
        }
    }
    
    if (headerRowIndex >= 0) {
        console.log('✅ Заголовки найдены в строке ' + (headerRowIndex + 1));
        console.log('📋 Список столбцов:');
        headers.forEach((header, i) => {
            if (header) {
                console.log('   ' + (i + 1) + '. "' + header + '"');
            }
        });
        
        // Читаем данные с этими заголовками
        const dataWithHeaders = XLSX.utils.sheet_to_json(sheet1, { 
            defval: '', 
            header: headers,
            range: headerRowIndex
        });
        
        console.log('\n📊 ДАННЫХ С ЗАГОЛОВКАМИ: ' + dataWithHeaders.length + ' строк');
        
        // Ищем столбец с ТП
        const tpColumn = headers.find(h => 
            h && h.toString().toLowerCase().includes('торг') || 
            h.toString().toLowerCase().includes('представ')
        );
        
        if (tpColumn) {
            console.log('\n👥 НАЙДЕН СТОЛБЕЦ ТП: "' + tpColumn + '"');
            
            // Анализируем данные ТП
            const tpStats = {};
            dataWithHeaders.forEach(row => {
                const tp = row[tpColumn] || '';
                if (tp) {
                    tpStats[tp] = (tpStats[tp] || 0) + 1;
                }
            });
            
            console.log('\n📈 РАСПРЕДЕЛЕНИЕ ПО ТП:');
            Object.entries(tpStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([tp, count]) => {
                    console.log('   • ' + tp + ': ' + count + ' клиентов');
                });
                
        } else {
            console.log('❌ Столбец ТП не найден в заголовках');
        }
        
    } else {
        console.log('❌ Заголовки не найдены в первых 10 строках');
        console.log('\n🔍 СОДЕРЖИМОЕ ПЕРВЫХ 5 СТРОК:');
        for (let i = 0; i < Math.min(5, rawData.length); i++) {
            console.log('Строка ' + (i + 1) + ': ' + JSON.stringify(rawData[i]));
        }
    }
    
} catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
}