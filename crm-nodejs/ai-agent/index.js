// Запуск продвинутого ИИ-агента CRM
const CRM_AI_Agent_Advanced = require('./crm-ai-agent-advanced');

async function main() {
    try {
        console.log('🚀 Запуск ИИ-агента CRM с аналитикой...\n');
        
        // Создаем продвинутого агента
        const ai = new CRM_AI_Agent_Advanced();
        
        // Инициализируем
        await ai.init();
        
        console.log('\n✅ ИИ-агент CRM успешно запущен!\n');
        
        // Демонстрация возможностей
        console.log('🎯 ДОСТУПНЫЕ ВОЗМОЖНОСТИ:');
        console.log('📊 • Анализ статистики и трендов');
        console.log('🧮 • Математические расчеты и формулы');
        console.log('📈 • Прогнозирование и анализ данных');
        console.log('📁 • Создание Excel отчетов с графиками');
        console.log('💬 • Интерактивная обработка запросов\n');
        
        // Интерактивный режим
        if (process.argv.includes('--interactive')) {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            console.log('💬 Интерактивный режим. Введите "выход" для завершения.\n');
            console.log('💡 Попробуйте: "статистика", "создай отчет", "рассчитай 10000*1.2^12"\n');
            
            const askQuestion = () => {
                rl.question('Вы: ', async (input) => {
                    if (input.toLowerCase() === 'выход') {
                        rl.close();
                        return;
                    }
                    
                    const result = await ai.process(input);
                    console.log('\n🤖 ИИ: ' + result.response + '\n');
                    
                    askQuestion();
                });
            };
            
            askQuestion();
        } else {
            // Автоматический демо-режим
            console.log('🧪 ТЕСТОВЫЕ КОМАНДЫ (авто-запуск):\n');
            
            // Тест 1: Статистика
            const result1 = await ai.process("статистика");
            console.log('1. 📊 ' + result1.response.substring(0, 200) + '...\n');
            
            // Тест 2: Расчет
            const result2 = await ai.process("рассчитай 50000 * 1.15 ^ 3");
            console.log('2. 🧮 ' + result2.response + '\n');
            
            // Тест 3: Создание отчета
            console.log('3. 📁 Создание Excel отчета...');
            const result3 = await ai.process("создай отчет");
            console.log(result3.response + '\n');
            
            console.log('🎉 Демонстрация завершена!');
            console.log('💡 Для интерактивного режима запустите: node index.js --interactive');
        }
        
    } catch (error) {
        console.error('❌ Ошибка запуска ИИ-агента:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

main();