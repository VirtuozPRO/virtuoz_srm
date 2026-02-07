// Минимальный фикс для отправки почты - НЕ ломает интерфейс
(function() {
    'use strict';
    
    console.log('📧 Минимальный mailto фикс загружен');
    
    // Только перехватываем window.open для mailto
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (url && typeof url === 'string' && url.startsWith('mailto:')) {
            console.log('🔄 Перехвачен mailto:', url);
            sendViaApi(url);
            return null; // не открываем окно
        }
        return originalOpen.call(this, url, target, features);
    };
    
    // Функция отправки через API
    async function sendViaApi(mailtoUrl) {
        try {
            const url = new URL(mailtoUrl);
            const params = new URLSearchParams(url.search);
            
            // Получаем текущего менеджера
            const currentManager = localStorage.getItem('currentManager') || 'Хисматуллин';
            const managerEmail = currentManager === 'Хитров' ? 'hky@vertum.su' : 'hrs@vertum.su';
            
            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    managerEmail: managerEmail,
                    subject: params.get('subject') || 'Отчет CRM',
                    reportText: params.get('body') || ''
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Отчет отправлен!');
            } else {
                alert('❌ Ошибка: ' + (result.error || result.message));
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('❌ Ошибка отправки');
        }
    }
    
    // Добавляем обработчик ТОЛЬКО для конкретных кнопок отправки
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            // Ищем кнопки отправки отчета
            document.querySelectorAll('[onclick*="sendReport"], [class*="send-report"]').forEach(button => {
                button.addEventListener('click', function(e) {
                    console.log('Кнопка отправки нажата');
                    // Не блокируем стандартное поведение
                });
            });
        }, 1000);
    });
    
})();
