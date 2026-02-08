// Диагностический скрипт для анализа данных
const AdvancedParser = require('./advanced-parser');
const fs = require('fs').promises;
const path = require('path');

async function runDiagnostics() {
    console.log('🔍 ЗАПУСК ПОЛНОЙ ДИАГНОСТИКИ ДАННЫХ');
    console.log('═'.repeat(60));
    
    const parser = new AdvancedParser();
    const dataDir = path.join(__dirname, '../database');
    
    try {
        // 1. Проверяем директорию
        console.log('\n📁 ПРОВЕРКА ДИРЕКТОРИИ ДАННЫХ:');
        const files = await fs.readdir(dataDir);
        console.log(`   • Директория: ${dataDir}`);
        console.log(`   • Всего файлов: ${files.length}`);
        
        // Группируем файлы по типам
        const excelFiles = files.filter(f => f.match(/\.xlsx?$/i));
        const jsonFiles = files.filter(f => f.match(/\.json$/i));
        const csvFiles = files.filter(f => f.match(/\.csv$/i));
        
        console.log(`   • Excel файлы: ${excelFiles.length}`);
        console.log(`   • JSON файлы: ${jsonFiles.length}`);
        console.log(`   • CSV файлы: ${csvFiles.length}`);
        
        // 2. Анализируем каждый Excel файл
        console.log('\n📊 АНАЛИЗ EXCEL ФАЙЛОВ:');
        
        if (excelFiles.length === 0) {
            console.log('   ❌ Excel файлы не найдены!');
            console.log('   💡 Поместите .xlsx файлы в папку database/');
        } else {
            for (const fileName of excelFiles) {
                const filePath = path.join(dataDir, fileName);
                await parser.analyzeFile(filePath);
            }
        }
        
        // 3. Проверяем JSON файлы
        console.log('\n📋 ПРОВЕРКА JSON ФАЙЛОВ:');
        
        for (const fileName of jsonFiles) {
            const filePath = path.join(dataDir, fileName);
            console.log(`\n   📄 Файл: ${fileName}`);
            
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(content);
                console.log(`   ✅ Валидный JSON`);
                console.log(`   • Тип данных: ${Array.isArray(data) ? 'Массив' : 'Объект'}`);
                
                if (Array.isArray(data)) {
                    console.log(`   • Элементов: ${data.length}`);
                    if (data.length > 0) {
                        console.log(`   • Ключи первого элемента: ${Object.keys(data[0]).join(', ')}`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Ошибка JSON: ${error.message}`);
                
                // Показываем проблемное место
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.split('\n');
                console.log(`   • Всего строк: ${lines.length}`);
                
                // Находим первую проблемную строку
                for (let i = 0; i < Math.min(10, lines.length); i++) {
                    if (lines[i].trim()) {
                        console.log(`   • Строка ${i + 1}: ${lines[i].substring(0, 50)}...`);
                    }
                }
            }
        }
        
        // 4. Рекомендации
        console.log('\n💡 РЕКОМЕНДАЦИИ ПО ДАННЫМ:');
        console.log('─'.repeat(40));
        
        if (excelFiles.length === 0) {
            console.log('1. 📥 Добавьте Excel файлы с данными о клиентах');
            console.log('   • Формат: .xlsx или .xls');
            console.log('   • Столбцы должны включать: Клиент, Торговый представитель, Сумма, Дата');
        }
        
        if (jsonFiles.length === 0) {
            console.log('2. 📝 Создайте JSON файлы для хранения структурированных данных');
            console.log('   • clients.json - данные о клиентах');
            console.log('   • products.json - данные о продуктах');
        }
        
        console.log('\3. 🏷️  Используйте единые названия столбцов:');
        console.log('   • "Торговый_представитель" или "Менеджер"');
        console.log('   • "Клиент" или "Компания"');
        console.log('   • "Сумма_продаж" или "Выручка"');
        
        console.log('\n✅ Диагностика завершена!');
        
    } catch (error) {
        console.error('❌ Ошибка диагностики:', error.message);
    }
}

// Запускаем диагностику
runDiagnostics();