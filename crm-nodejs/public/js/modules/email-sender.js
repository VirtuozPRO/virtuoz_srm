// Модуль отправки email отчетов для ВЕРТУМ CRM
class EmailSender {
    constructor() {
        this.currentManager = localStorage.getItem('currentManager') || 'Хисматуллин';
    }

    // Определение email адресов по менеджеру
    getEmailAddresses() {
        let managerEmail, recipientEmails;

        if (this.currentManager === 'Хитров') {
            managerEmail = 'hky@vertum.su';
            recipientEmails = 'hky@vertum.su, ddn@vertum.su';
        } else {
            managerEmail = 'hrs@vertum.su';
            recipientEmails = 'hrs@vertum.su, ddn@vertum.su';
        }

        return { managerEmail, recipientEmails };
    }

    // Генерация тела письма
    generateMailtoBody(summary) {
        const today = new Date().toLocaleDateString('ru-RU');
        const time = new Date().toLocaleTimeString('ru-RU');
        
        let body = `ОТЧЕТ ВЕРТУМ CRM\n`;
        body += `Дата: ${today} ${time}\n`;
        body += `Менеджер: ${this.currentManager}\n\n`;
        body += `РЕЗУЛЬТАТЫ ИМПОРТА:\n`;
        body += `• Всего записей: ${summary.totalRecords || 0}\n`;
        body += `• Успешно: ${summary.successful || 0}\n`;
        body += `• С ошибками: ${summary.errors || 0}\n`;
        body += `• Новых клиентов: ${summary.newClients || 0}\n`;
        body += `• Обновленных: ${summary.updated || 0}\n\n`;
        
        if (summary.errorDetails && summary.errorDetails.length > 0) {
            body += `ДЕТАЛИ ОШИБОК:\n`;
            summary.errorDetails.forEach((error, index) => {
                body += `${index + 1}. ${error}\n`;
            });
            body += `\n`;
        }
        
        body += `---\nСгенерировано автоматически в ВЕРТУМ CRM`;
        return body;
    }

    // Отправка отчета через API
    sendViaMailClient(email, summary, csvBlob) {
        // Создаем ссылку для скачивания CSV
        const csvUrl = URL.createObjectURL(csvBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = csvUrl;
        downloadLink.download = `import_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Определяем email адреса
        const { managerEmail, recipientEmails } = this.getEmailAddresses();
        
        // Формируем тему и тело
        const subject = `Импорт клиентов из Excel - ${new Date().toLocaleDateString('ru-RU')}`;
        const body = this.generateMailtoBody(summary);
        
        console.log('📤 Отправка отчета через API...');
        console.log(`👤 Менеджер: ${this.currentManager}`);
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

    // Отправка отчета менеджеру
    sendManagerReport(subject, reportText) {
        const { managerEmail, recipientEmails } = this.getEmailAddresses();
        
        return fetch('/api/send-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                managerEmail: managerEmail,
                subject: subject,
                reportText: reportText
            })
        });
    }

    // Отправка отчета конкретному клиенту
    sendClientReport(clientEmail, subject, reportText) {
        return fetch('/api/send-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                managerEmail: this.getEmailAddresses().managerEmail,
                subject: subject,
                reportText: reportText,
                to: clientEmail
            })
        });
    }
}
