# update_tables.py
import pandas as pd
import os
from datetime import datetime

print("=== Генерация таблиц для index.html ===")

# Пути к файлам
excel_file = "Хисматуллин КБ срм.xlsx"
index_file = "index.html"
backup_file = f"index_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"

# Создаем резервную копию index.html
if os.path.exists(index_file):
    with open(index_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(original_content)
    print(f"✓ Создана резервная копия: {backup_file}")

# Читаем Excel
try:
    xls = pd.ExcelFile(excel_file)
    print(f"✓ Прочитан Excel файл: {excel_file}")
    print(f"  Листы: {xls.sheet_names}")
    
    # Генерируем HTML для каждого листа
    tables_html = {}
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        df = df.fillna('')  # Заменяем NaN на пустые строки
        
        # Определяем количество столбцов для настройки ширины
        num_columns = len(df.columns)
        col_width = f"{min(100, 1200 // max(1, num_columns))}px"
        
        # Создаем HTML таблицу с улучшенным стилем
        safe_sheet_name = sheet_name.replace(' ', '-')
        html = f'''
<!-- Таблица: {sheet_name} -->
<div class="excel-table-section" id="table-{safe_sheet_name}">
    <h3 class="table-title">{sheet_name}</h3>
    <p class="table-info">
        <span class="badge">📊 {len(df)} записей</span>
        <span class="badge">📋 {num_columns} столбцов</span>
        <span class="badge">🔄 Обновлено: {datetime.now().strftime('%d.%m.%Y %H:%M')}</span>
    </p>
    
    <div class="table-container">
        <table class="excel-data-table" data-sheet="{sheet_name}" style="min-width: {num_columns * 120}px">
            <thead>
                <tr>
        '''
        
        # Заголовки таблицы
        for col in df.columns:
            html += f'<th>{col}</th>\n'
        
        html += '''
                </tr>
            </thead>
            <tbody>
        '''
        
        # Данные таблицы
        for _, row in df.iterrows():
            html += '<tr>\n'
            for value in row:
                # Проверяем, является ли значение строкой с HTML
                if isinstance(value, str) and ('<' in value and '>' in value):
                    cell_content = value
                else:
                    cell_content = str(value)
                html += f'<td>{cell_content}</td>\n'
            html += '</tr>\n'
        
        html += '''
            </tbody>
        </table>
    </div>
</div>
<!-- Конец таблицы: {sheet_name} -->
        '''
        
        tables_html[sheet_name] = html
        print(f"✓ Сгенерирована таблица: '{sheet_name}' ({len(df)}x{num_columns})")
    
    # Читаем текущий index.html
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Находим место для вставки таблиц
    # Вариант 1: Если есть специальный комментарий для вставки
    if '<!-- EXCEL_TABLES -->' in content:
        # Собираем все таблицы в одну строку
        all_tables = '\n'.join(tables_html.values())
        # Заменяем комментарий на таблицы
        new_content = content.replace('<!-- EXCEL_TABLES -->', all_tables)
        
    # Вариант 2: Вставляем перед закрывающим </body>
    elif '</body>' in content:
        all_tables = '\n'.join([
            '<!-- НАЧАЛО ТАБЛИЦ ИЗ EXCEL -->',
            '<section class="excel-tables-container">',
            '<h2>📊 Данные из Excel файла</h2>',
            '<div class="sheet-navigation">'
        ])
        
        # Добавляем навигацию
        for i, sheet_name in enumerate(tables_html.keys()):
            safe_name = sheet_name.replace(' ', '-')
            all_tables += f'<button class="sheet-btn" data-target="table-{safe_name}">{sheet_name}</button>\n'
        
        all_tables += '</div>\n'
        all_tables += '\n'.join(tables_html.values())
        all_tables += '\n</section>\n<!-- КОНЕЦ ТАБЛИЦ ИЗ EXCEL -->\n'
        
        # Вставляем перед </body>
        new_content = content.replace('</body>', all_tables + '\n</body>')
        
    else:
        # Создаем новый index.html с таблицами
        new_content = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM Хисматуллин - Данные из Excel</title>
    <style>
        /* Стили для таблиц */
        .excel-tables-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .sheet-navigation {
            margin: 20px 0;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .sheet-btn {
            padding: 10px 20px;
            background: white;
            color: #333;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .sheet-btn:hover {
            background: #f0f0f0;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .sheet-btn.active {
            background: #4CAF50;
            color: white;
        }
        
        .excel-table-section {
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .table-title {
            color: #333;
            border-left: 5px solid #4CAF50;
            padding-left: 15px;
            margin-top: 0;
        }
        
        .table-info {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .badge {
            background: #e8f5e9;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9em;
            color: #2e7d32;
        }
        
        .table-container {
            overflow-x: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            max-height: 600px;
            overflow-y: auto;
        }
        
        .excel-data-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
        }
        
        .excel-data-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 15px;
            text-align: left;
            position: sticky;
            top: 0;
            font-weight: bold;
        }
        
        .excel-data-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
        }
        
        .excel-data-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .excel-data-table tr:hover {
            background-color: #f5f5f5;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .sheet-navigation {
                flex-direction: column;
            }
            
            .sheet-btn {
                width: 100%;
            }
            
            .excel-table-section {
                padding: 10px;
            }
            
            .excel-data-table th,
            .excel-data-table td {
                padding: 8px 10px;
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>CRM Хисматуллин</h1>
        <p>Данные из Excel файла: ''' + excel_file + '''</p>
        <p>Обновлено: ''' + datetime.now().strftime('%d.%m.%Y %H:%M') + '''</p>
    </header>
    
    <main class="excel-tables-container">
        <h2>📊 Все данные</h2>
        <p>Переключайтесь между листами Excel используя кнопки ниже:</p>
        
        <div class="sheet-navigation" id="sheetNavigation">
'''
        
        # Навигация
        for i, sheet_name in enumerate(tables_html.keys()):
            active_class = "active" if i == 0 else ""
            new_content += f'<button class="sheet-btn {active_class}" onclick="showTable(\'table-{sheet_name.replace(" ", "-")}\')">{sheet_name}</button>\n'
        
        new_content += '''
        </div>
        
        <!-- ВСТАВКА ТАБЛИЦ -->
'''
        new_content += '\n'.join(tables_html.values())
        
        new_content += '''
    </main>
    
    <footer style="text-align: center; padding: 20px; background: #333; color: white; margin-top: 40px;">
        <p>Автоматически сгенерировано из Excel • CRM Хисматуллин • ''' + datetime.now().strftime('%Y') + '''</p>
    </footer>
    
    <script>
        // Функция переключения таблиц
        function showTable(tableId) {
            // Скрываем все таблицы
            document.querySelectorAll('.excel-table-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Показываем выбранную таблицу
            const targetTable = document.getElementById(tableId);
            if (targetTable) {
                targetTable.style.display = 'block';
            }
            
            // Обновляем активные кнопки
            document.querySelectorAll('.sheet-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
        
        // Показываем первую таблицу при загрузке
        document.addEventListener('DOMContentLoaded', function() {
            const firstTable = document.querySelector('.excel-table-section');
            if (firstTable) {
                firstTable.style.display = 'block';
            }
            
            // Скрываем все таблицы кроме первой
            document.querySelectorAll('.excel-table-section:not(:first-child)').forEach(section => {
                section.style.display = 'none';
            });
        });
        
        // Поиск по таблицам
        function searchTables() {
            const searchTerm = document.getElementById('tableSearch').value.toLowerCase();
            
            document.querySelectorAll('.excel-data-table tbody tr').forEach(row => {
                let rowText = '';
                row.querySelectorAll('td').forEach(cell => {
                    rowText += cell.textContent.toLowerCase() + ' ';
                });
                
                if (rowText.includes(searchTerm)) {
                    row.style.display = '';
                    row.style.backgroundColor = '#fffde7';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
'''
    
    # Записываем обновленный файл
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✓ Успешно обновлен файл: {index_file}")
    print(f"✓ Добавлено {len(tables_html)} таблиц из Excel")
    print("\n📋 Статистика:")
    for sheet_name in tables_html.keys():
        df = pd.read_excel(xls, sheet_name=sheet_name)
        print(f"   • {sheet_name}: {len(df)} строк, {len(df.columns)} столбцов")
    
    print("\n🚀 Откройте index.html в браузере чтобы увидеть результат!")
    print("💡 Используйте кнопки для переключения между листами Excel")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    print("Проверьте:")
    print("1. Файл Excel находится в той же папке")
    print("2. Установлены библиотеки: pip install pandas openpyxl")