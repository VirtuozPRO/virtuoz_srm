const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

class AdvancedParser {
    constructor() {
        this.analysis = {
            vertical: {},    // Анализ по столбцам
            horizontal: {},   // Анализ по строкам
            structural: {},   // Структурный анализ
            dataQuality: {}   // Качество данных
        };
    }

    async analyzeFile(filePath) {
        console.log(`\n🔍 АНАЛИЗ ФАЙЛА: ${path.basename(filePath)}`);
        console.log('═'.repeat(60));
        
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetNames = workbook.SheetNames;
            
            console.log(`📊 Листов в файле: ${sheetNames.length}`);
            
            for (const sheetName of sheetNames) {
                console.log(`\n📄 ЛИСТ: "${sheetName}"`);
                console.log('─'.repeat(40));
                
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                if (jsonData.length === 0) {
                    console.log('   ❌ Пустой лист');
                    continue;
                }
                
                // ВЕРТИКАЛЬНЫЙ АНАЛИЗ (по столбцам)
                console.log('\n   📊 ВЕРТИКАЛЬНЫЙ АНАЛИЗ (столбцы):');
                const columns = Object.keys(jsonData[0]);
                console.log(`   • Всего столбцов: ${columns.length}`);
                
                columns.forEach((col, index) => {
                    const columnData = jsonData.map(row => row[col]);
                    const nonEmpty = columnData.filter(v => v !== '' && v !== null && v !== undefined);
                    const emptyCount = columnData.length - nonEmpty.length;
                    
                    console.log(`   ${index + 1}. "${col}":`);
                    console.log(`     Заполнено: ${nonEmpty.length}/${columnData.length} (${Math.round((nonEmpty.length/columnData.length)*100)}%)`);
                    
                    // Определяем тип данных
                    const types = this.analyzeColumnTypes(nonEmpty);
                    console.log(`     Типы данных: ${Object.entries(types).map(([t, c]) => \`\${t}:\${c}\`).join(', ')}`);
                    
                    // Уникальные значения
                    const uniqueValues = [...new Set(nonEmpty.map(v => String(v).substring(0, 30)))];
                    console.log(`     Уникальных значений: ${uniqueValues.length}`);
                    if (uniqueValues.length <= 5 && uniqueValues.length > 0) {
                        console.log(`     Примеры: ${uniqueValues.join(', ')}`);
                    }
                });
                
                // ГОРИЗОНТАЛЬНЫЙ АНАЛИЗ (по строкам)
                console.log('\n   📈 ГОРИЗОНТАЛЬНЫЙ АНАЛИЗ (строки):');
                console.log(`   • Всего строк: ${jsonData.length}`);
                
                // Анализ заполненности строк
                const rowCompleteness = jsonData.map((row, index) => {
                    const filledCells = Object.values(row).filter(v => v !== '' && v !== null && v !== undefined).length;
                    const totalCells = Object.keys(row).length;
                    return {
                        row: index + 2, // +2 потому что Excel строки с 1, а заголовок строка 1
                        filled: filledCells,
                        total: totalCells,
                        percentage: Math.round((filledCells / totalCells) * 100)
                    };
                });
                
                const avgCompleteness = rowCompleteness.reduce((sum, r) => sum + r.percentage, 0) / rowCompleteness.length;
                console.log(`   • Средняя заполненность строк: ${avgCompleteness.toFixed(1)}%`);
                
                // Находим проблемные строки
                const problematicRows = rowCompleteness.filter(r => r.percentage < 50);
                if (problematicRows.length > 0) {
                    console.log(`   • Проблемных строк (<50% заполнения): ${problematicRows.length}`);
                    console.log(`     Строки: ${problematicRows.slice(0, 5).map(r => r.row).join(', ')}${problematicRows.length > 5 ? '...' : ''}`);
                }
                
                // СТРУКТУРНЫЙ АНАЛИЗ
                console.log('\n   🏗️  СТРУКТУРНЫЙ АНАЛИЗ:');
                
                // Ищем ключевые столбцы
                const keyColumns = this.findKeyColumns(columns, jsonData);
                console.log(`   • Ключевые столбцы: ${keyColumns.map(c => \`"\${c}"\`).join(', ')}`);
                
                // Анализ связей
                this.analyzeRelationships(jsonData, columns);
                
                // КАЧЕСТВО ДАННЫХ
                console.log('\n   🎯 КАЧЕСТВО ДАННЫХ:');
                
                // Проверка дубликатов
                const duplicates = this.findDuplicates(jsonData, keyColumns);
                if (duplicates.length > 0) {
                    console.log(`   • Найдено дубликатов: ${duplicates.length}`);
                }
                
                // Проверка консистентности
                const consistencyIssues = this.checkConsistency(jsonData);
                if (consistencyIssues.length > 0) {
                    console.log(`   • Проблемы консистентности: ${consistencyIssues.length}`);
                }
                
                // АНАЛИЗ ТОРГОВЫХ ПРЕДСТАВИТЕЛЕЙ (специально для CRM)
                console.log('\n   👥 АНАЛИЗ ТОРГОВЫХ ПРЕДСТАВИТЕЛЕЙ:');
                const tpColumns = columns.filter(col => 
                    col.toLowerCase().includes('торг') || 
                    col.toLowerCase().includes('представ') ||
                    col.toLowerCase().includes('менедж') ||
                    col.toLowerCase().includes('ответств')
                );
                
                if (tpColumns.length > 0) {
                    console.log(`   • Столбцы с ТП: ${tpColumns.map(c => \`"\${c}"\`).join(', ')}`);
                    
                    tpColumns.forEach(tpCol => {
                        const tpData = jsonData.map(row => row[tpCol]).filter(v => v);
                        const uniqueTP = [...new Set(tpData)];
                        console.log(`   • В столбце "\${tpCol}":`);
                        console.log(`     Всего записей: ${tpData.length}`);
                        console.log(`     Уникальных ТП: ${uniqueTP.length}`);
                        
                        uniqueTP.forEach(tp => {
                            const count = tpData.filter(v => v === tp).length;
                            console.log(`       - \${tp}: \${count} клиентов`);
                        });
                    });
                } else {
                    console.log(`   • Столбцы с торговыми представителями не найдены`);
                    console.log(`   • Ищу похожие столбцы...`);
                    
                    // Ищем по содержимому
                    columns.forEach(col => {
                        const sampleValues = jsonData.slice(0, 10).map(row => String(row[col] || '')).filter(v => v);
                        const mightBeTP = sampleValues.some(v => 
                            v.includes('Хитров') || 
                            v.includes('Хисмат') ||
                            v.includes('Иванов') ||
                            v.includes('Петров')
                        );
                        
                        if (mightBeTP) {
                            console.log(`   • Возможный столбец ТП: "\${col}" (содержит имена)`);
                        }
                    });
                }
                
                // ВЫВОДЫ
                console.log('\n   💡 ВЫВОДЫ:');
                
                // Рекомендации по улучшению
                const recommendations = [];
                
                if (avgCompleteness < 80) {
                    recommendations.push('Увеличить заполняемость данных');
                }
                
                if (problematicRows.length > jsonData.length * 0.1) {
                    recommendations.push('Проверить проблемные строки');
                }
                
                if (tpColumns.length === 0) {
                    recommendations.push('Добавить столбец "Торговый представитель"');
                }
                
                if (recommendations.length > 0) {
                    console.log(`   • Рекомендации:`);
                    recommendations.forEach((rec, i) => {
                        console.log(`     ${i + 1}. ${rec}`);
                    });
                } else {
                    console.log(`   • Данные в хорошем состоянии`);
                }
            }
            
            return this.analysis;
            
        } catch (error) {
            console.log(`   ❌ Ошибка анализа: ${error.message}`);
            throw error;
        }
    }

    // Анализ типов данных в столбце
    analyzeColumnTypes(values) {
        const types = {
            string: 0,
            number: 0,
            date: 0,
            boolean: 0,
            empty: 0
        };
        
        values.forEach(value => {
            if (value === '' || value === null || value === undefined) {
                types.empty++;
            } else if (typeof value === 'number') {
                types.number++;
            } else if (typeof value === 'boolean') {
                types.boolean++;
            } else if (!isNaN(Date.parse(value))) {
                types.date++;
            } else {
                types.string++;
            }
        });
        
        // Удаляем пустые типы
        Object.keys(types).forEach(key => {
            if (types[key] === 0) delete types[key];
        });
        
        return types;
    }

    // Поиск ключевых столбцов
    findKeyColumns(columns, data) {
        const keyColumns = [];
        
        columns.forEach(col => {
            const values = data.map(row => row[col]).filter(v => v !== '' && v !== null && v !== undefined);
            const uniqueValues = [...new Set(values.map(v => String(v)))];
            
            // Столбец потенциально ключевой если:
            // 1. Мало пустых значений
            // 2. Много уникальных значений
            // 3. Имя столбца указывает на уникальность
            const completeness = values.length / data.length;
            const uniqueness = uniqueValues.length / values.length;
            
            const isKeyColumn = 
                completeness > 0.9 && 
                uniqueness > 0.8 &&
                (col.toLowerCase().includes('id') || 
                 col.toLowerCase().includes('код') ||
                 col.toLowerCase().includes('номер') ||
                 col.toLowerCase().includes('name') ||
                 col.toLowerCase().includes('назван'));
            
            if (isKeyColumn) {
                keyColumns.push(col);
            }
        });
        
        return keyColumns;
    }

    // Анализ связей между столбцами
    analyzeRelationships(data, columns) {
        if (columns.length < 2) return;
        
        // Простой анализ корреляций
        console.log(`   • Анализ связей (первые 100 строк):`);
        
        const sampleData = data.slice(0, Math.min(100, data.length));
        
        // Ищем пары столбцов, которые часто заполнены вместе
        const columnPairs = [];
        
        for (let i = 0; i < columns.length; i++) {
            for (let j = i + 1; j < columns.length; j++) {
                const col1 = columns[i];
                const col2 = columns[j];
                
                const bothFilled = sampleData.filter(row => 
                    row[col1] && row[col2]
                ).length;
                
                const correlation = bothFilled / sampleData.length;
                
                if (correlation > 0.7) {
                    columnPairs.push({
                        columns: [col1, col2],
                        correlation: Math.round(correlation * 100)
                    });
                }
            }
        }
        
        if (columnPairs.length > 0) {
            columnPairs.slice(0, 3).forEach(pair => {
                console.log(`     - "\${pair.columns[0]}" и "\${pair.columns[1]}": \${pair.correlation}% связаны`);
            });
        }
    }

    // Поиск дубликатов
    findDuplicates(data, keyColumns) {
        if (keyColumns.length === 0) return [];
        
        const duplicates = [];
        const seen = new Map();
        
        data.forEach((row, index) => {
            const key = keyColumns.map(col => row[col]).join('|');
            if (seen.has(key)) {
                duplicates.push({
                    row: index + 2,
                    duplicateOf: seen.get(key),
                    key: key
                });
            } else {
                seen.set(key, index + 2);
            }
        });
        
        return duplicates;
    }

    // Проверка консистентности
    checkConsistency(data) {
        const issues = [];
        
        // Проверка форматов дат
        const dateColumns = Object.keys(data[0] || {}).filter(col => 
            col.toLowerCase().includes('дата') || 
            col.toLowerCase().includes('date')
        );
        
        dateColumns.forEach(col => {
            const invalidDates = data.filter(row => {
                const val = row[col];
                return val && val !== '' && isNaN(Date.parse(val));
            });
            
            if (invalidDates.length > 0) {
                issues.push({
                    column: col,
                    issue: 'Некорректные даты',
                    count: invalidDates.length
                });
            }
        });
        
        return issues;
    }
}

module.exports = AdvancedParser;