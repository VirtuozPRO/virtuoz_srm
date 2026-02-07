// ============================================
// CONFIG.JS - РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ РІСЃРµР№ СЃРёСЃС‚РµРјС‹ Р’Р•Р РўРЈРњ CRM
// ============================================

const VERTUM_CONFIG = {
    // ========== РћРЎРќРћР’РќР«Р• РќРђРЎРўР РћР™РљР ==========
    version: '1.0',
    appName: 'Р’Р•Р РўРЈРњ CRM',
    company: 'Р’Р•Р РўРЈРњ',
    
    // ========== РќРђРЎРўР РћР™РљР РњР•РќР•Р”Р–Р•Р РћР’ ==========
    managers: {
        'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ': {
            id: 1,
            name: 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р СѓСЃС‚Р°Рј РЁР°С„РєР°С‚РѕРІРёС‡',
            email: 'hrs@vertum.su',
            phone: '+7 (985) 710-21-27',
            short: 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.',
            default: true,
            role: 'РўРѕСЂРіРѕРІС‹Р№ РїСЂРµРґСЃС‚Р°РІРёС‚РµР»СЊ',
            region: 'РњРѕСЃРєРѕРІСЃРєР°СЏ РѕР±Р»Р°СЃС‚СЊ'
        },
        'РҐРёС‚СЂРѕРІ': {
            id: 2,
            name: 'РҐРёС‚СЂРѕРІ РљРёСЂРёР»Р» Р®СЂСЊРµРІРёС‡',
            email: 'hky@vertum.su',
            phone: '+7 (909) 624-99-00',
            short: 'РҐРёС‚СЂРѕРІ Рљ.Р®.',
            default: false,
            role: 'РўРѕСЂРіРѕРІС‹Р№ РїСЂРµРґСЃС‚Р°РІРёС‚РµР»СЊ',
            region: 'РњРѕСЃРєРѕРІСЃРєР°СЏ РѕР±Р»Р°СЃС‚СЊ'
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР Р¤РР›Р¬РўР РћР’ ==========
    filters: {
        // РљРѕР»РѕРЅРєРё РґР»СЏ С„РёР»СЊС‚СЂР°С†РёРё РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        defaultColumns: [
            'РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘',
            'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ', 
            'Р’РёРґ Р±РёР·РЅРµСЃР°',
            'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°',
            'РЎРµРіРјРµРЅС‚ РїРѕ Р·РѕРЅРµ РґРѕСЃС‚Р°РІРєРё (РћР±С‰РёРµ)',
            'РЎРµРіРјРµРЅС‚ РїРѕ РЅР°РїСЂР°РІР»РµРЅРёСЋ (С€РѕСЃСЃРµ) (РћР±С‰РёРµ)'
        ],
        
        // РљР°СЃС‚РѕРјРЅС‹Рµ С„РёР»СЊС‚СЂС‹ СЃ РѕСЃРѕР±С‹РјРё С‚РёРїР°РјРё
        customFilters: {
            'РљРѕРґ': {
                type: 'range',
                options: ['1-100', '101-200', '201-500', '501-999', '1000+']
            },
            'РЎС‚Р°С‚СѓСЃ': {
                type: 'select',
                options: ['РђРєС‚РёРІРµРЅ', 'РќРµР°РєС‚РёРІРµРЅ', 'РќРѕРІС‹Р№', 'РџРѕС‚РµРЅС†РёР°Р»СЊРЅС‹Р№', 'VIP', 'РџСЂРѕР±Р»РµРјРЅС‹Р№']
            },
            'РџРѕСЃР»РµРґРЅРёР№ РІРёР·РёС‚': {
                type: 'date',
                options: ['РЎРµРіРѕРґРЅСЏ', 'Р’С‡РµСЂР°', 'Р—Р° РЅРµРґРµР»СЋ', 'Р—Р° РјРµСЃСЏС†', 'Р—Р° РєРІР°СЂС‚Р°Р»', 'Р‘РѕР»РµРµ РєРІР°СЂС‚Р°Р»Р°']
            },
            'РћР±СЉРµРј Р·Р°РєСѓРїРѕРє': {
                type: 'range',
                options: ['Р”Рѕ 100K в‚Ѕ', '100K-500K в‚Ѕ', '500K-1M в‚Ѕ', '1M-5M в‚Ѕ', '5M+ в‚Ѕ']
            }
        },
        
        // РќР°СЃС‚СЂРѕР№РєРё РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ С„РёР»СЊС‚СЂРѕРІ
        display: {
            gridColumns: 3,
            showLabels: true,
            showResetButton: true,
            saveFilters: true
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР EXCEL ==========
    excelSheets: {
        // Р›РёСЃС‚С‹ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        sheets: ['РљР»РёРµРЅС‚С‹', 'РўРѕРІР°СЂС‹', 'РџСЂРѕРґР°Р¶Рё', 'Р’РёР·РёС‚С‹', 'РџР»Р°РЅ'],
        
        // РќР°СЃС‚СЂРѕР№РєРё СЌРєСЃРїРѕСЂС‚Р°
        export: {
            defaultFormat: 'xlsx',
            includeStats: true,
            timestamp: true,
            compression: false
        },
        
        // РќР°СЃС‚СЂРѕР№РєРё РёРјРїРѕСЂС‚Р°
        import: {
            allowedFormats: ['csv', 'xlsx', 'xls'],
            maxFileSize: 10485760, // 10MB
            autoDetectSheet: true
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР Р’РР—РРўРћР’ ==========
    visits: {
        // Р¦РµР»Рё РІРёР·РёС‚РѕРІ
        goals: [
            { value: 'presentation', label: 'РџСЂРµР·РµРЅС‚Р°С†РёСЏ РЅРѕРІРёРЅРѕРє', icon: 'рџ“Љ', color: '#2196F3' },
            { value: 'discussion', label: 'РћР±СЃСѓР¶РґРµРЅРёРµ СѓСЃР»РѕРІРёР№', icon: 'рџ¤ќ', color: '#FF9800' },
            { value: 'contract', label: 'РџРѕРґРїРёСЃР°РЅРёРµ РґРѕРіРѕРІРѕСЂР°', icon: 'рџ“ќ', color: '#4CAF50' },
            { value: 'meeting', label: 'Р’СЃС‚СЂРµС‡Р°', icon: 'рџ‘Ґ', color: '#9C27B0' },
            { value: 'planned', label: 'РџР»Р°РЅРѕРІС‹Р№ РІРёР·РёС‚', icon: 'рџ“…', color: '#607D8B' },
            { value: 'training', label: 'РћР±СѓС‡РµРЅРёРµ РїРµСЂСЃРѕРЅР°Р»Р°', icon: 'рџЋ“', color: '#795548' },
            { value: 'problem', label: 'Р РµС€РµРЅРёРµ РїСЂРѕР±Р»РµРјС‹', icon: 'вљ пёЏ', color: '#F44336' },
            { value: 'delivery', label: 'Р”РѕСЃС‚Р°РІРєР° С‚РѕРІР°СЂР°', icon: 'рџљљ', color: '#00BCD4' },
            { value: 'other', label: 'Р”СЂСѓРіРѕРµ', icon: 'рџ“Њ', color: '#9E9E9E' }
        ],
        
        // Р РµР·СѓР»СЊС‚Р°С‚С‹ РІРёР·РёС‚РѕРІ
        results: [
            { id: 'resultOrder', label: 'Р—Р°РєР°Р· РѕС„РѕСЂРјР»РµРЅ', icon: 'вњ“' },
            { id: 'resultPreorder', label: 'РџСЂРµРґР·Р°РєР°Р· РІРЅРµСЃРµРЅ', icon: 'рџ“‹' },
            { id: 'resultPrices', label: 'Р¦РµРЅС‹ СЃРѕРіР»Р°СЃРѕРІР°РЅС‹', icon: 'рџ’°' },
            { id: 'resultProblems', label: 'РџСЂРѕР±Р»РµРјС‹ СЂРµС€РµРЅС‹', icon: 'рџ”§' },
            { id: 'resultNextMeeting', label: 'РЎР»РµРґСѓСЋС‰Р°СЏ РІСЃС‚СЂРµС‡Р°', icon: 'рџ“…' },
            { id: 'resultSamples', label: 'РћР±СЂР°Р·С†С‹ РѕСЃС‚Р°РІР»РµРЅС‹', icon: 'рџЋЃ' },
            { id: 'resultContract', label: 'РљРѕРЅС‚СЂР°РєС‚ РїРѕРґРїРёСЃР°РЅ', icon: 'рџ“ќ' },
            { id: 'resultReport', label: 'РћС‚С‡РµС‚ РѕС‚РїСЂР°РІР»РµРЅ', icon: 'рџ“§' },
            { id: 'resultPayment', label: 'РћРїР»Р°С‚Р° РїРѕР»СѓС‡РµРЅР°', icon: 'рџ’і' },
            { id: 'resultDelivery', label: 'Р”РѕСЃС‚Р°РІРєР° СЃРѕРіР»Р°СЃРѕРІР°РЅР°', icon: 'рџљљ' }
        ],
        
        // РќР°СЃС‚СЂРѕР№РєРё С‚Р°Р№РјРµСЂР° РІРёР·РёС‚Р°
        timer: {
            minDuration: 5, // РјРёРЅСѓС‚
            maxDuration: 480, // РјРёРЅСѓС‚ (8 С‡Р°СЃРѕРІ)
            defaultDuration: 60,
            warningThreshold: 120, // РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ Рѕ РґР»РёС‚РµР»СЊРЅРѕРј РІРёР·РёС‚Рµ
            autoSaveInterval: 30000 // Р°РІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёРµ РєР°Р¶РґС‹Рµ 30 СЃРµРєСѓРЅРґ
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР РљРђР›Р•РќР”РђР РЇ ==========
    calendar: {
        defaultView: 'month',
        firstDayOfWeek: 1, // 1 = РїРѕРЅРµРґРµР»СЊРЅРёРє
        
        // РўРёРїС‹ СЃРѕР±С‹С‚РёР№
        eventTypes: {
            'meeting': { 
                name: 'Р’СЃС‚СЂРµС‡Р°', 
                color: '#2196F3', 
                icon: 'рџ‘Ґ',
                bgColor: '#E3F2FD'
            },
            'birthday': { 
                name: 'Р”РµРЅСЊ СЂРѕР¶РґРµРЅРёСЏ', 
                color: '#FF9800', 
                icon: 'рџЋ‚',
                bgColor: '#FFF3E0'
            },
            'presentation': { 
                name: 'РџСЂРµР·РµРЅС‚Р°С†РёСЏ', 
                color: '#4CAF50', 
                icon: 'рџ“Љ',
                bgColor: '#E8F5E9'
            },
            'delivery': { 
                name: 'Р”РѕСЃС‚Р°РІРєР°', 
                color: '#9C27B0', 
                icon: 'рџљљ',
                bgColor: '#F3E5F5'
            },
            'reminder': { 
                name: 'РќР°РїРѕРјРёРЅР°РЅРёРµ', 
                color: '#607D8B', 
                icon: 'вЏ°',
                bgColor: '#ECEFF1'
            },
            'holiday': { 
                name: 'РџСЂР°Р·РґРЅРёРє', 
                color: '#F44336', 
                icon: 'рџЋ‰',
                bgColor: '#FFEBEE'
            }
        },
        
        // РќР°СЃС‚СЂРѕР№РєРё РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ
        display: {
            showWeekends: true,
            highlightToday: true,
            showEventsCount: true,
            maxEventsPerDay: 5
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР РљР›РР•РќРўРћР’ ==========
    clients: {
        // РџРѕР»СЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РґР»СЏ СЂРµРіРёСЃС‚СЂР°С†РёРё
        registrationFields: [
            { name: 'РљРѕРґ', type: 'text', required: true, placeholder: 'РќР°РїСЂРёРјРµСЂ: 999' },
            { name: 'РќР°РёРјРµРЅРѕРІР°РЅРёРµ', type: 'text', required: true, placeholder: 'РџРѕР»РЅРѕРµ РЅР°РёРјРµРЅРѕРІР°РЅРёРµ' },
            { name: 'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ', type: 'select', required: true },
            { name: 'Р’РёРґ Р±РёР·РЅРµСЃР°', type: 'select', required: true },
            { name: 'РћСЃРЅРѕРІРЅР°СЏ С‚РѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°', type: 'select', required: true },
            { name: 'РђРґСЂРµСЃ', type: 'text', required: false, placeholder: 'РџРѕР»РЅС‹Р№ Р°РґСЂРµСЃ' },
            { name: 'РўРµР»РµС„РѕРЅ', type: 'tel', required: false, placeholder: '+7 (XXX) XXX-XX-XX' },
            { name: 'Email', type: 'email', required: false, placeholder: 'email@example.com' }
        ],
        
        // РЎС‚Р°С‚СѓСЃС‹ РєР»РёРµРЅС‚РѕРІ
        statuses: [
            { value: 'active', label: 'РђРєС‚РёРІРµРЅ', color: '#4CAF50' },
            { value: 'new', label: 'РќРѕРІС‹Р№', color: '#2196F3' },
            { value: 'inactive', label: 'РќРµР°РєС‚РёРІРµРЅ', color: '#9E9E9E' },
            { value: 'potential', label: 'РџРѕС‚РµРЅС†РёР°Р»СЊРЅС‹Р№', color: '#FF9800' },
            { value: 'vip', label: 'VIP', color: '#9C27B0' },
            { value: 'problem', label: 'РџСЂРѕР±Р»РµРјРЅС‹Р№', color: '#F44336' }
        ],
        
        // РЎРµРіРјРµРЅС‚Р°С†РёСЏ
        segments: {
            '2.1': 'РЎС‚Р°РЅРґР°СЂС‚ РґРѕ Р¦РљРђР” (РІСЃРµ)',
            '2.2': 'РЎС‚Р°РЅРґР°СЂС‚ РґРѕ Р¦РљРђР” (СЃР°РЅС‚РµС… Рё РІРµРЅС‚)',
            '2.3': 'РЎС‚Р°РЅРґР°СЂС‚ Р·Р° Р¦РљРђР” (РІСЃРµ)',
            '2.4': 'РЎС‚Р°РЅРґР°СЂС‚ Р·Р° Р¦РљРђР” (РЎР°РЅС‚РµС… Рё РІРµРЅС‚)',
            '2.5': 'РџРѕРїСѓС‚РЅР°СЏ РґРѕСЃС‚Р°РІРєР° РЎС‚Р°РЅРґР°СЂС‚ РґРѕ Р¦РљРђР” (РІСЃРµ)'
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР РЎРўРђРўРРЎРўРРљР ==========
    statistics: {
        // РџРѕРєР°Р·Р°С‚РµР»Рё РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ
        metrics: [
            { id: 'totalClients', label: 'Р’СЃРµРіРѕ РєР»РёРµРЅС‚РѕРІ', icon: 'рџ‘Ґ', format: 'number' },
            { id: 'activeClients', label: 'РђРєС‚РёРІРЅС‹С… РєР»РёРµРЅС‚РѕРІ', icon: 'вњ…', format: 'number' },
            { id: 'newClients', label: 'РќРѕРІС‹С… РєР»РёРµРЅС‚РѕРІ', icon: 'рџ†•', format: 'number' },
            { id: 'visitsToday', label: 'Р’РёР·РёС‚РѕРІ СЃРµРіРѕРґРЅСЏ', icon: 'рџ“…', format: 'number' },
            { id: 'totalVisits', label: 'Р’СЃРµРіРѕ РІРёР·РёС‚РѕРІ', icon: 'рџ“Љ', format: 'number' },
            { id: 'sales2025', label: 'РџСЂРѕРґР°Р¶Рё 2025', icon: 'рџ’°', format: 'currency' },
            { id: 'plan2026', label: 'РџР»Р°РЅ 2026', icon: 'рџЋЇ', format: 'currency' },
            { id: 'completion', label: 'Р’С‹РїРѕР»РЅРµРЅРёРµ РїР»Р°РЅР°', icon: 'рџ“€', format: 'percentage' },
            { id: 'productGroups', label: 'РўРѕРІР°СЂРЅС‹С… РіСЂСѓРїРї', icon: 'рџ“¦', format: 'number' }
        ],
        
        // Р¦РµР»РµРІС‹Рµ РїРѕРєР°Р·Р°С‚РµР»Рё
        targets: {
            totalClients: 150,
            activeClients: 120,
            visitsPerDay: 5,
            sales2025: 200000000,
            plan2026: 250000000
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР РРќРўР•Р Р¤Р•Р™РЎРђ ==========
    ui: {
        // Р¦РІРµС‚РѕРІР°СЏ СЃС…РµРјР°
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#4CAF50',
            warning: '#FF9800',
            danger: '#F44336',
            info: '#2196F3',
            light: '#f8f9fa',
            dark: '#2d3748'
        },
        
        // Р“СЂР°РґРёРµРЅС‚С‹
        gradients: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            success: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            danger: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
            info: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)'
        },
        
        // РўРµРЅРё
        shadows: {
            small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
        },
        
        // РђРЅРёРјР°С†РёРё
        animations: {
            duration: {
                fast: '0.2s',
                normal: '0.3s',
                slow: '0.5s'
            },
            easing: {
                default: 'ease',
                bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
        }
    },
    
    // ========== РќРђРЎРўР РћР™РљР РҐР РђРќР•РќРРЇ ==========
    storage: {
        prefix: 'vertum_',
        version: '1.0',
        backupInterval: 3600000, // РєР°Р¶РґС‹Р№ С‡Р°СЃ
        maxBackups: 10
    },
    
    // ========== РќРђРЎРўР РћР™РљР РЎРРќРҐР РћРќРР—РђР¦РР ==========
    sync: {
        enabled: true,
        interval: 300000, // 5 РјРёРЅСѓС‚
        autoSync: true,
        conflictResolution: 'server' // 'server', 'client', 'newest'
    },
    
    // ========== РќРђРЎРўР РћР™РљР РћРўР§Р•РўРћР’ ==========
    reports: {
        // РўРёРїС‹ РѕС‚С‡РµС‚РѕРІ
        types: [
            { id: 'daily', label: 'Р•Р¶РµРґРЅРµРІРЅС‹Р№ РѕС‚С‡РµС‚', schedule: 'daily' },
            { id: 'weekly', label: 'Р•Р¶РµРЅРµРґРµР»СЊРЅС‹Р№ РѕС‚С‡РµС‚', schedule: 'weekly' },
            { id: 'monthly', label: 'Р•Р¶РµРјРµСЃСЏС‡РЅС‹Р№ РѕС‚С‡РµС‚', schedule: 'monthly' },
            { id: 'visits', label: 'РћС‚С‡РµС‚ РїРѕ РІРёР·РёС‚Р°Рј', schedule: 'manual' },
            { id: 'clients', label: 'РћС‚С‡РµС‚ РїРѕ РєР»РёРµРЅС‚Р°Рј', schedule: 'manual' },
            { id: 'sales', label: 'РћС‚С‡РµС‚ РїРѕ РїСЂРѕРґР°Р¶Р°Рј', schedule: 'manual' }
        ],
        
        // РџРѕР»СѓС‡Р°С‚РµР»Рё РѕС‚С‡РµС‚РѕРІ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
        recipients: ['hrs@vertum.su', 'hky@vertum.su'],
        
        // Р¤РѕСЂРјР°С‚С‹ РѕС‚С‡РµС‚РѕРІ
        formats: ['pdf', 'excel', 'csv', 'email']
    },
    
    // ========== РќРђРЎРўР РћР™РљР Р­РљРЎРџРћР РўРђ ==========
    export: {
        formats: {
            csv: {
                separator: ';',
                encoding: 'utf-8',
                includeBOM: true
            },
            excel: {
                sheetName: 'Р”Р°РЅРЅС‹Рµ',
                includeHeaders: true,
                autoFilter: true
            },
            pdf: {
                orientation: 'portrait',
                format: 'A4',
                margin: '20mm'
            }
        },
        
        // РќР°СЃС‚СЂРѕР№РєРё РґР»СЏ СЂР°Р·РЅС‹С… С‚РёРїРѕРІ РґР°РЅРЅС‹С…
        dataTypes: {
            clients: {
                defaultColumns: ['РљРѕРґ', 'РќР°РёРјРµРЅРѕРІР°РЅРёРµ', 'Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ', 'Р’РёРґ Р±РёР·РЅРµСЃР°', 'РўРµР»РµС„РѕРЅ', 'Email'],
                filename: 'РљР»РёРµРЅС‚С‹_{date}'
            },
            visits: {
                defaultColumns: ['Р”Р°С‚Р°', 'РљР»РёРµРЅС‚', 'Р¦РµР»СЊ', 'Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ', 'Р РµР·СѓР»СЊС‚Р°С‚С‹'],
                filename: 'Р’РёР·РёС‚С‹_{date}'
            },
            products: {
                defaultColumns: ['РљРѕРґ С‚РѕРІР°СЂР°', 'РќР°РёРјРµРЅРѕРІР°РЅРёРµ', 'Р“СЂСѓРїРїР°', 'Р¦РµРЅР°'],
                filename: 'РўРѕРІР°СЂС‹_{date}'
            }
        }
    },
    
    // ========== РЎРРЎРўР•РњРќР«Р• РќРђРЎРўР РћР™РљР ==========
    system: {
        debug: false,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        autoSave: true,
        offlineMode: true,
        notifications: {
            enabled: true,
            position: 'top-right',
            duration: 3000
        }
    }
};

// ========== Р’РЎРџРћРњРћР“РђРўР•Р›Р¬РќР«Р• Р¤РЈРќРљР¦РР ==========

// РџРѕР»СѓС‡РµРЅРёРµ РјРµРЅРµРґР¶РµСЂР° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
VERTUM_CONFIG.getDefaultManager = function() {
    for (const key in this.managers) {
        if (this.managers[key].default) {
            return this.managers[key];
        }
    }
    return this.managers['РҐРёСЃРјР°С‚СѓР»Р»РёРЅ'];
};

// РџРѕР»СѓС‡РµРЅРёРµ РјРµРЅРµРґР¶РµСЂР° РїРѕ ID РёР»Рё РёРјРµРЅРё
VERTUM_CONFIG.getManager = function(identifier) {
    // Р•СЃР»Рё РїРµСЂРµРґР°РЅ ID
    if (typeof identifier === 'number') {
        for (const key in this.managers) {
            if (this.managers[key].id === identifier) {
                return this.managers[key];
            }
        }
    }
    // Р•СЃР»Рё РїРµСЂРµРґР°РЅРѕ РёРјСЏ
    else if (typeof identifier === 'string') {
        return this.managers[identifier];
    }
    return null;
};

// РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РјРµРЅРµРґР¶РµСЂРѕРІ
VERTUM_CONFIG.getAllManagers = function() {
    return Object.values(this.managers);
};

// РџРѕР»СѓС‡РµРЅРёРµ РЅР°СЃС‚СЂРѕРµРє С„РёР»СЊС‚СЂР° РїРѕ РёРјРµРЅРё
VERTUM_CONFIG.getFilterConfig = function(filterName) {
    if (this.filters.customFilters[filterName]) {
        return this.filters.customFilters[filterName];
    }
    return null;
};

// РџРѕР»СѓС‡РµРЅРёРµ С†РµР»Рё РІРёР·РёС‚Р° РїРѕ Р·РЅР°С‡РµРЅРёСЋ
VERTUM_CONFIG.getVisitGoal = function(goalValue) {
    const goal = this.visits.goals.find(g => g.value === goalValue);
    return goal || { value: goalValue, label: goalValue, icon: 'рџ“Њ', color: '#9E9E9E' };
};

// РџРѕР»СѓС‡РµРЅРёРµ С‚РёРїР° СЃРѕР±С‹С‚РёСЏ РєР°Р»РµРЅРґР°СЂСЏ
VERTUM_CONFIG.getCalendarEventType = function(typeName) {
    return this.calendar.eventTypes[typeName] || { 
        name: typeName, 
        color: '#607D8B', 
        icon: 'рџ“Њ',
        bgColor: '#ECEFF1'
    };
};

// РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚СѓСЃР° РєР»РёРµРЅС‚Р°
VERTUM_CONFIG.getClientStatus = function(statusValue) {
    const status = this.clients.statuses.find(s => s.value === statusValue);
    return status || { value: statusValue, label: statusValue, color: '#9E9E9E' };
};

// РџРѕР»СѓС‡РµРЅРёРµ С†РІРµС‚Р° РїРѕ С‚РёРїСѓ
VERTUM_CONFIG.getColor = function(colorType) {
    return this.ui.colors[colorType] || this.ui.colors.primary;
};

// РџРѕР»СѓС‡РµРЅРёРµ РіСЂР°РґРёРµРЅС‚Р° РїРѕ С‚РёРїСѓ
VERTUM_CONFIG.getGradient = function(gradientType) {
    return this.ui.gradients[gradientType] || this.ui.gradients.primary;
};

// РџСЂРѕРІРµСЂРєР° РґРѕСЃС‚СѓРїРЅРѕСЃС‚Рё С„СѓРЅРєС†РёРё
VERTUM_CONFIG.isFeatureEnabled = function(feature) {
    const features = {
        'sync': this.sync.enabled,
        'offline': this.system.offlineMode,
        'notifications': this.system.notifications.enabled,
        'export': true,
        'import': true,
        'calendar': true,
        'visits': true,
        'reports': true
    };
    return features[feature] !== undefined ? features[feature] : true;
};

// РџРѕР»СѓС‡РµРЅРёРµ С‚РµРєСѓС‰РµР№ РІРµСЂСЃРёРё
VERTUM_CONFIG.getVersion = function() {
    return this.version;
};

// РћР±РЅРѕРІР»РµРЅРёРµ РєРѕРЅС„РёРіСѓСЂР°С†РёРё
VERTUM_CONFIG.update = function(updates) {
    Object.assign(this, updates);
    console.log('РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ РѕР±РЅРѕРІР»РµРЅР°');
};

// ========== Р­РљРЎРџРћР Рў РљРћРќР¤РР“РЈР РђР¦РР ==========

// Р”Р»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІ Р±СЂР°СѓР·РµСЂРµ
if (typeof window !== 'undefined') {
    window.VERTUM_CONFIG = VERTUM_CONFIG;
}

// Р”Р»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІ Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VERTUM_CONFIG;
}

// Р”Р»СЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РІ ES6 РјРѕРґСѓР»СЏС…
if (typeof exports !== 'undefined') {
    exports.VERTUM_CONFIG = VERTUM_CONFIG;
}

console.log('вњ… РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ Р’Р•Р РўРЈРњ CRM Р·Р°РіСЂСѓР¶РµРЅР° РІРµСЂСЃРёСЏ ' + VERTUM_CONFIG.version);