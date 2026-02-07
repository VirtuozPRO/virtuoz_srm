# fix_html_structure.py
print("Исправление структуры HTML...")

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Найдем и удалим неправильно вставленную секцию Excel
# Ищем начало и конец Excel секции
excel_start = content.find('<!-- ВКЛАДКА EXCEL ДАННЫХ -->')
if excel_start != -1:
    # Найдем закрывающий div этой секции
    # Ищем следующий закрывающий тег section-card
    temp_content = content[excel_start:]
    # Считаем открывающие div чтобы найти закрывающий
    div_count = 0
    pos = 0
    while pos < len(temp_content):
        if temp_content.startswith('<div', pos):
            div_count += 1
        elif temp_content.startswith('</div>', pos):
            div_count -= 1
            if div_count == 0:
                # Нашли закрывающий div для всей секции
                excel_end = excel_start + pos + 6
                # Удаляем эту секцию
                content = content[:excel_start] + content[excel_end:]
                print("✓ Удалена неправильно вставленная секция Excel")
                break
        pos += 1

# 2. Добавим кнопку Excel в главное меню
menu_grid_start = content.find('<div class="menu-grid">')
if menu_grid_start != -1:
    # Найдем конец menu-grid
    menu_grid_end = content.find('</div>', menu_grid_start)
    
    # Добавим кнопку Excel в menu-grid
    excel_button = '''
            <button class="menu-btn" onclick="showSection(\'excelData\')" data-section="excelData">
                <i class="fas fa-file-excel"></i>
                <div class="menu-count" id="excelDataCount">4</div>
                <div>ДАННЫЕ EXCEL</div>
                <small>Все листы из файла</small>
            </button>'''
    
    # Вставляем перед закрывающим div menu-grid
    new_content = (content[:menu_grid_end] + 
                   excel_button + 
                   '\n        ' + 
                   content[menu_grid_end:])
    content = new_content
    print("✓ Добавлена кнопка Excel в главное меню")

# 3. Добавим секцию Excel данных в правильное место (после clientsSection)
clients_section_end = content.find('</div>', content.find('id="clientsSection"'))
if clients_section_end != -1:
    # Создаем правильную секцию Excel
    excel_section = '''
        <!-- ВКЛАДКА EXCEL ДАННЫХ -->
        <div id="excelDataSection" class="section-card" style="display: none;">
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
            
            <div class="action-btns">
                <button class="action-btn btn-secondary" onclick="showSection('main')">
                    <i class="fas fa-arrow-left"></i> Назад в меню
                </button>
            </div>
        </div>
    '''
    
    # Вставляем после clientsSection
    insert_pos = content.find('</main>', clients_section_end)
    if insert_pos != -1:
        new_content = (content[:insert_pos] + 
                       '\n\n        ' + excel_section + 
                       '\n\n    ' + 
                       content[insert_pos:])
        content = new_content
        print("✓ Добавлена секция Excel в правильное место")

# 4. Обновим функцию showSection в script.js
# Сначала прочитаем script.js
try:
    with open('script.js', 'r', encoding='utf-8') as f:
        script_content = f.read()
    
    # Добавим обработку excelData секции
    if 'function showSection(sectionId)' in script_content:
        # Найдем функцию showSection
        func_start = script_content.find('function showSection(sectionId)')
        if func_start != -1:
            # Найдем конец функции
            func_end = script_content.find('\n}\n', func_start)
            if func_end != -1:
                # Добавим обработку excelData
                excel_case = '''
        case "excelData":
            document.getElementById("excelDataSection").style.display = "block";
            document.getElementById("clientsSection").style.display = "none";
            initializeExcelData(); // Инициализируем Excel данные
            break;'''
                
                # Вставляем после других case
                case_pos = script_content.find('case "clients":', func_start, func_end)
                if case_pos != -1:
                    # Ищем конец этого case
                    break_pos = script_content.find('break;', case_pos, func_end)
                    if break_pos != -1:
                        # Вставляем после этого break
                        new_script = (script_content[:break_pos + 6] + 
                                     excel_case + 
                                     script_content[break_pos + 6:])
                        with open('script.js', 'w', encoding='utf-8') as f:
                            f.write(new_script)
                        print("✓ Обновлена функция showSection в script.js")
except Exception as e:
    print(f"Не удалось обновить script.js: {e}")

# Сохраняем исправленный index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Исправления применены!")
print("\nОткройте index.html и нажмите на кнопку 'ДАННЫЕ EXCEL' в главном меню")