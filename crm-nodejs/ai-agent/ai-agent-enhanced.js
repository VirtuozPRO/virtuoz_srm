const CRM_AI_Agent = require('./crm-ai-agent');
const nodemailer = require('nodemailer');

class CRM_AI_Agent_Enhanced extends CRM_AI_Agent {
    constructor() {
        super();
        this.emailTransporter = null;
        this.templates = {};
    }

    async initEmail() {
        console.log('📧 Настройка email системы...');
        
        try {
            // Проверяем переменные окружения
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                console.log('⚠️ Email переменные не настроены. Используйте .env файл.');
                return;
            }
            
            this.emailTransporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.yandex.ru',
                port: parseInt(process.env.EMAIL_PORT) || 465,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await this.emailTransporter.verify();
            console.log('✅ Email система готова к отправке');
            
        } catch (error) {
            console.error('❌ Ошибка настройки email:', error.message);
            this.emailTransporter = null;
        }
    }

    async sendEmail(options) {
        if (!this.emailTransporter) {
            throw new Error('Email система не настроена');
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject || 'Сообщение от CRM ИИ-агента',
            text: options.text || '',
            html: options.html || options.text,
            attachments: options.attachments || []
        };

        console.log('📨 Отправка email на ' + options.to);
        
        try {
            const info = await this.emailTransporter.sendMail(mailOptions);
            console.log('✅ Email отправлен:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Ошибка отправки email:', error);
            throw error;
        }
    }

    async sendReport(toEmail, reportData = {}) {
        const reportText = '# Отчет CRM\n' +
                          'Сгенерировано: ' + new Date().toLocaleString() + '\n\n' +
                          '## Статистика\n' +
                          '- Клиентов: ' + this.knowledge.clients.length + '\n' +
                          '- Продуктов: ' + this.knowledge.products.length + '\n\n' +
                          '## Последние действия\n' +
                          (reportData.actions || 'Нет данных') + '\n\n' +
                          '---\n' +
                          'Сгенерировано ИИ-ассистентом CRM';

        return await this.sendEmail({
            to: toEmail,
            subject: '📊 Отчет CRM от ИИ-ассистента',
            text: reportText
        });
    }

    // Расширенная обработка запросов
    async processEnhanced(query) {
        const baseResult = await super.process(query);
        const q = query.toLowerCase();
        
        // Добавляем специфичную логику
        if (q.includes('отправь отчет') || q.includes('отправить отчет')) {
            const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch && this.emailTransporter) {
                try {
                    const email = emailMatch[0];
                    await this.sendReport(email);
                    baseResult.response += '\n✅ Отчет отправлен на ' + email;
                } catch (error) {
                    baseResult.response += '\n❌ Ошибка отправки: ' + error.message;
                }
            } else if (!this.emailTransporter) {
                baseResult.response += '\n⚠️ Email система не настроена';
            } else {
                baseResult.response += '\n⚠️ Укажите email для отправки отчета';
            }
        }
        
        return baseResult;
    }
}

module.exports = CRM_AI_Agent_Enhanced;