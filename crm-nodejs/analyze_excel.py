# Команда для анализа Excel файла в Python

# 1. Сначала установите pandas и openpyxl если нет:
# pip install pandas openpyxl

import pandas as pd
import os
from pathlib import Path

print("🔍 АНАЛИЗ EXCEL ФАЙЛА В PYTHON")
print("=" * 50)

# Путь к файлу
file_path = Path("C:/Projects/CRM_Full_System/crm-nodejs/database/срм база.xlsx")

if not file_path.exists():
    print(f"❌ Файл не найден: {file_path}")
    exit()

print(f"✅ Файл найден: {file_path}")
print(f"📏 Размер: {file_path.stat().st_size} байт")

# 2. Прочитаем информацию о листах
try:
    excel_file = pd.ExcelFile(file_path)
    print(f"\n📊 Листы в файле: {len(excel_file.sheet_names)}")
    for i, sheet in enumerate(excel_file.sheet_names, 1):
        print(f"   {i}. {sheet}")
    
    # 3. Прочитаем каждый лист
    for sheet_name in excel_file.sheet_names:
        print(f"\n🔍 Анализ листа: '{sheet_name}'")
        print("-" * 40)
        
        # Пробуем разные способы чтения
        try:
            # Способ 1: Чтение как есть
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            print(f"   • Размер: {df.shape[0]} строк, {df.shape[1]} столбцов")
            
            # Покажем первые строки
            print(f"   • Первые 5 строк (сырые данные):")
            for i in range(min(5, len(df))):
                # Фильтруем непустые значения
                non_empty = df.iloc[i].dropna()
                if len(non_empty) > 0:
                    print(f"     Строка {i+1}: {list(non_empty)}")
            
            # Поиск заголовков
            print(f"\n   🔎 Поиск заголовков:")
            for i in range(min(20, len(df))):
                row = df.iloc[i].astype(str).fillna('')
                # Ищем строку с текстовыми заголовками
                text_cells = row.str.contains(r'[а-яА-Я]', na=False).sum()
                if text_cells > 3:
                    print(f"     Возможные заголовки в строке {i+1}:")
                    headers = list(row)
                    for j, val in enumerate(headers):
                        if val and val.strip():
                            print(f"       Колонка {j}: '{val}'")
                    break
            
            # Поиск упоминаний ТП
            print(f"\n   👥 Поиск торговых представителей:")
            tp_keywords = ['Хитров', 'Кирилл', 'Хисмат', 'Рустам', 'Торговый', 'представитель', 'Менеджер']
            
            found_tp = []
            for col in df.columns:
                # Проверяем каждую ячейку в столбце
                for idx, cell in enumerate(df[col].astype(str)):
                    for keyword in tp_keywords:
                        if keyword.lower() in str(cell).lower():
                            found_tp.append({
                                'строка': idx + 1,
                                'колонка': col + 1,
                                'значение': str(cell)[:100],
                                'ключевое_слово': keyword
                            })
            
            if found_tp:
                print(f"     Найдено {len(found_tp)} упоминаний:")
                for tp in found_tp[:5]:  # Покажем первые 5
                    print(f"     • Строка {tp['строка']}, Колонка {tp['колонка']}: '{tp['значение']}'")
            else:
                print(f"     Упоминания ТП не найдены")
                
                # Покажем примеры данных
                print(f"\n   📋 Примеры данных (первые 10 непустых ячеек):")
                cell_count = 0
                for i in range(min(10, len(df))):
                    for j in range(min(10, len(df.columns))):
                        cell = df.iat[i, j]
                        if pd.notna(cell) and str(cell).strip():
                            print(f"     [{i+1},{j+1}]: {str(cell)[:50]}")
                            cell_count += 1
                            if cell_count >= 10:
                                break
                    if cell_count >= 10:
                        break
            
        except Exception as e:
            print(f"   ❌ Ошибка чтения листа: {e}")
    
    print("\n" + "=" * 50)
    print("💡 Дополнительные команды для анализа:")
    print("""
# 1. Экспорт в CSV для анализа
for sheet in excel_file.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet, header=None)
    df.to_csv(f'{sheet}_export.csv', index=False, header=False)
    print(f'Экспортирован {sheet}')

# 2. Поиск всех уникальных значений
all_values = []
for sheet in excel_file.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet, header=None)
    unique_vals = df.stack().dropna().unique()
    all_values.extend(unique_vals)

# 3. Поиск по шаблону
import re
for sheet in excel_file.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet, header=None)
    for i in range(len(df)):
        for j in range(len(df.columns)):
            cell = df.iat[i, j]
            if isinstance(cell, str) and re.search(r'[А-Я][а-я]+\s+[А-Я][а-я]+', cell):
                print(f'Найдено ФИО: {sheet}:{i+1},{j+1} = {cell}')
    """)
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()