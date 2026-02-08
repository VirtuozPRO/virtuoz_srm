// ================================================
// ОТОБРАЖЕНИЕ ТАБЛИЦ ТОРГОВЫХ ПРЕДСТАВИТЕЛЕЙ В NODE.JS
// ================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const XLSX = require('xlsx');

console.log('📊 ОТОБРАЖЕНИЕ ТАБЛИЦ ТП В NODE.JS');
console.log('='.repeat(60));

class TablesDisplay {
    constructor() {
        this.dataDir = path.join(__dirname, '../database');
    }

    // 1. Запуск Python скрипта для создания таблиц
    createTablesWithPython() {
        console.log('🚀 Запуск Python для создания таблиц...');
        
        const pythonScript = `
import pandas as pd
import os
from datetime import datetime

# Читаем данные
file_path = os.path.join(os.path.dirname(__file__), '../database/срм база.xlsx')
df = pd.read_excel(file_path, sheet_name='Лист1', header=0)
df = df.rename(columns={'Торговый представитель.': 'Торговый_представитель'})

# Фильтруем
hitrov_df = df[df['Торговый_представитель'].astype(str).str.contains('Хитров|Кирилл', case=False, na=False)].copy()
hismatullin_df = df[df['Торговый_представитель'].astype(str).str.contains('Хисмат|Рустам', case=False, na=False)].copy()

# Экспорт
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = os.path.join(os.path.dirname(__file__), f'../database/tp_tables_{timestamp}.xlsx')

with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    if len(hitrov_df) > 0:
        hitrov_df.to_excel(writer, sheet_name='Хитров Кирилл', index=False)
    
    if len(hismatullin_df) > 0:
        hismatullin_df.to_excel(writer, sheet_name='Хисматуллин Рустам', index=False)

print(f'Файл создан: {output_file}')
print(f'Хитров: {len(hitrov_df)} клиентов')
print(f'Хисматуллин: {len(hismatullin_df)} клиентов')
`;

        try {
            // Сохраняем Python скрипт
            const pythonPath = path.join(__dirname, 'create_tables.py');
            fs.writeFileSync(pythonPath, pythonScript, 'utf8');
            
            // Запускаем Python
            const result = execSync(`python "${pythonPath}"`, { encoding: 'utf8' });
            console.log('✅ Python скрипт выполнен:');
            console.log(result);
            
            // Удаляем временный файл
            fs.unlinkSync(pythonPath);
            
            return true;
        } catch (error) {
            console.error('❌ Ошибка выполнения Python:', error.message);
            return false;
        }
    }

    // 2. Поиск созданных таблиц
    findTables() {
        console.log('\n🔍 Поиск созданных таблиц...');
        
        const files = fs.readdirSync(this.dataDir)
            .filter(f => f.includes('tp_tables_') && f.endsWith('.xlsx'))
            .sort()
            .reverse(); // Новые файлы первыми
        
        if (files.length === 0) {
            console.log('❌ Таблицы не найдены. Создаю...');
            if (this.createTablesWithPython()) {
                return this.findTables(); // Рекурсивно ищем после создания
            }
            return [];
        }
        
        console.log(`✅ Найдено таблиц: ${files.length}`);
        files.forEach((file, i) => {
            const filePath = path.join(this.dataDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   ${i + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        });
        
        return files;
    }

    // 3. Отображение таблиц в консоли
    displayTables(fileName) {
        const filePath = path.join(this.dataDir, fileName);
        console.log(`\n📖 ЧТЕНИЕ ФАЙЛА: ${fileName}`);
        console.log('─'.repeat(50));
        
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetNames = workbook.SheetNames;
            
            console.log(`📋 Листы в файле: ${sheetNames.join(', ')}`);
            
            sheetNames.forEach(sheetName => {
                console.log(`\n📄 ЛИСТ: "${sheetName}"`);
                console.log('─'.repeat(40));
                
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                console.log(`   • Клиентов: ${data.length}`);
                
                if (data.length > 0) {
                    // Показываем первые 5 строк
                    console.log(`\n   🎯 ПЕРВЫЕ 5 КЛИЕНТОВ:`);
                    
                    data.slice(0, 5).forEach((row, index) => {
                        console.log(`\n   ${index + 1}. КОД: ${row['Код'] || 'Нет'}`);
                        console.log(`      Клиент: ${row['Наименование'] || 'Не указан'}`);
                        console.log(`      Регион: ${row['Бизнес-регион'] || 'Не указан'}`);
                        console.log(`      Товар: ${row['Основная товарная группа'] || 'Не указана'}`);
                        
                        if (row['Адрес']) {
                            console.log(`      Адрес: ${row['Адрес'].substring(0, 50)}...`);
                        }
                    });
                    
                    // Статистика по регионам
                    console.log(`\n   🏙️  СТАТИСТИКА ПО РЕГИОНАМ:`);
                    const regions = {};
                    data.forEach(row => {
                        const region = row['Бизнес-регион'] || 'Не указан';
                        regions[region] = (regions[region] || 0) + 1;
                    });
                    
                    Object.entries(regions)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .forEach(([region, count]) => {
                            console.log(`      • ${region}: ${count} клиентов`);
                        });
                }
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Ошибка чтения файла: ${error.message}`);
            return false;
        }
    }

    // 4. Красивое отображение в виде таблицы
    displayAsTable(fileName, sheetName, limit = 10) {
        const filePath = path.join(this.dataDir, fileName);
        
        try {
            const workbook = XLSX.readFile(filePath);
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            console.log(`\n📊 ТАБЛИЦА: ${sheetName} (${data.length} строк)`);
            console.log('═'.repeat(100));
            
            if (data.length === 0) {
                console.log('   ❌ Нет данных');
                return;
            }
            
            // Определяем ширину колонок
            const columns = [
                { key: 'Код', width: 10, title: 'КОД' },
                { key: 'Наименование', width: 30, title: 'КЛИЕНТ' },
                { key: 'Бизнес-регион', width: 20, title: 'РЕГИОН' },
                { key: 'Основная товарная группа', width: 25, title: 'ТОВАР' },
                { key: 'Адрес', width: 40, title: 'АДРЕС' }
            ];
            
            // Заголовок таблицы
            let header = '';
            columns.forEach(col => {
                header += col.title.padEnd(col.width).substring(0, col.width) + ' │ ';
            });
            
            console.log(header);
            console.log('─'.repeat(header.length));
            
            // Данные
            data.slice(0, limit).forEach(row => {
                let rowStr = '';
                columns.forEach(col => {
                    let value = row[col.key] || '';
                    if (typeof value === 'string') {
                        value = value.substring(0, col.width - 2);
                    }
                    rowStr += String(value).padEnd(col.width).substring(0, col.width) + ' │ ';
                });
                console.log(rowStr);
            });
            
            if (data.length > limit) {
                console.log(`\n... и еще ${data.length - limit} клиентов`);
            }
            
        } catch (error) {
            console.error(`❌ Ошибка: ${error.message}`);
        }
    }

    // 5. Главный метод
    async run() {
        console.log('🎯 ЗАПУСК ОТОБРАЖЕНИЯ ТАБЛИЦ\n');
        
        // Ищем или создаем таблицы
        const tables = this.findTables();
        
        if (tables.length === 0) {
            console.log('❌ Не удалось найти или создать таблицы');
            return;
        }
        
        const latestTable = tables[0];
        
        // Показываем общую информацию
        this.displayTables(latestTable);
        
        // Показываем красивые таблицы
        console.log('\n' + '='.repeat(60));
        console.log('🎨 КРАСИВОЕ ОТОБРАЖЕНИЕ ТАБЛИЦ');
        console.log('='.repeat(60));
        
        // Пробуем показать оба листа
        try {
            const workbook = XLSX.readFile(path.join(this.dataDir, latestTable));
            
            if (workbook.SheetNames.includes('Хитров Кирилл')) {
                this.displayAsTable(latestTable, 'Хитров Кирилл', 8);
            }
            
            if (workbook.SheetNames.includes('Хисматуллин Рустам')) {
                this.displayAsTable(latestTable, 'Хисматуллин Рустам', 8);
            }
            
            // Статистика
            this.showStatistics(latestTable);
            
        } catch (error) {
            console.error('❌ Ошибка отображения:', error.message);
        }
    }

    // 6. Показать статистику
    showStatistics(fileName) {
        const filePath = path.join(this.dataDir, fileName);
        
        try {
            const workbook = XLSX.readFile(filePath);
            let totalClients = 0;
            let hitrovCount = 0;
            let hismatullinCount = 0;
            
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                if (sheetName.includes('Хитров')) {
                    hitrovCount = data.length;
                } else if (sheetName.includes('Хисматуллин')) {
                    hismatullinCount = data.length;
                }
                
                totalClients += data.length;
            });
            
            console.log('\n📈 ИТОГОВАЯ СТАТИСТИКА:');
            console.log('─'.repeat(40));
            console.log(`   👥 Всего клиентов: ${totalClients}`);
            console.log(`   🎯 Хитров Кирилл: ${hitrovCount} (${((hitrovCount/totalClients)*100).toFixed(1)}%)`);
            console.log(`   🎯 Хисматуллин Рустам: ${hismatullinCount} (${((hismatullinCount/totalClients)*100).toFixed(1)}%)`);
            
            if (totalClients > 0) {
                console.log(`\n💡 РЕКОМЕНДАЦИИ:`);
                
                if (hitrovCount > hismatullinCount) {
                    console.log(`   • Хитров обслуживает на ${hitrovCount - hismatullinCount} клиентов больше`);
                } else if (hismatullinCount > hitrovCount) {
                    console.log(`   • Хисматуллин обслуживает на ${hismatullinCount - hitrovCount} клиентов больше`);
                } else {
                    console.log(`   • Равное распределение клиентов`);
                }
            }
            
        } catch (error) {
            console.error('❌ Ошибка статистики:', error.message);
        }
    }
}

// Запуск
const display = new TablesDisplay();
display.run().catch(console.error);