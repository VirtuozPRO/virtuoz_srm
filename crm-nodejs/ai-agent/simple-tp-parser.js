const XLSX = require('xlsx');
const path = require('path');

class SimpleTPParser {
    async parseFile(filePath) {
        console.log('📊 Анализ файла: ' + path.basename(filePath));
        
        try {
            // Читаем Excel файл
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            console.log('✅ Файл прочитан успешно!');
            console.log('📈 Статистика:');
            console.log('   • Всего строк: ' + data.length);
            console.log('   • Лист: "' + sheetName + '"');
            
            // Находим столбцы
            const columns = Object.keys(data[0] || {});
            console.log('   • Столбцов: ' + columns.length);
            
            // Ищем столбец с ТП
            let tpColumn = null;
            for (const col of columns) {
                if (col.toLowerCase().includes('торг') || col.toLowerCase().includes('представ')) {
                    tpColumn = col;
                    break;
                }
            }
            
            if (tpColumn) {
                console.log('   • Столбец ТП найден: "' + tpColumn + '"');
                
                // Анализируем данные ТП
                const tpCounts = {};
                data.forEach(row => {
                    const tp = row[tpColumn] || 'Не указан';
                    tpCounts[tp] = (tpCounts[tp] || 0) + 1;
                });
                
                console.log('\n👥 Распределение по ТП:');
                Object.entries(tpCounts)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([tp, count]) => {
                        console.log('   • ' + tp + ': ' + count + ' клиентов');
                    });
                    
                // Ищем Хитрова и Хисматуллина
                const hitrov = Object.entries(tpCounts).find(([tp]) => 
                    tp.toLowerCase().includes('хитров') || tp.toLowerCase().includes('кирилл')
                );
                
                const hismatullin = Object.entries(tpCounts).find(([tp]) => 
                    tp.toLowerCase().includes('хисмат') || tp.toLowerCase().includes('рустам')
                );
                
                console.log('\n🎯 Целевые ТП:');
                if (hitrov) {
                    console.log('   • Хитров: ' + hitrov[1] + ' клиентов');
                }
                if (hismatullin) {
                    console.log('   • Хисматуллин: ' + hismatullin[1] + ' клиентов');
                }
                
            } else {
                console.log('❌ Столбец с торговыми представителями не найден');
                console.log('Доступные столбцы:');
                columns.forEach((col, i) => {
                    console.log('   ' + (i + 1) + '. ' + col);
                });
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Ошибка парсинга:', error.message);
            return null;
        }
    }
}

// Если файл запускается напрямую
if (require.main === module) {
    const parser = new SimpleTPParser();
    
    // Путь к файлу
    const filePath = path.join(__dirname, '../database/срм база.xlsx');
    
    console.log('🚀 Запуск парсера торговых представителей');
    console.log('='.repeat(50));
    
    parser.parseFile(filePath).then(data => {
        if (data) {
            console.log('\n✅ Парсинг завершен успешно!');
        }
    });
}

module.exports = SimpleTPParser;