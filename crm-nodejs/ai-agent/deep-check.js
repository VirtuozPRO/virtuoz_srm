const fs = require('fs');
const path = require('path');

console.log('🔍 ГЛУБОКАЯ ПРОВЕРКА EXCEL ФАЙЛА');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '../database/срм база.xlsx');

try {
    // 1. Проверяем размер
    const stats = fs.statSync(filePath);
    console.log('📊 Информация о файле:');
    console.log('   • Размер: ' + stats.size + ' байт');
    console.log('   • Создан: ' + stats.birthtime);
    console.log('   • Изменен: ' + stats.mtime);
    
    // 2. Читаем первые 100 байт для определения типа
    const buffer = fs.readFileSync(filePath, { length: 100 });
    const fileStart = buffer.toString('hex', 0, 8);
    
    console.log('\n🔬 Сигнатура файла (первые байты):');
    console.log('   • HEX: ' + fileStart);
    
    // Проверяем сигнатуру Excel
    if (fileStart.startsWith('504b0304')) {
        console.log('   ✅ Это ZIP архив (стандартный .xlsx)');
    } else if (fileStart.startsWith('d0cf11e0')) {
        console.log('   ⚠️  Это старый формат .xls (OLE2)');
    } else {
        console.log('   ❌ Неизвестный формат файла');
    }
    
    // 3. Пробуем разные библиотеки
    console.log('\n🔄 Пробуем разные способы чтения:');
    
    try {
        const XLSX = require('xlsx');
        console.log('   📚 Библиотека XLSX загружена');
        
        const workbook = XLSX.readFile(filePath, { 
            type: 'buffer',
            cellFormula: false,
            cellHTML: false,
            cellNF: false,
            cellStyles: false,
            cellText: false,
            bookFiles: false,
            bookProps: false,
            bookSheets: false,
            bookVBA: false,
            password: null,
            sheetStubs: false
        });
        
        console.log('   ✅ Файл прочитан библиотекой XLSX');
        console.log('   📋 Листы: ' + workbook.SheetNames.join(', '));
        
        // Пробуем прочитать каждый лист по-разному
        workbook.SheetNames.forEach(sheetName => {
            console.log('\n   🔍 Лист: "' + sheetName + '"');
            
            try {
                // Способ 1: как массив
                const asArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
                    header: 1, 
                    defval: null,
                    blankrows: true
                });
                console.log('     • Как массив: ' + asArray.length + ' строк');
                
                // Ищем первую непустую строку
                let firstDataRow = null;
                for (let i = 0; i < Math.min(20, asArray.length); i++) {
                    const row = asArray[i];
                    if (row && row.some(cell => cell !== null && cell !== '')) {
                        firstDataRow = i;
                        break;
                    }
                }
                
                if (firstDataRow !== null) {
                    console.log('     • Первые данные в строке: ' + (firstDataRow + 1));
                    console.log('     • Пример данных: ' + JSON.stringify(asArray[firstDataRow]).substring(0, 100) + '...');
                } else {
                    console.log('     • Все строки пустые');
                }
                
            } catch (sheetError) {
                console.log('     ❌ Ошибка чтения листа: ' + sheetError.message);
            }
        });
        
    } catch (xlsxError) {
        console.log('   ❌ Ошибка XLSX: ' + xlsxError.message);
    }
    
    // 4. Пробуем прочитать как ZIP
    console.log('\n📦 Пробуем прочитать как ZIP архив:');
    try {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        
        console.log('   ✅ ZIP архив открыт');
        console.log('   • Файлов в архиве: ' + zipEntries.length);
        
        // Покажем структуру
        zipEntries.slice(0, 10).forEach(entry => {
            console.log('     • ' + entry.entryName + ' (' + entry.header.size + ' байт)');
        });
        
    } catch (zipError) {
        console.log('   ❌ Не ZIP архив: ' + zipError.message);
    }
    
} catch (error) {
    console.error('❌ Ошибка проверки: ' + error.message);
    console.error(error.stack);
}