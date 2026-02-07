# excel_to_html.py
import pandas as pd
import os
from datetime import datetime

# Путь к вашему Excel файлу
excel_file = "Хисматуллин КБ срм.xlsx"
output_file = "excel_table.html"

print(f"Чтение файла: {excel_file}")

try:
    # Читаем Excel файл
    # Если нужно читать конкретный лист:
    # df = pd.read_excel(excel_file, sheet_name='Имя листа')
    
    # Читаем все листы
    xls = pd.ExcelFile(excel_file)
    print(f"Листы в файле: {xls.sheet_names}")
    
    # Создаем HTML с навигацией между листами
    html_parts = []
    
    # HTML шапка
    html_header = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Данные из Excel: {excel_file}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 100%;
            overflow-x: auto;
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .sheet-navigation {{
            margin: 20px 0;
            padding: 10px;
            background: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        .sheet-navigation button {{
            padding: 8px 16px;
            margin: 0 5px 5px 0;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }}
        .sheet-navigation button:hover {{
            background: #45a049;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
            position: sticky;
            top: 0;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        tr:hover {{
            background-color: #f1f1f1;
        }}
        .info {{
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            margin-top: 30px;
            padding: 10px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Данные из файла: {excel_file}</h1>
        <div class="info">
            <p><strong>Всего листов:</strong> {len(xls.sheet_names)}</p>
            <p><strong>Дата создания отчета:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</p>
        </div>
        
        <div class="sheet-navigation">
            <p><strong>Переключение между листами:</strong></p>
            <div id="buttons">
'''
    
    # Кнопки для навигации
    for i, sheet in enumerate(xls.sheet_names):
        html_header += f'                <button onclick="showSheet({i})">{sheet}</button>\n'
    
    html_header += '''            </div>
        </div>
'''
    
    html_parts.append(html_header)
    
    # Данные каждого листа
    for i, sheet_name in enumerate(xls.sheet_names):
        df = pd.read_excel(xls, sheet_name=sheet_name)
        
        # Преобразуем NaN в пустые строки
        df = df.fillna('')
        
        html_table = f'''
        <div id="sheet-{i}" class="sheet-content" style="display: {'block' if i == 0 else 'none'};">
            <h2>📄 Лист: "{sheet_name}"</h2>
            <p><strong>Записей:</strong> {len(df)} | <strong>Столбцов:</strong> {len(df.columns)}</p>
            {df.to_html(index=False, classes='data-table', border=0, escape=False)}
        </div>
        '''
        html_parts.append(html_table)
    
    # HTML подвал с JavaScript
    html_footer = f'''
        <div class="footer">
            Создано автоматически из Excel файла<br>
            Дата: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}
        </div>
    </div>
    
    <script>
        function showSheet(sheetIndex) {{
            // Скрываем все листы
            document.querySelectorAll('.sheet-content').forEach(div => {{
                div.style.display = 'none';
            }});
            
            // Показываем выбранный лист
            document.getElementById('sheet-' + sheetIndex).style.display = 'block';
            
            // Обновляем активную кнопку
            document.querySelectorAll('.sheet-navigation button').forEach((btn, index) => {{
                btn.style.background = index === sheetIndex ? '#2E7D32' : '#4CAF50';
            }});
        }}
        
        // Инициализация
        document.addEventListener('DOMContentLoaded', function() {{
            document.querySelector('.sheet-navigation button').style.background = '#2E7D32';
        }});
        
        // Автоматическая ширина столбцов
        document.querySelectorAll('td, th').forEach(cell => {{
            cell.style.minWidth = '100px';
        }});
    </script>
</body>
</html>'''
    
    html_parts.append(html_footer)
    
    # Сохраняем в файл
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(html_parts))
    
    print(f"✓ HTML файл успешно создан: {output_file}")
    print(f"✓ Обработано листов: {len(xls.sheet_names)}")
    print(f"✓ Откройте файл {output_file} в браузере")
    
    # Показать информацию о каждом листе
    print("\nИнформация по листам:")
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        print(f"  '{sheet_name}': {len(df)} строк, {len(df.columns)} столбцов")
        
except FileNotFoundError:
    print(f"❌ Ошибка: Файл '{excel_file}' не найден!")
    print("Убедитесь, что файл находится в той же папке:")
    print("C:\\Users\\hrs\\OneDrive\\Рабочий стол\\СРМ Хисматуллин\\")
except Exception as e:
    print(f"❌ Произошла ошибка: {e}")
    print("Проверьте, установлены ли библиотеки:")
    print("pip install pandas openpyxl")