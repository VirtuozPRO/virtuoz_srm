# integrate_excel_to_crm.py
import pandas as pd
import json
import os

print("=== Интеграция данных Excel в CRM систему ===\n")

# Файлы
excel_file = "Хисматуллин КБ срм.xlsx"
index_file = "index.html"
database_file = "database.js"

# Читаем Excel
try:
    xls = pd.ExcelFile(excel_file)
    print(f"✓ Читаем Excel: {excel_file}")
    print(f"✓ Листы: {xls.sheet_names}")
    
    # Обрабатываем каждый лист
    all_data = {}
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        df = df.fillna('')
        
        # Преобразуем в список словарей
        records = df.to_dict('records')
        all_data[sheet_name] = records
        
        print(f"  • {sheet_name}: {len(records)} записей, {len(df.columns)} полей")
    
    # Читаем текущий database.js
    if os.path.exists(database_file):
        with open(database_file, 'r', encoding='utf-8') as f:
            db_content = f.read()
        
        # Ищем место для вставки Excel данных
        if '// EXCEL_DATA_START' in db_content and '// EXCEL_DATA_END' in db_content:
            # Создаем JSON данные
            excel_json = json.dumps(all_data, ensure_ascii=False, indent=2)
            
            # Формируем новое содержимое
            new_db_content = db_content.replace(
                '// EXCEL_DATA_START\n// EXCEL_DATA_END',
                f'// EXCEL_DATA_START\nconst excelData = {excel_json};\n// EXCEL_DATA_END'
            )
            
            # Записываем обновленный файл
            with open(database_file, 'w', encoding='utf-8') as f:
                f.write(new_db_content)
            
            print(f"\n✓ Данные Excel добавлены в {database_file}")
            print("✓ Данные доступны как переменная 'excelData'")
            
        else:
            # Добавляем секцию с данными Excel
            excel_json = json.dumps(all_data, ensure_ascii=False, indent=2)
            excel_section = f'''
// ============================================
// ДАННЫЕ ИЗ EXCEL ФАЙЛА
// Автоматически сгенерировано из: {excel_file}
// Дата обновления: {pd.Timestamp.now().strftime('%d.%m.%Y %H:%M:%S')}
// ============================================

// EXCEL_DATA_START
const excelData = {excel_json};
// EXCEL_DATA_END

// Функции для работы с Excel данными
function getExcelSheets() {{
    return Object.keys(excelData);
}}

function getExcelData(sheetName) {{
    return excelData[sheetName] || [];
}}

function getExcelSheetInfo(sheetName) {{
    const data = getExcelData(sheetName);
    if (data.length === 0) return {{ rows: 0, columns: 0 }};
    
    return {{
        rows: data.length,
        columns: Object.keys(data[0]).length,
        sheetName: sheetName
    }};
}}

function searchInExcelData(searchTerm, sheetName = null) {{
    const results = {{}};
    const term = searchTerm.toLowerCase();
    
    if (sheetName) {{
        // Поиск в конкретном листе
        const sheetData = getExcelData(sheetName);
        results[sheetName] = sheetData.filter(row => {{
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(term)
            );
        }});
    }} else {{
        // Поиск во всех листах
        for (const [name, data] of Object.entries(excelData)) {{
            results[name] = data.filter(row => {{
                return Object.values(row).some(value => 
                    String(value).toLowerCase().includes(term)
                );
            }});
        }}
    }}
    
    return results;
}}
'''
            
            # Добавляем в конец файла
            with open(database_file, 'a', encoding='utf-8') as f:
                f.write('\n\n' + excel_section)
            
            print(f"\n✓ Создана новая секция с данными Excel в {database_file}")
    
    # Обновляем index.html - добавляем вкладку для Excel данных
    with open(index_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Ищем секцию с вкладками (после "Быстрые действия")
    excel_tab_section = '''
            <!-- ВКЛАДКА EXCEL ДАННЫХ -->
            <div class="section-card" id="excelDataSection" style="display: none;">
                <div class="section-header">
                    <h2><i class="fas fa-file-excel"></i> Данные из Excel файла</h2>
                    <div class="section-actions">
                        <span class="counter-badge" id="excelCount">
                            Загружено: <strong>0</strong> записей
                        </span>
                        <div class="sheet-selector">
                            <select id="excelSheetSelect" class="form-select" onchange="loadExcelSheet()">
                                <option value="">Выберите лист...</option>
                            </select>
                        </div>
                        <button class="action-btn btn-success" onclick="exportExcelToCSV()">
                            <i class="fas fa-download"></i> Экспорт
                        </button>
                        <button class="action-btn btn-secondary" onclick="refreshExcelData()">
                            <i class="fas fa-sync-alt"></i> Обновить
                        </button>
                    </div>
                </div>

                <!-- Поиск в Excel данных -->
                <div class="search-box" style="margin-top: 15px;">
                    <input type="text" class="search-input" id="excelSearchInput"
                           placeholder="🔍 Поиск по всем листам Excel..."
                           oninput="searchExcelData()">
                </div>

                <!-- Навигация по листам -->
                <div class="excel-sheet-tabs" id="excelSheetTabs">
                    <!-- Вкладки листов загружаются динамически -->
                </div>

                <!-- Таблица Excel данных -->
                <div class="table-container">
                    <table class="excel-data-table" id="excelDataTable">
                        <thead id="excelTableHead">
                            <!-- Заголовки загружаются динамически -->
                        </thead>
                        <tbody id="excelTableBody">
                            <!-- Данные загружаются динамически -->
                        </tbody>
                    </table>
                </div>

                <div class="excel-info-panel">
                    <div class="excel-stats" id="excelStats">
                        <!-- Статистика загружается динамически -->
                    </div>
                </div>
            </div>
    '''
    
    # Добавляем кнопку в быстрые действия
    if '<div class="quick-actions">' in html_content:
        excel_button = '''
                <button class="quick-btn btn-excel" onclick="showSection(\'excelData\')">
                    <i class="fas fa-file-excel"></i>
                    <span>Данные Excel</span>
                </button>'''
        
        # Находим место для вставки перед последней кнопкой
        quick_actions_pos = html_content.find('<div class="quick-actions">')
        if quick_actions_pos != -1:
            # Ищем конец quick-actions
            end_pos = html_content.find('</div>', quick_actions_pos)
            if end_pos != -1:
                # Ищем последнюю кнопку в quick-actions
                last_btn_pos = html_content.rfind('</button>', quick_actions_pos, end_pos)
                if last_btn_pos != -1:
                    # Вставляем нашу кнопку после последней
                    new_html = (html_content[:last_btn_pos + 9] + 
                               excel_button + 
                               html_content[last_btn_pos + 9:])
                    html_content = new_html
    
    # Добавляем секцию Excel данных перед футером
    if '<footer class="crm-footer">' in html_content:
        footer_pos = html_content.find('<footer class="crm-footer">')
        new_html = (html_content[:footer_pos] + 
                   excel_tab_section + 
                   '\n\n    ' + 
                   html_content[footer_pos:])
        html_content = new_html
    
    # Добавляем CSS стили для Excel данных
    css_styles = '''
    <style>
    /* Стили для Excel вкладки */
    .btn-excel {
        background: linear-gradient(135deg, #217346 0%, #1e9c5a 100%);
    }
    
    .btn-excel:hover {
        background: linear-gradient(135deg, #1b5e3d 0%, #187c48 100%);
    }
    
    .sheet-selector {
        margin: 0 10px;
    }
    
    .form-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        font-size: 14px;
        min-width: 200px;
    }
    
    .excel-sheet-tabs {
        display: flex;
        gap: 5px;
        margin: 15px 0;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 5px;
        overflow-x: auto;
    }
    
    .excel-tab {
        padding: 8px 15px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }
    
    .excel-tab:hover {
        background: #f0f0f0;
    }
    
    .excel-tab.active {
        background: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }
    
    .excel-data-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .excel-data-table th {
        background: #2c3e50;
        color: white;
        padding: 12px;
        text-align: left;
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .excel-data-table td {
        padding: 10px 12px;
        border-bottom: 1px solid #eee;
    }
    
    .excel-data-table tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    .excel-data-table tr:hover {
        background-color: #f0f7ff;
    }
    
    .excel-info-panel {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    .excel-stats {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    
    .excel-stat-item {
        background: white;
        padding: 10px 15px;
        border-radius: 5px;
        border-left: 4px solid #4CAF50;
        min-width: 150px;
    }
    
    .excel-stat-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
    }
    
    .excel-stat-value {
        font-size: 18px;
        font-weight: bold;
        color: #333;
    }
    </style>
    '''
    
    # Добавляем стили в head
    if '</head>' in html_content:
        head_pos = html_content.find('</head>')
        html_content = html_content[:head_pos] + css_styles + html_content[head_pos:]
    
    # Сохраняем обновленный index.html
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✓ Обновлен {index_file}")
    print("✓ Добавлена вкладка 'Данные Excel'")
    
    # Создаем JavaScript функции для работы с Excel данными
    js_functions = '''
// Функции для работы с Excel данными
function showExcelDataSection() {
    showSection('excelData');
    initializeExcelData();
}

function initializeExcelData() {
    // Заполняем выпадающий список листами
    const sheetSelect = document.getElementById('excelSheetSelect');
    sheetSelect.innerHTML = '<option value="">Выберите лист...</option>';
    
    const sheets = getExcelSheets();
    sheets.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet;
        option.textContent = sheet;
        sheetSelect.appendChild(option);
    });
    
    // Создаем вкладки листов
    const tabsContainer = document.getElementById('excelSheetTabs');
    tabsContainer.innerHTML = '';
    
    sheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.className = 'excel-tab' + (index === 0 ? ' active' : '');
        tab.textContent = sheet;
        tab.onclick = () => loadExcelSheet(sheet);
        tabsContainer.appendChild(tab);
    });
    
    // Загружаем первый лист
    if (sheets.length > 0) {
        loadExcelSheet(sheets[0]);
    }
}

function loadExcelSheet(sheetName = null) {
    const sheetSelect = document.getElementById('excelSheetSelect');
    const selectedSheet = sheetName || sheetSelect.value;
    
    if (!selectedSheet) return;
    
    // Обновляем активную вкладку
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === selectedSheet) {
            tab.classList.add('active');
        }
    });
    
    // Загружаем данные
    const data = getExcelData(selectedSheet);
    const info = getExcelSheetInfo(selectedSheet);
    
    // Обновляем счетчик
    document.getElementById('excelCount').innerHTML = 
        `Загружено: <strong>${data.length}</strong> записей`;
    
    // Создаем таблицу
    const tableHead = document.getElementById('excelTableHead');
    const tableBody = document.getElementById('excelTableBody');
    
    // Очищаем таблицу
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 50px;">Нет данных</td></tr>';
        return;
    }
    
    // Создаем заголовки
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    
    // Заполняем данными
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            td.title = value; // Подсказка при наведении
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Показываем статистику
    const statsDiv = document.getElementById('excelStats');
    statsDiv.innerHTML = `
        <div class="excel-stat-item">
            <div class="excel-stat-label">Лист</div>
            <div class="excel-stat-value">${info.sheetName}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">Записей</div>
            <div class="excel-stat-value">${info.rows}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">Полей</div>
            <div class="excel-stat-value">${info.columns}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">Обновлено</div>
            <div class="excel-stat-value">${new Date().toLocaleDateString()}</div>
        </div>
    `;
}

function searchExcelData() {
    const searchTerm = document.getElementById('excelSearchInput').value;
    if (!searchTerm.trim()) {
        // Если поиск пустой, показываем текущий лист
        const activeTab = document.querySelector('.excel-tab.active');
        if (activeTab) {
            loadExcelSheet(activeTab.textContent);
        }
        return;
    }
    
    const results = searchInExcelData(searchTerm);
    const tableBody = document.getElementById('excelTableBody');
    const tableHead = document.getElementById('excelTableHead');
    
    // Очищаем таблицу
    tableBody.innerHTML = '';
    tableHead.innerHTML = '';
    
    let totalResults = 0;
    
    // Собираем все результаты
    for (const [sheetName, sheetResults] of Object.entries(results)) {
        if (sheetResults.length === 0) continue;
        
        totalResults += sheetResults.length;
        
        // Добавляем заголовок листа
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('td');
        headerCell.colSpan = 100;
        headerCell.innerHTML = `<strong style="color: #4CAF50;">📄 ${sheetName} (${sheetResults.length} записей)</strong>`;
        headerCell.style.backgroundColor = '#f0f7ff';
        headerCell.style.padding = '15px';
        headerRow.appendChild(headerCell);
        tableBody.appendChild(headerRow);
        
        // Добавляем заголовки столбцов (только для первого результата)
        if (tableHead.innerHTML === '' && sheetResults.length > 0) {
            const headRow = document.createElement('tr');
            Object.keys(sheetResults[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headRow.appendChild(th);
            });
            tableHead.appendChild(headRow);
        }
        
        // Добавляем данные
        sheetResults.forEach(row => {
            const tr = document.createElement('tr');
            
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                const strValue = String(value);
                
                // Подсвечиваем найденное слово
                if (searchTerm) {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    td.innerHTML = strValue.replace(regex, '<mark>$1</mark>');
                } else {
                    td.textContent = strValue;
                }
                
                td.title = strValue;
                tr.appendChild(td);
            });
            
            tableBody.appendChild(tr);
        });
    }
    
    if (totalResults === 0) {
        tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 50px;">Ничего не найдено</td></tr>';
    }
    
    // Обновляем счетчик
    document.getElementById('excelCount').innerHTML = 
        `Найдено: <strong>${totalResults}</strong> записей`;
}

function exportExcelToCSV() {
    const activeTab = document.querySelector('.excel-tab.active');
    if (!activeTab) return;
    
    const sheetName = activeTab.textContent;
    const data = getExcelData(sheetName);
    
    if (data.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    // Создаем CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Добавляем заголовки
    csvRows.push(headers.join(';'));
    
    // Добавляем данные
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Экранируем кавычки и точки с запятой
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    });
    
    const csvContent = csvRows.join('\\n');
    const blob = new Blob(['\\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel_${sheetName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function refreshExcelData() {
    if (confirm('Обновить данные из Excel файла? Требуется перезагрузка страницы.')) {
        location.reload();
    }
}
'''
    
    # Добавляем функции в script.js
    if os.path.exists('script.js'):
        with open('script.js', 'a', encoding='utf-8') as f:
            f.write('\n\n' + js_functions)
        print("✓ Добавлены функции для работы с Excel в script.js")
    
    print("\n✅ ИНТЕГРАЦИЯ ЗАВЕРШЕНА!")
    print("\n📋 Что было сделано:")
    print("1. Данные Excel добавлены в database.js")
    print("2. В index.html добавлена вкладка 'Данные Excel'")
    print("3. Добавлена кнопка в 'Быстрые действия'")
    print("4. Реализованы функции для работы с данными")
    print("\n🚀 Как использовать:")
    print("1. Откройте index.html в браузере")
    print("2. Нажмите кнопку 'Данные Excel' в быстрых действиях")
    print("3. Выберите лист из выпадающего списка")
    print("4. Используйте поиск и экспорт")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()