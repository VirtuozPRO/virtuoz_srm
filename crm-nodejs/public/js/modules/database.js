// ============================================
// DATABASE.JS - Р¦РµРЅС‚СЂР°Р»РёР·РѕРІР°РЅРЅРѕРµ С…СЂР°РЅРµРЅРёРµ РґР°РЅРЅС‹С…
// ============================================

// Р“Р»РѕР±Р°Р»СЊРЅС‹Р№ РѕР±СЉРµРєС‚ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ РґР°РЅРЅС‹С…
const VERTUM_DB = {
    // РўРµРєСѓС‰РёР№ РјРµРЅРµРґР¶РµСЂ
    currentManager: null,
    
    // Р’СЃРµ РґР°РЅРЅС‹Рµ
    data: {
        clients: [],
        visits: [],
        products: [],
        calendarEvents: [],
        sales: {},
        calls: [],
        filters: {}
    },
    
    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ
    init: function() {
        console.log('рџљЂ РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ Р±Р°Р·С‹ РґР°РЅРЅС‹С… Р’Р•Р РўРЈРњ CRM...');
        
        // Р—Р°РіСЂСѓР¶Р°РµРј РєРѕРЅС„РёРіСѓСЂР°С†РёСЋ
        this.loadConfig();
        
        // Р—Р°РіСЂСѓР¶Р°РµРј РґР°РЅРЅС‹Рµ РёР· LocalStorage
        this.loadFromStorage();
        
        // РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј РјРµРЅРµРґР¶РµСЂР° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        this.initManager();
        
        console.log('вњ… Р‘Р°Р·Р° РґР°РЅРЅС‹С… РіРѕС‚РѕРІР°');
        return this;
    },
    
    // Р—Р°РіСЂСѓР·РєР° РєРѕРЅС„РёРіСѓСЂР°С†РёРё
    loadConfig: function() {
        if (window.VERTUM_CONFIG) {
            this.config = window.VERTUM_CONFIG;
            console.log('рџ“‹ РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ Р·Р°РіСЂСѓР¶РµРЅР°');
        } else {
            console.warn('вљ пёЏ РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ РЅРµ РЅР°Р№РґРµРЅР°, РёСЃРїРѕР»СЊР·СѓРµРј РЅР°СЃС‚СЂРѕР№РєРё РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ');
            this.config = {
                managers: {
                    'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ': {
                        name: 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р СѓСЃС‚Р°Рј РЁР°С„РєР°С‚РѕРІРёС‡',
                        email: 'hrs@vertum.su',
                        phone: '+7 (985) 710-21-27',
                        short: 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
                    }
                }
            };
        }
    },
    
    // Р—Р°РіСЂСѓР·РєР° РёР· LocalStorage
    loadFromStorage: function() {
        // РљР»РёРµРЅС‚С‹
        this.data.clients = JSON.parse(localStorage.getItem('vertum_clients') || '[]');
        
        // Р’РёР·РёС‚С‹
        this.data.visits = JSON.parse(localStorage.getItem('vertum_visits') || '[]');
        
        // РљР°Р»РµРЅРґР°СЂСЊ
        this.data.calendarEvents = JSON.parse(localStorage.getItem('vertum_calendar') || '[]');
        
        // РџСЂРѕРґР°Р¶Рё
        this.data.sales = JSON.parse(localStorage.getItem('vertum_sales') || '{}');
        
        // Р—РІРѕРЅРєРё
        this.data.calls = JSON.parse(localStorage.getItem('vertum_calls') || '[]');
        
        // Р¤РёР»СЊС‚СЂС‹
        this.data.filters = JSON.parse(localStorage.getItem('vertum_filters') || '{}');
        
        console.log(`рџ“Љ Р—Р°РіСЂСѓР¶РµРЅРѕ: ${this.data.clients.length} РєР»РёРµРЅС‚РѕРІ, ${this.data.visits.length} РІРёР·РёС‚РѕРІ`);
    },
    
    // РЎРѕС…СЂР°РЅРµРЅРёРµ РІ LocalStorage
    saveToStorage: function() {
        localStorage.setItem('vertum_clients', JSON.stringify(this.data.clients));
        localStorage.setItem('vertum_visits', JSON.stringify(this.data.visits));
        localStorage.setItem('vertum_calendar', JSON.stringify(this.data.calendarEvents));
        localStorage.setItem('vertum_sales', JSON.stringify(this.data.sales));
        localStorage.setItem('vertum_calls', JSON.stringify(this.data.calls));
        localStorage.setItem('vertum_filters', JSON.stringify(this.data.filters));
        
        console.log('рџ’ѕ Р”Р°РЅРЅС‹Рµ СЃРѕС…СЂР°РЅРµРЅС‹');
    },
    
    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РјРµРЅРµРґР¶РµСЂР°
    initManager: function() {
        const savedManager = localStorage.getItem('vertum_current_manager') || 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ';
        this.setCurrentManager(savedManager);
    },
    
    // РЈСЃС‚Р°РЅРѕРІРєР° С‚РµРєСѓС‰РµРіРѕ РјРµРЅРµРґР¶РµСЂР°
    setCurrentManager: function(managerKey) {
        const manager = this.config.managers[managerKey];
        if (manager) {
            this.currentManager = manager;
            localStorage.setItem('vertum_current_manager', managerKey);
            console.log(`рџ‘¤ РњРµРЅРµРґР¶РµСЂ СѓСЃС‚Р°РЅРѕРІР»РµРЅ: ${manager.name}`);
            
            // РўСЂРёРіРіРµСЂРёРј СЃРѕР±С‹С‚РёРµ СЃРјРµРЅС‹ РјРµРЅРµРґР¶РµСЂР°
            this.triggerEvent('managerChanged', manager);
            return manager;
        }
        return null;
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ С‚РµРєСѓС‰РµРіРѕ РјРµРЅРµРґР¶РµСЂР°
    getCurrentManager: function() {
        return this.currentManager;
    },
    
    // ========== РљР›РР•РќРўР« ==========
    
    // РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РєР»РёРµРЅС‚РѕРІ
    getAllClients: function() {
        return this.data.clients;
    },
    
    // РџРѕРёСЃРє РєР»РёРµРЅС‚Р° РїРѕ РєРѕРґСѓ
    findClientByCode: function(code) {
        return this.data.clients.find(client => client['РљРѕРґ'] === code.toString());
    },
    
    // Р”РѕР±Р°РІР»РµРЅРёРµ РєР»РёРµРЅС‚Р°
    addClient: function(clientData) {
        const newClient = {
            ...clientData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            manager: this.currentManager.short,
            status: clientData.status || 'РќРѕРІС‹Р№'
        };
        
        this.data.clients.push(newClient);
        this.saveToStorage();
        
        console.log(`вћ• Р”РѕР±Р°РІР»РµРЅ РєР»РёРµРЅС‚: ${newClient['РќР°РёРјРµРЅРѕРІР°РЅРёРµ']} (${newClient['РљРѕРґ']})`);
        this.triggerEvent('clientAdded', newClient);
        
        return newClient;
    },
    
    // РћР±РЅРѕРІР»РµРЅРёРµ РєР»РёРµРЅС‚Р°
    updateClient: function(clientId, updates) {
        const index = this.data.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.data.clients[index] = { ...this.data.clients[index], ...updates };
            this.saveToStorage();
            
            console.log(`вњЏпёЏ РћР±РЅРѕРІР»РµРЅ РєР»РёРµРЅС‚ ID: ${clientId}`);
            this.triggerEvent('clientUpdated', this.data.clients[index]);
            
            return true;
        }
        return false;
    },
    
    // ========== Р’РР—РРўР« ==========
    
    // РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РІРёР·РёС‚РѕРІ
    getAllVisits: function() {
        return this.data.visits;
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ РІРёР·РёС‚РѕРІ РїРѕ РґР°С‚Рµ
    getVisitsByDate: function(date) {
        return this.data.visits.filter(v => v.date === date);
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ РІРёР·РёС‚РѕРІ РїРѕ РєР»РёРµРЅС‚Сѓ
    getVisitsByClient: function(clientCode) {
        return this.data.visits.filter(v => v.clientCode === clientCode);
    },
    
    // Р”РѕР±Р°РІР»РµРЅРёРµ РІРёР·РёС‚Р°
    addVisit: function(visitData) {
        const newVisit = {
            ...visitData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            manager: this.currentManager.short,
            status: 'completed'
        };
        
        this.data.visits.push(newVisit);
        this.saveToStorage();
        
        console.log(`вћ• Р”РѕР±Р°РІР»РµРЅ РІРёР·РёС‚: ${visitData.clientName}`);
        this.triggerEvent('visitAdded', newVisit);
        
        return newVisit;
    },
    
    // ========== РљРђР›Р•РќР”РђР Р¬ ==========
    
    // РџРѕР»СѓС‡РµРЅРёРµ СЃРѕР±С‹С‚РёР№ РєР°Р»РµРЅРґР°СЂСЏ
    getCalendarEvents: function(startDate = null, endDate = null) {
        let events = this.data.calendarEvents;
        
        if (startDate && endDate) {
            events = events.filter(e => e.date >= startDate && e.date <= endDate);
        }
        
        return events;
    },
    
    // Р”РѕР±Р°РІР»РµРЅРёРµ СЃРѕР±С‹С‚РёСЏ
    addCalendarEvent: function(eventData) {
        const newEvent = {
            ...eventData,
            id: Date.now(),
            manager: this.currentManager.short
        };
        
        this.data.calendarEvents.push(newEvent);
        this.saveToStorage();
        
        console.log(`вћ• Р”РѕР±Р°РІР»РµРЅРѕ СЃРѕР±С‹С‚РёРµ: ${eventData.title}`);
        this.triggerEvent('calendarEventAdded', newEvent);
        
        return newEvent;
    },
    
    // ========== Р¤РР›Р¬РўР Р« ==========
    
    // РЎРѕС…СЂР°РЅРµРЅРёРµ С„РёР»СЊС‚СЂРѕРІ
    saveFilters: function(filters) {
        this.data.filters = filters;
        this.saveToStorage();
        this.triggerEvent('filtersSaved', filters);
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ С„РёР»СЊС‚СЂРѕРІ
    getFilters: function() {
        return this.data.filters;
    },
    
    // ========== РЎРРќРҐР РћРќРР—РђР¦РРЇ ==========
    
    // Р­РєСЃРїРѕСЂС‚ РІСЃРµС… РґР°РЅРЅС‹С…
    exportData: function(format = 'json') {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            manager: this.currentManager,
            data: this.data
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            // РљРѕРЅРІРµСЂС‚Р°С†РёСЏ РєР»РёРµРЅС‚РѕРІ РІ CSV
            if (this.data.clients.length === 0) return '';
            
            const headers = Object.keys(this.data.clients[0]);
            const rows = this.data.clients.map(client => 
                headers.map(header => 
                    `"${String(client[header] || '').replace(/"/g, '""')}"`
                ).join(';')
            );
            
            return [headers.join(';'), ...rows].join('\n');
        }
    },
    
    // РРјРїРѕСЂС‚ РґР°РЅРЅС‹С…
    importData: function(data, type = 'json') {
        try {
            if (type === 'json') {
                const parsed = JSON.parse(data);
                
                if (parsed.data) {
                    // РРјРїРѕСЂС‚РёСЂСѓРµРј С‚РѕР»СЊРєРѕ РµСЃР»Рё РІРµСЂСЃРёСЏ СЃРѕРІРїР°РґР°РµС‚
                    if (parsed.version === '1.0') {
                        this.data = { ...this.data, ...parsed.data };
                        this.saveToStorage();
                        console.log('рџ“Ґ Р”Р°РЅРЅС‹Рµ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅС‹');
                        this.triggerEvent('dataImported', parsed.data);
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('вќЊ РћС€РёР±РєР° РёРјРїРѕСЂС‚Р°:', error);
        }
        return false;
    },
    
    // ========== РЎРћР‘Р«РўРРЇ ==========
    
    // РЎРёСЃС‚РµРјР° СЃРѕР±С‹С‚РёР№ РґР»СЏ СЃРІСЏР·Рё РјРµР¶РґСѓ РјРѕРґСѓР»СЏРјРё
    events: {},
    
    // РџРѕРґРїРёСЃРєР° РЅР° СЃРѕР±С‹С‚РёРµ
    on: function(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    },
    
    // РћС‚РїРёСЃРєР° РѕС‚ СЃРѕР±С‹С‚РёСЏ
    off: function(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    },
    
    // РўСЂРёРіРіРµСЂ СЃРѕР±С‹С‚РёСЏ
    triggerEvent: function(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`вќЊ РћС€РёР±РєР° РІ РѕР±СЂР°Р±РѕС‚С‡РёРєРµ СЃРѕР±С‹С‚РёСЏ ${eventName}:`, error);
                }
            });
        }
    },
    
    // ========== РЈРўРР›РРўР« ==========
    
    // РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё
    getStats: function() {
        const today = new Date().toLocaleDateString('ru-RU');
        const visitsToday = this.data.visits.filter(v => v.date === today).length;
        
        return {
            totalClients: this.data.clients.length,
            activeClients: this.data.clients.filter(c => c.status === 'РђРєС‚РёРІРµРЅ').length,
            totalVisits: this.data.visits.length,
            visitsToday: visitsToday,
            manager: this.currentManager.name
        };
    },
    
    // РћС‡РёСЃС‚РєР° РІСЃРµС… РґР°РЅРЅС‹С… (РѕСЃС‚РѕСЂРѕР¶РЅРѕ!)
    clearAllData: function() {
        if (confirm('Р’С‹ СѓРІРµСЂРµРЅС‹? Р’СЃРµ РґР°РЅРЅС‹Рµ Р±СѓРґСѓС‚ СѓРґР°Р»РµРЅС‹ Р±РµР·РІРѕР·РІСЂР°С‚РЅРѕ.')) {
            this.data = {
                clients: [],
                visits: [],
                products: [],
                calendarEvents: [],
                sales: {},
                calls: [],
                filters: {}
            };
            
            localStorage.clear();
            console.log('рџ§№ Р’СЃРµ РґР°РЅРЅС‹Рµ РѕС‡РёС‰РµРЅС‹');
            this.triggerEvent('dataCleared', null);
        }
    }
};

// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєР°СЏ РёРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
if (typeof window !== 'undefined') {
    // РЎРѕР·РґР°РµРј РіР»РѕР±Р°Р»СЊРЅС‹Р№ РѕР±СЉРµРєС‚
    window.VERTUM_DB = VERTUM_DB.init();
    
    // Р­РєСЃРїРѕСЂС‚РёСЂСѓРµРј РґР»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІ РґСЂСѓРіРёС… С„Р°Р№Р»Р°С…
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = VERTUM_DB;
    }
}