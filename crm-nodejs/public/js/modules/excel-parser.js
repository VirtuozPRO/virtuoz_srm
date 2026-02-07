       // Отправка через почтовую программу - ИСПРАВЛЕННАЯ ВЕРСИЯ
    sendViaMailClient(email, summary, csvBlob) {
        // Создаем ссылку для скачивания CSV
        const csvUrl = URL.createObjectURL(csvBlob);

        // Формируем тему и тело
        const subject = `Импорт клиентов из Excel - ${new Date().toLocaleDateString('ru-RU')}`;
        const body = this.generateMailtoBody(summary);
        
        // Создаем временную ссылку для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = csvUrl;
        downloadLink.download = `import_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // ========== ПРАВИЛЬНАЯ ОТПРАВКА ЧЕРЕЗ API ==========
        console.log('📤 Отправка отчета через API...');
        
        // Определяем текущего менеджера
        const currentManager = localStorage.getItem('currentManager') || 'Хисматуллин';
        let managerEmail, recipientEmails;
        
        if (currentManager === 'Хитров') {
            managerEmail = 'hky@vertum.su';
            recipientEmails = 'hky@vertum.su, ddn@vertum.su';
        } else {
            managerEmail = 'hrs@vertum.su';
            recipientEmails = 'hrs@vertum.su, ddn@vertum.su';
        }
        
        console.log(`👤 Менеджер: ${currentManager}`);
        console.log(`📧 Адреса: ${recipientEmails}`);
        
        // Отправляем через API
        fetch('/api/send-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                managerEmail: managerEmail,
                subject: subject,
                reportText: body
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                alert(`✅ Отчет успешно отправлен!\n\nПолучатели:\n• ${recipientEmails.replace(', ', '\n• ')}`);
                console.log('📨 Письмо отправлено:', result);
            } else {
                alert('❌ Ошибка отправки: ' + (result.message || result.error || 'Неизвестная ошибка'));
                console.error('Ошибка API:', result);
            }
        })
        .catch(error => {
            console.error('❌ Ошибка сети:', error);
            alert('❌ Ошибка соединения с сервером\n\nПроверьте:\n1. Запущен ли сервер CRM\n2. Настройки почты в .env файле');
        });
    }