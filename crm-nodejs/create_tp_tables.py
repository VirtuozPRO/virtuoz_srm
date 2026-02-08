# Создаем отдельные таблицы для Хитрова и Хисматуллина
import pandas as pd
from datetime import datetime

print("🎯 СОЗДАНИЕ ТАБЛИЦ ПО ТОРГОВЫМ ПРЕДСТАВИТЕЛЯМ")
print("=" * 60)

# Читаем данные с правильными заголовками
file_path = "database/срм база.xlsx"
df = pd.read_excel(file_path, sheet_name='Лист1', header=0)

print(f"✅ Загружено данных: {len(df)} строк, {len(df.columns)} столбцов")
print(f"📋 Столбцы: {list(df.columns)}")

# Переименуем столбец для удобства
df = df.rename(columns={'Торговый представитель.': 'Торговый_представитель'})

# Фильтруем данные
print("\n🔍 Фильтрация данных...")

# 1. Таблица ХИТРОВА
hitrov_mask = df['Торговый_представитель'].astype(str).str.contains('Хитров|Кирилл', case=False, na=False)
hitrov_df = df[hitrov_mask].copy()

print(f"👤 Клиентов Хитрова: {len(hitrov_df)}")

# 2. Таблица ХИСМАТУЛЛИНА
hismatullin_mask = df['Торговый_представитель'].astype(str).str.contains('Хисмат|Рустам', case=False, na=False)
hismatullin_df = df[hismatullin_mask].copy()

print(f"👤 Клиентов Хисматуллина: {len(hismatullin_df)}")

# 3. Клиенты без ТП или с другими ТП
other_mask = ~(hitrov_mask | hismatullin_mask)
other_df = df[other_mask].copy()

print(f"👤 Другие клиенты: {len(other_df)}")

# Создаем красивые таблицы с нужными колонками
columns_to_keep = [
    'Код', 
    'Наименование', 
    'Сегментация КБ',
    'Дата регистрации',
    'Обслуживается торговыми представителями',
    'Бизнес-регион',
    'Основной менеджер',
    'Торговый_представитель',
    'Вид бизнеса',
    'Основная товарная группа',
    'Адрес'
]

# Таблица Хитрова
if len(hitrov_df) > 0:
    hitrov_table = hitrov_df[columns_to_keep].copy()
    hitrov_table = hitrov_table.sort_values('Наименование')
    
    print("\n📊 ТАБЛИЦА ХИТРОВА КИРИЛЛА:")
    print("-" * 60)
    print(hitrov_table[['Код', 'Наименование', 'Бизнес-регион', 'Основная товарная группа']].to_string(index=False))

# Таблица Хисматуллина
if len(hismatullin_df) > 0:
    hismatullin_table = hismatullin_df[columns_to_keep].copy()
    hismatullin_table = hismatullin_table.sort_values('Наименование')
    
    print("\n📊 ТАБЛИЦА ХИСМАТУЛЛИНА РУСТАМА:")
    print("-" * 60)
    print(hismatullin_table[['Код', 'Наименование', 'Бизнес-регион', 'Основная товарная группа']].to_string(index=False))

# Статистика
print("\n📈 СТАТИСТИКА:")
print("-" * 40)

# По регионам
if len(hitrov_df) > 0:
    print("\n🏙️  РЕГИОНЫ ХИТРОВА:")
    region_stats = hitrov_df['Бизнес-регион'].value_counts()
    for region, count in region_stats.items():
        print(f"   • {region}: {count} клиентов")

if len(hismatullin_df) > 0:
    print("\n🏙️  РЕГИОНЫ ХИСМАТУЛЛИНА:")
    region_stats = hismatullin_df['Бизнес-регион'].value_counts()
    for region, count in region_stats.items():
        print(f"   • {region}: {count} клиентов")

# По товарным группам
if len(hitrov_df) > 0:
    print("\n📦 ТОВАРНЫЕ ГРУППЫ ХИТРОВА:")
    product_stats = hitrov_df['Основная товарная группа'].value_counts()
    for product, count in product_stats.items():
        print(f"   • {product}: {count} клиентов")

if len(hismatullin_df) > 0:
    print("\n📦 ТОВАРНЫЕ ГРУППЫ ХИСМАТУЛЛИНА:")
    product_stats = hismatullin_df['Основная товарная группа'].value_counts()
    for product, count in product_stats.items():
        print(f"   • {product}: {count} клиентов")

# Экспорт в Excel
print("\n💾 ЭКСПОРТ В EXCEL...")

# Создаем Excel файл с несколькими листами
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_file = f"database/торговые_представители_{timestamp}.xlsx"

with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    if len(hitrov_df) > 0:
        hitrov_table.to_excel(writer, sheet_name='Хитров Кирилл', index=False)
        print(f"   ✅ Лист 'Хитров Кирилл': {len(hitrov_table)} строк")
    
    if len(hismatullin_df) > 0:
        hismatullin_table.to_excel(writer, sheet_name='Хисматуллин Рустам', index=False)
        print(f"   ✅ Лист 'Хисматуллин Рустам': {len(hismatullin_table)} строк")
    
    if len(other_df) > 0:
        other_table = other_df[columns_to_keep].copy()
        other_table.to_excel(writer, sheet_name='Другие клиенты', index=False)
        print(f"   ✅ Лист 'Другие клиенты': {len(other_table)} строк")
    
    # Сводный лист со статистикой
    summary_data = {
        'Показатель': ['Всего клиентов', 'Хитров Кирилл', 'Хисматуллин Рустам', 'Другие/Без ТП'],
        'Количество': [len(df), len(hitrov_df), len(hismatullin_df), len(other_df)],
        'Процент': [
            '100%',
            f'{len(hitrov_df)/len(df)*100:.1f}%',
            f'{len(hismatullin_df)/len(df)*100:.1f}%',
            f'{len(other_df)/len(df)*100:.1f}%'
        ]
    }
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_excel(writer, sheet_name='Сводка', index=False)
    print(f"   ✅ Лист 'Сводка' создан")

print(f"\n🎉 Файл сохранен: {output_file}")
print(f"📂 Размер файла: {pd.io.common.getsizeof(output_file) / 1024:.1f} KB")

# Показать несколько примеров из каждой таблицы
print("\n👥 ПРИМЕРЫ КЛИЕНТОВ:")
print("-" * 40)

if len(hitrov_df) > 0:
    print("\n🎯 ХИТРОВ (первые 3 клиента):")
    for idx, row in hitrov_df.head(3).iterrows():
        print(f"   • {row['Код']} - {row['Наименование']}")
        print(f"     Регион: {row['Бизнес-регион']}, Товар: {row['Основная товарная группа']}")

if len(hismatullin_df) > 0:
    print("\n🎯 ХИСМАТУЛЛИН (первые 3 клиента):")
    for idx, row in hismatullin_df.head(3).iterrows():
        print(f"   • {row['Код']} - {row['Наименование']}")
        print(f"     Регион: {row['Бизнес-регион']}, Товар: {row['Основная товарная группа']}")

print("\n✅ Готово! Таблицы созданы успешно!")