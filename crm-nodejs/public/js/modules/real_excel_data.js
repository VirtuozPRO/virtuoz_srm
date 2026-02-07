// ============================================
// REAL_EXCEL_DATA.JS - Р Р°Р±РѕС‚Р° СЃ РґР°РЅРЅС‹РјРё Excel
// ============================================

const ExcelDataManager = {
    // Р”Р°РЅРЅС‹Рµ Excel РёР· РєРѕРЅС„РёРіСѓСЂР°С†РёРё
    sheets: null,
    
    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ
    init: function() {
        console.log('рџ“Љ РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РјРµРЅРµРґР¶РµСЂР° Excel РґР°РЅРЅС‹С…...');
        
        // Р—Р°РіСЂСѓР¶Р°РµРј РґР°РЅРЅС‹Рµ РёР· РєРѕРЅС„РёРіСѓСЂР°С†РёРё РёР»Рё СЃРѕР·РґР°РµРј РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        this.loadSheets();
        
        // РЎРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµРј СЃ Р±Р°Р·РѕР№ РґР°РЅРЅС‹С…
        this.syncWithDatabase();
        
        console.log('вњ… Excel РјРµРЅРµРґР¶РµСЂ РіРѕС‚РѕРІ');
        return this;
    },
    
    // Р—Р°РіСЂСѓР·РєР° Р»РёСЃС‚РѕРІ
    loadSheets: function() {
        // РСЃРїРѕР»СЊР·СѓРµРј РґР°РЅРЅС‹Рµ РёР· РєРѕРЅС„РёРіСѓСЂР°С†РёРё РµСЃР»Рё РµСЃС‚СЊ
        if (window.VERTUM_CONFIG && window.VERTUM_CONFIG.excelSheets) {
            console.log('рџ“‹ Р—Р°РіСЂСѓР¶Р°РµРј Р»РёСЃС‚С‹ РёР· РєРѕРЅС„РёРіСѓСЂР°С†РёРё');
            this.sheets = {};
            
            window.VERTUM_CONFIG.excelSheets.sheets.forEach(sheetName => {
                this.sheets[sheetName] = this.generateSheetData(sheetName);
            });
        } else {
            console.log('рџ“‹ РСЃРїРѕР»СЊР·СѓРµРј Р»РёСЃС‚С‹ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ');
            this.sheets = this.getDefaultSheets();
        }
    },
    
    // Р“РµРЅРµСЂР°С†РёСЏ РґР°РЅРЅС‹С… РґР»СЏ Р»РёСЃС‚Р°
    generateSheetData: function(sheetName) {
        // Р‘Р°Р·РѕРІС‹Рµ РґР°РЅРЅС‹Рµ РґР»СЏ РєР°Р¶РґРѕРіРѕ Р»РёСЃС‚Р°
        switch(sheetName) {
            case 'РљР»РёРµРЅС‚С‹':
                return this.generateClientsSheet();
            case 'РўРѕРІР°СЂС‹':
                return this.generateProductsSheet();
            case 'РџСЂРѕРґР°Р¶Рё':
                return this.generateSalesSheet();
            case 'Р’РёР·РёС‚С‹':
                return this.generateVisitsSheet();
            case 'РџР»Р°РЅ':
                return this.generatePlanSheet();
            default:
                return [];
        }
    },
    
    // Р“РµРЅРµСЂР°С†РёСЏ Р»РёСЃС‚Р° РєР»РёРµРЅС‚РѕРІ
    generateClientsSheet: function() {
        // РСЃРїРѕР»СЊР·СѓРµРј РґР°РЅРЅС‹Рµ РёР· Р±Р°Р·С‹ РµСЃР»Рё РµСЃС‚СЊ
        if (window.VERTUM_DB && window.VERTUM_DB.getAllClients) {
            const dbClients = window.VERTUM_DB.getAllClients();
            if (dbClients.length > 0) {
                return dbClients.map(client => ({
                    'РљРѕРґ': client['РљРѕРґ'] || 'вЂ”',
                    'РќР°РёРјРµРЅРѕРІР°РЅРёРµ': client['РќР°РёРјРµРЅРѕРІР°РЅРёРµ'] || 'вЂ”',
                    'РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘': client['РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘'] || 'вЂ”',
                    'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ': client['Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ'] || 'вЂ”',
                    'Р’РёРґ Р±РёР·РЅРµСЃР°': client['Р’РёРґ Р±РёР·РЅРµСЃР°'] || 'вЂ”',
                    'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°': client['РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°'] || 'вЂ”',
                    'РђРґСЂРµСЃ': client['РђРґСЂРµСЃ'] || 'вЂ”',
                    'РўРµР»РµС„РѕРЅ': client['РўРµР»РµС„РѕРЅ'] || 'вЂ”',
                    'Email': client['Email'] || 'вЂ”',
                    'РЎС‚Р°С‚СѓСЃ': client['status'] || 'РђРєС‚РёРІРµРЅ',
                    'РњРµРЅРµРґР¶РµСЂ': client['manager'] || 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
                }));
            }
        }
        
        // РР»Рё РІРѕР·РІСЂР°С‰Р°РµРј РґР°РЅРЅС‹Рµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        return [
            {
                'РљРѕРґ': '780',
                'РќР°РёРјРµРЅРѕРІР°РЅРёРµ': '0780 Р—РІРѕРЅР°СЂРµРІ Р’. Рђ. (РЎРёРјС„РµСЂРѕРїРѕР»СЊСЃРєРѕРµ С€)',
                'РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘': '2.4 РЎС‚Р°РЅРґР°СЂС‚ Р·Р° Р¦РљРђР” (РЎР°РЅС‚РµС… Рё РІРµРЅС‚)',
                'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ': 'РЎРµСЂРїСѓС…РѕРІ Рі.Рѕ.',
                'Р’РёРґ Р±РёР·РЅРµСЃР°': 'Р РѕР·РЅРёС‡РЅС‹Р№ РњР°РіР°Р·РёРЅ (Р”Рћ)',
                'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°': 'Р’РµРЅС‚РёР»СЏС†РёСЏ Р”Рћ',
                'РђРґСЂРµСЃ': 'РіРѕ РЎРµСЂРїСѓС…РѕРІ, Рґ. РљР°Р»РёРЅРѕРІРѕ, РљР°Р»РёРЅРѕРІСЃРєРёР№ СЃС‚СЂРѕР№ СЂС‹РЅРѕРє СѓС‡Р°СЃС‚РѕРє 202 Рђ',
                'РўРµР»РµС„РѕРЅ': '+7 (999) 123-45-67',
                'Email': 'client780@example.com',
                'РЎС‚Р°С‚СѓСЃ': 'РђРєС‚РёРІРµРЅ',
                'РњРµРЅРµРґР¶РµСЂ': 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
            }
        ];
    },
    
    // Р“РµРЅРµСЂР°С†РёСЏ РґСЂСѓРіРёС… Р»РёСЃС‚РѕРІ (СѓРїСЂРѕС‰РµРЅРЅР°СЏ РІРµСЂСЃРёСЏ)
    generateProductsSheet: function() {
        return [{
            'РљРѕРґ С‚РѕРІР°СЂР°': 'VNT-001',
            'РќР°РёРјРµРЅРѕРІР°РЅРёРµ': 'Р’РµРЅС‚РёР»СЏС‚РѕСЂ РєР°РЅР°Р»СЊРЅС‹Р№',
            'Р“СЂСѓРїРїР°': 'Р’РµРЅС‚РёР»СЏС†РёСЏ Р”Рћ',
            'РџСЂРѕРёР·РІРѕРґРёС‚РµР»СЊ': 'Р’Р•РќРўРЎ'
        }];
    },
    
    generateSalesSheet: function() {
        return [{
            'ID СЃРґРµР»РєРё': 'S-2024-001',
            'Р”Р°С‚Р°': '2024-01-15',
            'РљР»РёРµРЅС‚': 'РџРµС‚СЂРѕСЃСЏРЅ Р“.РЎ.',
            'РЎСѓРјРјР°': '189,600 в‚Ѕ',
            'РЎС‚Р°С‚СѓСЃ': 'РћРїР»Р°С‡РµРЅРѕ'
        }];
    },
    
    generateVisitsSheet: function() {
        // РСЃРїРѕР»СЊР·СѓРµРј РґР°РЅРЅС‹Рµ РёР· Р±Р°Р·С‹
        if (window.VERTUM_DB && window.VERTUM_DB.getAllVisits) {
            const visits = window.VERTUM_DB.getAllVisits();
            return visits.map(visit => ({
                'Р”Р°С‚Р°': visit.date || 'вЂ”',
                'РљР»РёРµРЅС‚': visit.clientName || 'вЂ”',
                'Р¦РµР»СЊ': visit.goal || 'вЂ”',
                'Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ': visit.duration || 'вЂ”',
                'Р РµР·СѓР»СЊС‚Р°С‚': visit.results ? visit.results.join(', ') : 'вЂ”'
            }));
        }
        
        return [];
    },
    
    generatePlanSheet: function() {
        return [{
            'РњРµСЃСЏС†': 'РЇРЅРІР°СЂСЊ 2024',
            'РџР»Р°РЅ РїСЂРѕРґР°Р¶': '15,000,000 в‚Ѕ',
            'Р¤Р°РєС‚ РїСЂРѕРґР°Р¶': '14,250,000 в‚Ѕ',
            'Р’С‹РїРѕР»РЅРµРЅРёРµ': '95%'
        }];
    },
    
    // Р›РёСЃС‚С‹ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
    getDefaultSheets: function() {
        return {
            'РљР»РёРµРЅС‚С‹': this.generateClientsSheet(),
            'РўРѕРІР°СЂС‹': this.generateProductsSheet(),
            'РџСЂРѕРґР°Р¶Рё': this.generateSalesSheet(),
            'Р’РёР·РёС‚С‹': this.generateVisitsSheet(),
            'РџР»Р°РЅ': this.generatePlanSheet()
        };
    },
    
    // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ СЃ Р±Р°Р·РѕР№ РґР°РЅРЅС‹С…
    syncWithDatabase: function() {
        if (!window.VERTUM_DB) {
            console.warn('вљ пёЏ Р‘Р°Р·Р° РґР°РЅРЅС‹С… РЅРµ РЅР°Р№РґРµРЅР°, СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РЅРµРІРѕР·РјРѕР¶РЅР°');
            return;
        }
        
        // РџРѕРґРїРёСЃС‹РІР°РµРјСЃСЏ РЅР° СЃРѕР±С‹С‚РёСЏ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
        window.VERTUM_DB.on('clientAdded', (client) => {
            this.updateClientsSheet(client);
        });
        
        window.VERTUM_DB.on('visitAdded', (visit) => {
            this.updateVisitsSheet(visit);
        });
        
        console.log('рџ”„ РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ СЃ Р±Р°Р·РѕР№ РґР°РЅРЅС‹С… СѓСЃС‚Р°РЅРѕРІР»РµРЅР°');
    },
    
    // РћР±РЅРѕРІР»РµРЅРёРµ Р»РёСЃС‚Р° РєР»РёРµРЅС‚РѕРІ
    updateClientsSheet: function(client) {
        if (!this.sheets['РљР»РёРµРЅС‚С‹']) {
            this.sheets['РљР»РёРµРЅС‚С‹'] = [];
        }
        
        // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё СѓР¶Рµ С‚Р°РєРѕР№ РєР»РёРµРЅС‚
        const existingIndex = this.sheets['РљР»РёРµРЅС‚С‹'].findIndex(c => c['РљРѕРґ'] === client['РљРѕРґ']);
        
        if (existingIndex !== -1) {
            // РћР±РЅРѕРІР»СЏРµРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ
            this.sheets['РљР»РёРµРЅС‚С‹'][existingIndex] = {
                'РљРѕРґ': client['РљРѕРґ'],
                'РќР°РёРјРµРЅРѕРІР°РЅРёРµ': client['РќР°РёРјРµРЅРѕРІР°РЅРёРµ'],
                'РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘': client['РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘'] || 'вЂ”',
                'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ': client['Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ'] || 'вЂ”',
                'Р’РёРґ Р±РёР·РЅРµСЃР°': client['Р’РёРґ Р±РёР·РЅРµСЃР°'] || 'вЂ”',
                'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°': client['РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°'] || 'вЂ”',
                'РђРґСЂРµСЃ': client['РђРґСЂРµСЃ'] || 'вЂ”',
                'РўРµР»РµС„РѕРЅ': client['РўРµР»РµС„РѕРЅ'] || 'вЂ”',
                'Email': client['Email'] || 'вЂ”',
                'РЎС‚Р°С‚СѓСЃ': client['status'] || 'РђРєС‚РёРІРµРЅ',
                'РњРµРЅРµРґР¶РµСЂ': client['manager'] || 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
            };
        } else {
            // Р”РѕР±Р°РІР»СЏРµРј РЅРѕРІРѕРіРѕ
            this.sheets['РљР»РёРµРЅС‚С‹'].push({
                'РљРѕРґ': client['РљРѕРґ'],
                'РќР°РёРјРµРЅРѕРІР°РЅРёРµ': client['РќР°РёРјРµРЅРѕРІР°РЅРёРµ'],
                'РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘': client['РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘'] || 'вЂ”',
                'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ': client['Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ'] || 'вЂ”',
                'Р’РёРґ Р±РёР·РЅРµСЃР°': client['Р’РёРґ Р±РёР·РЅРµСЃР°'] || 'вЂ”',
                'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°': client['РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°'] || 'вЂ”',
                'РђРґСЂРµСЃ': client['РђРґСЂРµСЃ'] || 'вЂ”',
                'РўРµР»РµС„РѕРЅ': client['РўРµР»РµС„РѕРЅ'] || 'вЂ”',
                'Email': client['Email'] || 'вЂ”',
                'РЎС‚Р°С‚СѓСЃ': client['status'] || 'РќРѕРІС‹Р№',
                'РњРµРЅРµРґР¶РµСЂ': client['manager'] || 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
            });
        }
        
        console.log(`рџ“‹ Р›РёСЃС‚ "РљР»РёРµРЅС‚С‹" РѕР±РЅРѕРІР»РµРЅ (${this.sheets['РљР»РёРµРЅС‚С‹'].length} Р·Р°РїРёСЃРµР№)`);
    },
    
    // РћР±РЅРѕРІР»РµРЅРёРµ Р»РёСЃС‚Р° РІРёР·РёС‚РѕРІ
    updateVisitsSheet: function(visit) {
        if (!this.sheets['Р’РёР·РёС‚С‹']) {
            this.sheets['Р’РёР·РёС‚С‹'] = [];
        }
        
        this.sheets['Р’РёР·РёС‚С‹'].push({
            'Р”Р°С‚Р°': visit.date || 'вЂ”',
            'РљР»РёРµРЅС‚': visit.clientName || 'вЂ”',
            'Р¦РµР»СЊ': visit.goal || 'вЂ”',
            'Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ': visit.duration || 'вЂ”',
            'Р РµР·СѓР»СЊС‚Р°С‚': visit.results ? visit.results.join(', ') : 'вЂ”',
            'Р—Р°РјРµС‚РєРё': visit.notes || 'вЂ”',
            'РњРµРЅРµРґР¶РµСЂ': visit.manager || 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.'
        });
        
        console.log(`рџ“‹ Р›РёСЃС‚ "Р’РёР·РёС‚С‹" РѕР±РЅРѕРІР»РµРЅ (${this.sheets['Р’РёР·РёС‚С‹'].length} Р·Р°РїРёСЃРµР№)`);
    },
    
    // ========== РџРЈР‘Р›РР§РќР«Р• РњР•РўРћР”Р« ==========
    
    // РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… Р»РёСЃС‚РѕРІ
    getAllSheets: function() {
        return this.sheets;
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ Р»РёСЃС‚Р°
    getSheet: function(sheetName) {
        return this.sheets[sheetName] || [];
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ РёРјРµРЅ Р»РёСЃС‚РѕРІ
    getSheetNames: function() {
        return Object.keys(this.sheets);
    },
    
    // РџРѕРёСЃРє РїРѕ РІСЃРµРј Р»РёСЃС‚Р°Рј
    searchAllSheets: function(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();
        
        Object.keys(this.sheets).forEach(sheetName => {
            this.sheets[sheetName].forEach((row, index) => {
                const matches = Object.values(row).some(value => 
                    String(value).toLowerCase().includes(term)
                );
                
                if (matches) {
                    results.push({
                        sheet: sheetName,
                        rowIndex: index,
                        data: row
                    });
                }
            });
        });
        
        return results;
    },
    
    // РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё РїРѕ Р»РёСЃС‚Сѓ
    getSheetStats: function(sheetName) {
        const data = this.getSheet(sheetName);
        return {
            name: sheetName,
            rows: data.length,
            columns: data.length > 0 ? Object.keys(data[0]).length : 0,
            lastUpdated: new Date().toISOString()
        };
    },
    
    // Р­РєСЃРїРѕСЂС‚ Р»РёСЃС‚Р° РІ CSV
    exportSheetToCSV: function(sheetName) {
        const data = this.getSheet(sheetName);
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => 
                `"${String(row[header] || '').replace(/"/g, '""')}"`
            ).join(';')
        );
        
        return [headers.join(';'), ...rows].join('\n');
    },
    
    // РРјРїРѕСЂС‚ РґР°РЅРЅС‹С… РІ Р»РёСЃС‚
    importToSheet: function(sheetName, data, format = 'csv') {
        try {
            if (format === 'csv') {
                const rows = data.split('\n');
                const headers = rows[0].split(';').map(h => h.replace(/"/g, ''));
                
                const importedData = rows.slice(1).map(row => {
                    const values = row.split(';').map(v => v.replace(/"/g, ''));
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });
                    return obj;
                });
                
                this.sheets[sheetName] = importedData;
                console.log(`рџ“Ґ РРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ ${importedData.length} Р·Р°РїРёСЃРµР№ РІ Р»РёСЃС‚ "${sheetName}"`);
                return true;
            }
        } catch (error) {
            console.error('вќЊ РћС€РёР±РєР° РёРјРїРѕСЂС‚Р°:', error);
        }
        return false;
    }
};

// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєР°СЏ РёРЅРёС†РёР°Р»РёР·Р°С†РёСЏ
if (typeof window !== 'undefined') {
    window.VERTUM_EXCEL = ExcelDataManager.init();
    
    // Р­РєСЃРїРѕСЂС‚ РґР»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІ РґСЂСѓРіРёС… С„Р°Р№Р»Р°С…
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ExcelDataManager;
    }
}