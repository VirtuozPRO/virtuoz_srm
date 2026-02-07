// Модуль улучшенного поиска для ВЕРТУМ CRM
class SearchEngine {
    constructor(clientsData) {
        this.clientsData = clientsData;
    }

    // Поиск с первой буквы
    searchWithFirstLetter(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.clientsData;
        }

        const term = searchTerm.toLowerCase().trim();
        const results = [];

        this.clientsData.forEach(client => {
            if (this.matchesFirstLetter(client, term)) {
                results.push({
                    client: client,
                    matchType: 'first-letter',
                    matchField: this.getMatchField(client, term)
                });
            } else if (this.matchesPartial(client, term)) {
                results.push({
                    client: client,
                    matchType: 'partial',
                    matchField: this.getMatchField(client, term)
                });
            }
        });

        return results;
    }

    // Проверка совпадения с первой буквы слов
    matchesFirstLetter(client, term) {
        const searchFields = [
            client.code,
            client.name,
            client.address,
            client.phone,
            client.email,
            client.region,
            client.businessType,
            client.productGroup
        ];

        for (const field of searchFields) {
            if (field && typeof field === 'string') {
                const words = field.split(/\s+/);
                for (const word of words) {
                    if (word.toLowerCase().startsWith(term)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Проверка частичного совпадения
    matchesPartial(client, term) {
        const searchFields = [
            client.code,
            client.name,
            client.address,
            client.phone,
            client.email,
            client.region,
            client.businessType,
            client.productGroup
        ];

        for (const field of searchFields) {
            if (field && typeof field === 'string') {
                if (field.toLowerCase().includes(term)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Получение поля, в котором найдено совпадение
    getMatchField(client, term) {
        const searchFields = [
            { key: 'code', value: client.code },
            { key: 'name', value: client.name },
            { key: 'address', value: client.address },
            { key: 'phone', value: client.phone },
            { key: 'email', value: client.email },
            { key: 'region', value: client.region },
            { key: 'businessType', value: client.businessType },
            { key: 'productGroup', value: client.productGroup }
        ];

        for (const field of searchFields) {
            if (field.value && typeof field.value === 'string') {
                const words = field.value.split(/\s+/);
                for (const word of words) {
                    if (word.toLowerCase().startsWith(term)) {
                        return word;
                    }
                }
                
                if (field.value.toLowerCase().includes(term)) {
                    return field.value.substring(0, 50) + (field.value.length > 50 ? '...' : '');
                }
            }
        }
        return '';
    }

    // Генерация HTML для подсказок поиска
    generateSuggestionsHTML(results) {
        if (results.length === 0) {
            return '<div style="padding: 20px; text-align: center; color: #666;">Совпадений не найдено</div>';
        }

        let html = '';
        results.slice(0, 10).forEach(result => {
            const client = result.client;
            html += \`
                <div class="suggestion-item" 
                     onclick="window.selectSuggestion(\${client.id})"
                     style="padding: 10px 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: all 0.2s;">
                    <div style="font-weight: 600; color: var(--dark-text);">
                        \${client.name}
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        Код: \${client.code} • \${client.region}
                    </div>
                    <div style="font-size: 11px; color: #999; margin-top: 3px;">
                        Найдено в: \${result.matchField}
                    </div>
                </div>
            \`;
        });

        if (results.length > 10) {
            html += \`
                <div style="padding: 10px 15px; text-align: center; font-size: 12px; color: var(--primary-color); 
                          font-weight: 600; cursor: pointer; border-top: 1px solid #eee;">
                    Показать все \${results.length} результатов
                </div>
            \`;
        }

        return html;
    }
}
