#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ГЕНЕРАТОР ДИНАМИЧЕСКИХ ФИЛЬТРОВ ДЛЯ CRM ВЕРТУМ
Автоматически создает фильтры из реального Excel файла
"""

import pandas as pd
import json
import re
import sys
from pathlib import Path

def extract_city_from_address(addr):
    """Извлекает город из адреса с использованием умных правил"""
    if not addr or not isinstance(addr, str) or addr.lower() == 'nan':
        return None
    
    addr_lower = addr.lower()
    
    # Словарь известных городов и их вариантов написания
    city_patterns = {
        'Москва': ['москва', 'мск', 'г. москва', 'гор. москва'],
        'Серпухов': ['серпухов', 'серпуховский', 'г. серпухов'],
        'Подольск': ['подольск', 'подольский', 'г. подольск'],
        'Новомосковск': ['новомосковск', 'новомосковский', 'г. новомосковск'],
        'Щербинка': ['щербинка', 'щербинский', 'г. щербинка'],
        'Щелково': ['щелково', 'щелковский', 'г. щелково'],
        'Пушкино': ['пушкино', 'пушкинский', 'г. пушкино'],
        'Жуковский': ['жуковский', 'г. жуковский'],
        'Химки': ['химки', 'химкинский', 'г. химки'],
        'Люберцы': ['люберцы', 'люберецкий', 'г. люберцы'],
        'Домодедово': ['домодедово', 'домодедовский', 'г. домодедово'],
        'Видное': ['видное', 'видновский', 'г. видное'],
        'Раменское': ['раменское', 'раменский', 'г. раменское'],
        'Коломна': ['коломна', 'коломенский', 'г. коломна'],
        'Орехово-Зуево': ['орехово-зуево', 'орехово-зуевский', 'г. орехово-зуево'],
    }
    
    # Проверяем известные города
    for city, patterns in city_patterns.items():
        for pattern in patterns:
            if pattern in addr_lower:
                return city
    
    # Если не нашли известный город, пробуем извлечь через регулярки
    patterns = [
        r'г\.?\s*([А-Яа-яЁё\-]+)',      # г. Москва
        r'город\s*([А-Яа-яЁё\-]+)',     # город Москва
        r'гор\.?\s*([А-Яа-яЁё\-]+)',    # гор. Москва
        r'([А-Яа-яЁё\-]+)\s*г\.',       # Москва г.
        r'пос\.?\s*([А-Яа-яЁё\-]+)',    # пос. Калиново
        r'п\.?\s*([А-Яа-яЁё\-]+)',      # п. Калиново
        r'дер\.?\s*([А-Яа-яЁё\-]+)',    # дер. Иваново
        r'село\s*([А-Яа-яЁё\-]+)',      # село Иваново
        r'д\.?\s*([А-Яа-яЁё\-]+)',       # д. Калиново
    ]
    
    for pattern in patterns:
        match = re.search(pattern, addr, re.IGNORECASE)
        if match:
            city = match.group(1).strip().title()
            # Проверяем, что это не общие слова
            common_words = ['улица', 'дом', 'корпус', 'строение', 'офис', 
                           'павильон', 'рынок', 'торговый', 'центр', 'база']
            if (len(city) > 2 and 
                city.lower() not in common_words and
                not city.isdigit()):
                return city
    
    return None

def load_excel_data(file_path):
    """Загружает данные из Excel файла"""
    try:
        print(f"📂 Загрузка файла: {file_path}")
        
        # Пробуем разные имена листов
        xls = pd.ExcelFile(file_path)
        sheet_names = xls.sheet_names
        
        print(f"   Доступные листы: {', '.join(sheet_names)}")
        
        # Ищем основной лист с клиентами
        target_sheet = None
        for sheet in sheet_names:
            sheet_lower = sheet.lower()
            if any(keyword in sheet_lower for keyword in ['лист1', 'клиент', 'data', 'основная']):
                target_sheet = sheet
                break
        
        if not target_sheet:
            target_sheet = sheet_names[0]  # Берем первый лист
        
        print(f"   Используем лист: {target_sheet}")
        
        # Загружаем данные
        df = pd.read_excel(file_path, sheet_name=target_sheet)
        print(f"   Загружено строк: {len(df)}")
        
        # Заменяем NaN на пустые строки
        df = df.fillna('')
        
        # Приводим названия колонок к стандартному виду
        column_mapping = {}
        for col in df.columns:
            col_str = str(col).strip()
            # Стандартизируем названия колонок
            if 'код' in col_str.lower():
                column_mapping[col] = 'Код'
            elif 'наимен' in col_str.lower():
                column_mapping[col] = 'Наименование'
            elif 'сегмент' in col_str.lower() and 'кб' in col_str.lower():
                column_mapping[col] = 'Сегментация КБ'
            elif 'бизнес' in col_str.lower() and 'регион' in col_str.lower():
                column_mapping[col] = 'Бизнес-регион'
            elif 'вид биз' in col_str.lower():
                column_mapping[col] = 'Вид бизнеса'
            elif 'товар' in col_str.lower() and 'групп' in col_str.lower():
                column_mapping[col] = 'Товарная группа'
            elif 'направл' in col_str.lower():
                column_mapping[col] = 'Направление'
            elif 'адрес' in col_str.lower():
                column_mapping[col] = 'Адрес'
            elif 'зона' in col_str.lower():
                column_mapping[col] = 'Зона доставки'
        
        if column_mapping:
            df = df.rename(columns=column_mapping)
            print(f"   Переименовано колонок: {len(column_mapping)}")
        
        return df, target_sheet
        
    except Exception as e:
        print(f"❌ Ошибка при загрузке Excel: {e}")
        return None, None

def extract_filter_values(df):
    """Извлекает уникальные значения для фильтров"""
    filters_data = {}
    
    # 1. Код (уникальные значения, первые 3 цифры для группировки)
    if 'Код' in df.columns:
        codes = set()
        for code in df['Код']:
            if pd.notna(code) and code != '':
                code_str = str(code).strip()
                # Оставляем только цифры
                digits = ''.join(filter(str.isdigit, code_str))
                if digits:
                    # Берем первые 3 цифры для группировки
                    if len(digits) >= 3:
                        group_code = digits[:3] + 'XX'
                    else:
                        group_code = digits.ljust(3, 'X')
                    codes.add(group_code)
        
        if codes:
            filters_data['Код'] = sorted(codes)
    
    # 2. Наименование (первые слова для группировки)
    if 'Наименование' in df.columns:
        names = set()
        for name in df['Наименование']:
            if pd.notna(name) and name != '':
                name_str = str(name).strip()
                # Берем первые слова до цифр или скобок
                match = re.match(r'^([^\d\(\)]+)', name_str)
                if match:
                    first_part = match.group(1).strip()
                    if len(first_part) > 3:
                        names.add(first_part)
        
        if names:
            filters_data['Наименование'] = sorted(names)[:30]  # первые 30
    
    # 3. Сегментация КБ
    if 'Сегментация КБ' in df.columns:
        segments = set()
        for seg in df['Сегментация КБ']:
            if pd.notna(seg) and seg != '':
                seg_str = str(seg).strip()
                if seg_str:
                    segments.add(seg_str)
        
        if segments:
            filters_data['Сегментация КБ'] = sorted(segments)
    
    # 4. Бизнес-регион
    if 'Бизнес-регион' in df.columns:
        regions = set()
        for reg in df['Бизнес-регион']:
            if pd.notna(reg) and reg != '':
                reg_str = str(reg).strip()
                if reg_str:
                    regions.add(reg_str)
        
        if regions:
            filters_data['Бизнес-регион'] = sorted(regions)
    
    # 5. Вид бизнеса
    if 'Вид бизнеса' in df.columns:
        businesses = set()
        for bus in df['Вид бизнеса']:
            if pd.notna(bus) and bus != '':
                bus_str = str(bus).strip()
                if bus_str:
                    businesses.add(bus_str)
        
        if businesses:
            filters_data['Вид бизнеса'] = sorted(businesses)
    
    # 6. Товарная группа
    if 'Товарная группа' in df.columns:
        products = set()
        for prod in df['Товарная группа']:
            if pd.notna(prod) and prod != '':
                prod_str = str(prod).strip()
                if prod_str:
                    products.add(prod_str)
        
        if products:
            filters_data['Товарная группа'] = sorted(products)
    
    # 7. Зона доставки (если есть, иначе используем Направление)
    if 'Зона доставки' in df.columns:
        zones = set()
        for zone in df['Зона доставки']:
            if pd.notna(zone) and zone != '':
                zone_str = str(zone).strip()
                if zone_str:
                    zones.add(zone_str)
        
        if zones:
            filters_data['Зона'] = sorted(zones)
    elif 'Направление' in df.columns:
        directions = set()
        for dir_val in df['Направление']:
            if pd.notna(dir_val) and dir_val != '':
                dir_str = str(dir_val).strip()
                if dir_str:
                    directions.add(dir_str)
        
        if directions:
            filters_data['Зона'] = sorted(directions)
    
    # 8. Направление
    if 'Направление' in df.columns:
        directions = set()
        for dir_val in df['Направление']:
            if pd.notna(dir_val) and dir_val != '':
                dir_str = str(dir_val).strip()
                if dir_str:
                    directions.add(dir_str)
        
        if directions:
            filters_data['Направление'] = sorted(directions)
    
    # 9. Адрес (города)
    if 'Адрес' in df.columns:
        cities = set()
        for addr in df['Адрес']:
            city = extract_city_from_address(addr)
            if city:
                cities.add(city)
        
        if cities:
            filters_data['Адрес'] = sorted(cities)
        else:
            # Если не удалось извлечь города, используем короткие адреса
            short_addrs = set()
            for addr in df['Адрес']:
                if pd.notna(addr) and addr != '':
                    addr_str = str(addr).strip()
                    if addr_str and len(addr_str) > 5:
                        # Берем первую часть адреса
                        parts = addr_str.split(',')
                        if parts:
                            short_addr = parts[0].strip()[:30]
                            if short_addr:
                                short_addrs.add(short_addr)
            
            if short_addrs:
                filters_data['Адрес'] = sorted(short_addrs)[:20]
    
    return filters_data

def create_js_file(filters_data, sheet_name):
    """Создает JavaScript файл с фильтрами"""
    
    js_template = f"""// ============================================================================
// ДИНАМИЧЕСКИЕ ФИЛЬТРЫ CRM ВЕРТУМ
// Автоматически сгенерировано из Excel файла
// Лист данных: {sheet_name}
// Время генерации: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
// ============================================================================

// Глобальные настройки фильтров
const CRM_FILTERS = {{
    version: '1.0',
    sheetName: '{sheet_name}',
    filters: {json.dumps(filters_data, ensure_ascii=False, indent=4)},
    lastUpdate: new Date().toISOString()
}};

// ============================================================================
// ОСНОВНЫЕ ФУНКЦИИ ФИЛЬТРАЦИИ
// ============================================================================

/**
 * Инициализирует систему фильтров
 */
function initFiltersSystem() {{
    console.log('🔧 Инициализация системы фильтров CRM...');
    
    // Ждем загрузки данных клиентов
    waitForClientsData().then(() => {{
        createFilterControls();
        setupSearchIntegration();
        applyInitialFilters();
        console.log('✅ Система фильтров готова');
    }}).catch(error => {{
        console.error('❌ Ошибка инициализации фильтров:', error);
        showFilterError('Не удалось загрузить данные для фильтрации');
    }});
}}

/**
 * Ожидает загрузки данных клиентов
 */
function waitForClientsData() {{
    return new Promise((resolve, reject) => {{
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkInterval = setInterval(() => {{
            attempts++;
            
            // Проверяем наличие данных
            if (window.allClientsData && Array.isArray(window.allClientsData) && window.allClientsData.length > 0) {{
                clearInterval(checkInterval);
                console.log(`📊 Данные клиентов загружены: ${{window.allClientsData.length}} записей`);
                resolve(window.allClientsData);
            }} 
            // Проверяем наличие данных из Excel
            else if (window.excelRealData && window.excelRealData['{sheet_name}']) {{
                clearInterval(checkInterval);
                const excelData = window.excelRealData['{sheet_name}'];
                console.log(`📊 Excel данные загружены: ${{excelData.length}} записей`);
                window.allClientsData = excelData;
                resolve(excelData);
            }}
            else if (attempts >= maxAttempts) {{
                clearInterval(checkInterval);
                reject(new Error('Данные клиентов не загрузились'));
            }}
        }}, 100);
    }});
}}

/**
 * Создает элементы управления фильтрами
 */
function createFilterControls() {{
    const filtersGrid = document.getElementById('filtersGrid');
    if (!filtersGrid) {{
        console.warn('Элемент filtersGrid не найден');
        return;
    }}
    
    filtersGrid.innerHTML = '';
    
    // Определяем доступные фильтры на основе данных
    const availableFilters = getAvailableFilters();
    
    // Создаем фильтры по порядку
    const filterOrder = [
        {{ id: 'code', label: 'Код', key: 'Код' }},
        {{ id: 'name', label: 'Наименование', key: 'Наименование' }},
        {{ id: 'segment', label: 'Сегментация КБ', key: 'Сегментация КБ' }},
        {{ id: 'region', label: 'Бизнес-регион', key: 'Бизнес-регион' }},
        {{ id: 'business', label: 'Вид бизнеса', key: 'Вид бизнеса' }},
        {{ id: 'product', label: 'Товарная группа', key: 'Товарная группа' }},
        {{ id: 'zone', label: 'Зона доставки', key: 'Зона' }},
        {{ id: 'direction', label: 'Направление', key: 'Направление' }},
        {{ id: 'address', label: 'Адрес', key: 'Адрес' }}
    ];
    
    filterOrder.forEach((filterConfig, index) => {{
        const filterKey = filterConfig.key;
        const filterValues = CRM_FILTERS.filters[filterKey];
        
        // Пропускаем фильтр, если нет данных
        if (!filterValues || !Array.isArray(filterValues) || filterValues.length === 0) {{
            return;
        }}
        
        // Создаем контейнер фильтра
        const filterDiv = document.createElement('div');
        filterDiv.className = 'filter-item';
        filterDiv.dataset.filterId = filterConfig.id;
        
        // Создаем label
        const label = document.createElement('label');
        label.textContent = filterConfig.label;
        label.title = `Фильтр по ${{filterConfig.label.toLowerCase()}}`;
        
        // Создаем select
        const select = document.createElement('select');
        select.className = 'filter-select';
        select.id = `filter_${{filterConfig.id}}`;
        select.dataset.filterKey = filterKey;
        
        // Опция "Все"
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = `-- Все ${{filterConfig.label}} --`;
        select.appendChild(allOption);
        
        // Добавляем значения
        filterValues.forEach(value => {{
            if (value && value.toString().trim()) {{
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value.length > 35 ? value.substring(0, 35) + '...' : value;
                option.title = value; // Полный текст при наведении
                select.appendChild(option);
            }}
        }});
        
        // Добавляем счетчик
        const counterSpan = document.createElement('span');
        counterSpan.className = 'filter-counter';
        counterSpan.textContent = `(${{filterValues.length}})`;
        counterSpan.style.cssText = 'margin-left: 5px; font-size: 11px; color: #667eea;';
        
        label.appendChild(counterSpan);
        
        // Обработчик изменения
        select.addEventListener('change', function() {{
            onFilterChange();
            highlightActiveFilter(this);
        }});
        
        // Добавляем элементы в DOM
        filterDiv.appendChild(label);
        filterDiv.appendChild(select);
        filtersGrid.appendChild(filterDiv);
    }});
    
    // Добавляем кнопки управления фильтрами
    addFilterControls();
}}

/**
 * Определяет доступные фильтры на основе данных
 */
function getAvailableFilters() {{
    if (!window.allClientsData || window.allClientsData.length === 0) {{
        return [];
    }}
    
    const firstItem = window.allClientsData[0];
    const availableKeys = Object.keys(firstItem);
    
    // Возвращаем только те фильтры, для которых есть данные
    return Object.keys(CRM_FILTERS.filters).filter(key => {{
        const values = CRM_FILTERS.filters[key];
        return values && Array.isArray(values) && values.length > 0;
    }});
}}

/**
 * Добавляет кнопки управления фильтрами
 */
function addFilterControls() {{
    const filtersGrid = document.getElementById('filtersGrid');
    if (!filtersGrid) return;
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'filter-controls';
    controlsDiv.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        gap: 10px;
        margin-top: 10px;
        padding-top: 15px;
        border-top: 2px solid #e9ecef;
    `;
    
    // Кнопка сброса фильтров
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '❌ Сбросить все фильтры';
    resetBtn.className = 'filter-control-btn';
    resetBtn.style.cssText = `
        padding: 8px 15px;
        background: #f8f9fa;
        border: 2px solid #dc3545;
        border-radius: 8px;
        color: #dc3545;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    `;
    resetBtn.onmouseover = () => {{
        resetBtn.style.background = '#dc3545';
        resetBtn.style.color = 'white';
    }};
    resetBtn.onmouseout = () => {{
        resetBtn.style.background = '#f8f9fa';
        resetBtn.style.color = '#dc3545';
    }};
    resetBtn.onclick = resetAllFilters;
    
    // Кнопка применения
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '✅ Применить фильтры';
    applyBtn.className = 'filter-control-btn';
    applyBtn.style.cssText = `
        padding: 8px 15px;
        background: #4CAF50;
        border: 2px solid #4CAF50;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    `;
    applyBtn.onclick = applyAllFilters;
    
    controlsDiv.appendChild(resetBtn);
    controlsDiv.appendChild(applyBtn);
    filtersGrid.appendChild(controlsDiv);
}}

/**
 * Подсвечивает активный фильтр
 */
function highlightActiveFilter(selectElement) {{
    // Снимаем подсветку со всех
    document.querySelectorAll('.filter-select').forEach(select => {{
        select.parentElement.style.background = 'transparent';
    }});
    
    // Подсвечиваем активный
    if (selectElement.value) {{
        selectElement.parentElement.style.background = '#e8f5e9';
        selectElement.parentElement.style.borderRadius = '8px';
        selectElement.parentElement.style.padding = '5px';
    }}
}}

/**
 * Обработчик изменения фильтра
 */
function onFilterChange() {{
    // Показываем индикатор загрузки
    showFilterLoading(true);
    
    // Небольшая задержка для группировки быстрых изменений
    clearTimeout(window.filterTimeout);
    window.filterTimeout = setTimeout(() => {{
        applyAllFilters();
        showFilterLoading(false);
    }}, 300);
}}

/**
 * Применяет все активные фильтры
 */
function applyAllFilters() {{
    if (!window.allClientsData) {{
        console.warn('Нет данных для фильтрации');
        return;
    }}
    
    let filteredData = [...window.allClientsData];
    const activeFilters = [];
    
    // Собираем активные фильтры
    document.querySelectorAll('.filter-select').forEach(select => {{
        if (select.value && select.value.trim() !== '') {{
            const filterKey = select.dataset.filterKey;
            const filterValue = select.value;
            
            if (filterKey && filterValue) {{
                activeFilters.push({{
                    key: filterKey,
                    value: filterValue,
                    label: select.parentElement.querySelector('label').textContent
                }});
                
                // Применяем фильтр
                filteredData = filteredData.filter(item => {{
                    const itemValue = item[filterKey];
                    if (!itemValue) return false;
                    
                    const strValue = String(itemValue).toLowerCase();
                    const filterStr = filterValue.toLowerCase();
                    
                    return strValue.includes(filterStr);
                }});
            }}
        }}
    }});
    
    // Обновляем глобальную переменную
    window.filteredClientsData = filteredData;
    
    // Обновляем интерфейс
    updateFilterResults(filteredData, activeFilters);
    
    // Сохраняем состояние фильтров
    saveFilterState();
}}

/**
 * Обновляет результаты фильтрации
 */
function updateFilterResults(filteredData, activeFilters = []) {{
    // Обновляем счетчик
    const counterElement = document.getElementById('filteredCount');
    if (counterElement) {{
        if (activeFilters.length > 0) {{
            const filterText = activeFilters.map(f => `${{f.label}}: ${{f.value}}`).join(', ');
            counterElement.innerHTML = `
                <span style="color: #4CAF50;">✓</span>
                Найдено: <strong>${{filteredData.length}}</strong> клиентов
                <span style="font-size: 12px; color: #666; margin-left: 10px;">
                    (Фильтры: ${{filterText}})
                </span>
            `;
        }} else {{
            counterElement.innerHTML = `
                Всего: <strong>${{filteredData.length}}</strong> клиентов
                <span style="font-size: 12px; color: #666; margin-left: 10px;">
                    (Фильтры не применены)
                </span>
            `;
        }}
    }}
    
    // Обновляем таблицу если функция существует
    if (typeof window.loadClientsTable === 'function') {{
        window.currentPage = 1; // Сбрасываем на первую страницу
        window.loadClientsTable();
    }}
    
    // Показываем уведомление
    if (activeFilters.length > 0) {{
        showFilterNotification(`Применено ${{activeFilters.length}} фильтров. Найдено: ${{filteredData.length}} записей`);
    }}
}}

/**
 * Сбрасывает все фильтры
 */
function resetAllFilters() {{
    document.querySelectorAll('.filter-select').forEach(select => {{
        select.value = '';
        select.parentElement.style.background = 'transparent';
    }});
    
    applyAllFilters();
    showFilterNotification('Все фильтры сброшены');
}}

/**
 * Применяет начальные фильтры
 */
function applyInitialFilters() {{
    // Проверяем сохраненное состояние
    const savedState = loadFilterState();
    if (savedState) {{
        // Восстанавливаем значения фильтров
        Object.entries(savedState).forEach(([filterId, value]) => {{
            const select = document.getElementById(`filter_${{filterId}}`);
            if (select && value) {{
                select.value = value;
            }}
        }});
    }}
    
    applyAllFilters();
}}

/**
 * Сохраняет состояние фильтров
 */
function saveFilterState() {{
    const state = {{}};
    
    document.querySelectorAll('.filter-select').forEach(select => {{
        if (select.value) {{
            const filterId = select.id.replace('filter_', '');
            state[filterId] = select.value;
        }}
    }});
    
    try {{
        localStorage.setItem('crm_filter_state', JSON.stringify(state));
    }} catch (e) {{
        console.warn('Не удалось сохранить состояние фильтров:', e);
    }}
}}

/**
 * Загружает сохраненное состояние фильтров
 */
function loadFilterState() {{
    try {{
        const saved = localStorage.getItem('crm_filter_state');
        return saved ? JSON.parse(saved) : null;
    }} catch (e) {{
        console.warn('Не удалось загрузить состояние фильтров:', e);
        return null;
    }}
}}

/**
 * Интегрирует фильтры с поиском
 */
function setupSearchIntegration() {{
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // Обработчик поиска
    searchInput.addEventListener('input', function() {{
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm) {{
            // Временно отключаем фильтры при поиске
            const searchResults = window.allClientsData.filter(item => {{
                return Object.values(item).some(value => {{
                    return String(value).toLowerCase().includes(searchTerm);
                }});
            }});
            
            window.filteredClientsData = searchResults;
            updateFilterResults(searchResults, [{{label: 'Поиск', value: searchTerm}}]);
            
            if (typeof window.loadClientsTable === 'function') {{
                window.loadClientsTable();
            }}
        }} else {{
            // Возвращаем фильтры при очистке поиска
            applyAllFilters();
        }}
    }});
}}

/**
 * Показывает индикатор загрузки
 */
function showFilterLoading(show) {{
    let loader = document.getElementById('filterLoader');
    
    if (show) {{
        if (!loader) {{
            loader = document.createElement('div');
            loader.id = 'filterLoader';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            `;
            loader.innerHTML = `
                <div class="spinner"></div>
                <div>Применение фильтров...</div>
            `;
            document.body.appendChild(loader);
            
            // Добавляем стили для спиннера
            const style = document.createElement('style');
            style.textContent = `
                .spinner {{
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }}
                @keyframes spin {{
                    0% {{ transform: rotate(0deg); }}
                    100% {{ transform: rotate(360deg); }}
                }}
            `;
            document.head.appendChild(style);
        }}
    }} else if (loader) {{
        loader.remove();
    }}
}}

/**
 * Показывает уведомление о фильтрации
 */
function showFilterNotification(message, type = 'info') {{
    const notification = document.createElement('div');
    notification.className = 'filter-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${{type === 'info' ? '#667eea' : type === 'success' ? '#4CAF50' : '#f44336'}};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-size: 14px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${{type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-circle'}}"></i>
            <span>${{message}}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {{
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }}, 3000);
    
    // Добавляем анимации если их нет
    if (!document.querySelector('#filter-animations')) {{
        const style = document.createElement('style');
        style.id = 'filter-animations';
        style.textContent = `
            @keyframes slideInRight {{
                from {{ transform: translateX(100%); opacity: 0; }}
                to {{ transform: translateX(0); opacity: 1; }}
            }}
            @keyframes slideOutRight {{
                from {{ transform: translateX(0); opacity: 1; }}
                to {{ transform: translateX(100%); opacity: 0; }}
            }}
        `;
        document.head.appendChild(style);
    }}
}}

/**
 * Показывает ошибку фильтрации
 */
function showFilterError(message) {{
    const filtersGrid = document.getElementById('filtersGrid');
    if (!filtersGrid) return;
    
    filtersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔧</div>
            <h3>Система фильтров временно недоступна</h3>
            <p>${{message}}</p>
            <button onclick="initFiltersSystem()" 
                    style="margin-top: 20px; padding: 10px 20px; 
                           background: #667eea; color: white; 
                           border: none; border-radius: 8px; 
                           cursor: pointer;">
                Попробовать снова
            </button>
        </div>
    `;
}}

// ============================================================================
// ЭКСПОРТ ФУНКЦИЙ
// ============================================================================

// Делаем функции доступными глобально
window.CRMFilters = {{
    init: initFiltersSystem,
    apply: applyAllFilters,
    reset: resetAllFilters,
    getState: loadFilterState,
    saveState: saveFilterState
}};

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {{
    // Небольшая задержка для загрузки основных скриптов
    setTimeout(initFiltersSystem, 500);
}});

console.log('🚀 Система динамических фильтров CRM загружена и готова к работе!');
"""
    
    return js_template

def main():
    """Основная функция"""
    print("\n" + "="*60)
    print("ГЕНЕРАТОР ДИНАМИЧЕСКИХ ФИЛЬТРОВ CRM ВЕРТУМ")
    print("="*60)
    
    # Проверяем наличие файла
    excel_file = "Хисматуллин КБ срм.xlsx"
    if not Path(excel_file).exists():
        print(f"\n❌ Файл '{excel_file}' не найден!")
        print("Пожалуйста, поместите Excel файл в текущую папку.")
        
        # Создаем демо-файл для тестирования
        print("\n📝 Создаю демо-файл для тестирования...")
        create_demo_excel()
        excel_file = "ДЕМО_данные_клиентов.xlsx"
    
    # Загружаем данные
    df, sheet_name = load_excel_data(excel_file)
    if df is None:
        print("❌ Не удалось загрузить данные")
        return
    
    # Извлекаем значения для фильтров
    print("\n🔍 Извлечение уникальных значений для фильтров...")
    filters_data = extract_filter_values(df)
    
    if not filters_data:
        print("❌ Не удалось извлечь данные для фильтров")
        return
    
    # Выводим статистику
    print("\n📊 СТАТИСТИКА ФИЛЬТРОВ:")
    print("-" * 40)
    total_values = 0
    for key, values in filters_data.items():
        count = len(values) if values else 0
        total_values += count
        print(f"  {key:<20} : {count:>4} значений")
        
        # Показываем примеры для небольших списков
        if count > 0 and count <= 10:
            examples = ', '.join([str(v) for v in values[:5]])
            print(f"    Примеры: {examples}")
    
    print("-" * 40)
    print(f"  Всего фильтров: {len(filters_data)}")
    print(f"  Всего значений: {total_values}")
    
    # Создаем JavaScript файл
    print("\n💾 Создание JavaScript файла...")
    js_content = create_js_file(filters_data, sheet_name)
    
    # Сохраняем файл
    output_file = "dynamic_filters.js"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\n✅ Файл '{output_file}' успешно создан!")
    print(f"✅ Размер файла: {Path(output_file).stat().st_size / 1024:.1f} КБ")
    print(f"✅ Лист данных: {sheet_name}")
    
    # Создаем файл с примерами данных для отладки
    create_sample_data_file(df, filters_data)
    
    print("\n" + "="*60)
    print("✨ ГЕНЕРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
    print("="*60)
    print("\n📋 Следующие шаги:")
    print("1. Убедитесь, что файл dynamic_filters.js в той же папке что и CRM")
    print("2. Система фильтров автоматически загрузится при открытии страницы")
    print("3. Фильтры будут синхронизированы с поиском и таблицей")
    print("\n💡 Для ручного вызова функций фильтрации используйте:")
    print("   - CRMFilters.init()    - инициализация")
    print("   - CRMFilters.apply()   - применение фильтров")
    print("   - CRMFilters.reset()   - сброс фильтров")

def create_demo_excel():
    """Создает демо Excel файл для тестирования"""
    data = {
        'Код': [780, 172, 245, 312, 456, 789],
        'Наименование': [
            '0780 Звонарев В. А. (Симферопольское ш)',
            '0172 Петросян Г. С. (Симферопольское ш.)',
            '0245 Иванов И. И. (Минское ш.)',
            '0312 Сидоров С. С. (Киевское ш.)',
            '0456 Кузнецов К. К. (Новорижское ш.)',
            '0789 Смирнов С. С. (Ленинградское ш.)'
        ],
        'Сегментация КБ': [
            '2.4 Стандарт за ЦКАД (Сантех и вент)',
            '2.2 Стандарт до ЦКАД (сантех и вент)',
            '3.1 Премиум до ЦКАД (вентиляция)',
            '1.3 Эконом за ЦКАД (сантехника)',
            '2.4 Стандарт за ЦКАД (Сантех и вент)',
            '3.2 Премиум за ЦКАД (вентиляция)'
        ],
        'Бизнес-регион': [
            'Серпухов г.о.',
            'Новомосковский АО',
            'Москва ЗАО',
            'Подольск г.о.',
            'Щелковский р-н',
            'Пушкинский р-н'
        ],
        'Вид бизнеса': [
            'Розничный Магазин (ДО)',
            'Розничный Магазин (ДО)',
            'Оптовый Склад',
            'Интернет-магазин',
            'Строительная компания',
            'Производство'
        ],
        'Товарная группа': [
            'Вентиляция ДО',
            'Вентиляция ДО',
            'Вентиляция опт',
            'Сантехника розница',
            'Сантехника опт',
            'Вентиляция производство'
        ],
        'Зона доставки': [
            'ЗАПАД - Среда, Суббота',
            'ЗАПАД - Среда, Суббота',
            'ЦЕНТР - Понедельник, Четверг',
            'ЮГ - Вторник, Пятница',
            'ВОСТОК - Понедельник, Четверг',
            'СЕВЕР - Вторник, Пятница'
        ],
        'Направление': [
            'Симферопольское ш.',
            'Симферопольское ш.',
            'Минское ш.',
            'Киевское ш.',
            'Новорижское ш.',
            'Ленинградское ш.'
        ],
        'Адрес': [
            'го Серпухов, д. Калиново, Калиновский строй рынок участок 202 А',
            'Щербинка, Симферопольское ш., д. 17, ТК "Удобный", пав. Г 13',
            'г. Москва, Минское ш., д. 25, стр. 1',
            'г. Подольск, ул. Киевская, д. 42',
            'Щелково, Носовихинское ш., д. 15',
            'г. Пушкино, Ярославское ш., д. 78'
        ]
    }
    
    df = pd.DataFrame(data)
    df.to_excel('ДЕМО_данные_клиентов.xlsx', index=False, sheet_name='Лист1')
    print("✅ Создан демо-файл: ДЕМО_данные_клиентов.xlsx")

def create_sample_data_file(df, filters_data):
    """Создает файл с примерами данных для отладки"""
    sample_data = {
        "metadata": {
            "total_records": len(df),
            "generated": pd.Timestamp.now().isoformat(),
            "filters_count": len(filters_data)
        },
        "filters_summary": {
            key: {
                "count": len(values),
                "sample": values[:5] if values else []
            } for key, values in filters_data.items()
        },
        "sample_records": []
    }
    
    # Добавляем несколько примеров записей
    for i in range(min(5, len(df))):
        record = {}
        for col in df.columns:
            record[col] = str(df.iloc[i][col])
        sample_data["sample_records"].append(record)
    
    # Сохраняем как JSON
    with open('filters_sample.json', 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    print(f"📄 Создан файл с примерами: filters_sample.json")

if __name__ == "__main__":
    main()