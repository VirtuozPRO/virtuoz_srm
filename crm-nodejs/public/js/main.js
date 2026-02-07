// ========== Р“Р›РћР‘РђР›Р¬РќР«Р• РџР•Р Р•РњР•РќРќР«Р• ==========
let currentManager = 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ';
let currentPage = 1;
const itemsPerPage = 10;
let allClients = [];
let filteredClients = [];
let currentFilters = {
    code: '',
    name: '',
    segmentation: '',
    region: '',
    business: '',
    product: '',
    zone: '',
    direction: '',
    address: ''
};

// ========== РРќРР¦РРђР›РР—РђР¦РРЇ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('CRM Р’Р•Р РўРЈРњ Р·Р°РіСЂСѓР¶Р°РµС‚СЃСЏ...');
    
    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ С‚РµРєСѓС‰РµРіРѕ РјРµРЅРµРґР¶РµСЂР°
    selectManager(currentManager);
    
    // РћР±РЅРѕРІР»РµРЅРёРµ РґР°С‚С‹
    updateCurrentDate();
    
    // РЎРєСЂС‹РІР°РµРј РІСЃРµ СЂР°Р·РґРµР»С‹, РїРѕРєР°Р·С‹РІР°РµРј РіР»Р°РІРЅС‹Р№
    showSection('main');
    
    // Р”РѕР±Р°РІР»СЏРµРј РѕР±СЂР°Р±РѕС‚С‡РёРє РєР»РёРєР° РІРЅРµ РІС‹РїР°РґР°СЋС‰РµРіРѕ РјРµРЅСЋ
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('managersDropdown');
        const selector = document.getElementById('currentManager');
        
        if (!selector.contains(event.target) && dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    console.log('CRM Р’Р•Р РўРЈРњ СѓСЃРїРµС€РЅРѕ Р·Р°РіСЂСѓР¶РµРЅР°!');
});

// ========== РЈРџР РђР’Р›Р•РќРР• РњР•РќР•Р”Р–Р•Р РђРњР ==========
function toggleDropdown() {
    const dropdown = document.getElementById('managersDropdown');
    dropdown.classList.toggle('active');
}

function selectManager(managerKey) {
    console.log(`Р’С‹Р±СЂР°РЅ РјРµРЅРµРґР¶РµСЂ: ${managerKey}`);
    
    // РћР±РЅРѕРІР»СЏРµРј С‚РµРєСѓС‰РµРіРѕ РјРµРЅРµРґР¶РµСЂР°
    currentManager = managerKey;
    const manager = managers[managerKey];
    
    // РћР±РЅРѕРІР»СЏРµРј С€Р°РїРєСѓ
    document.getElementById('currentManagerName').textContent = manager.fullName;
    document.getElementById('currentManagerContacts').innerHTML = `
        ${manager.email} вЂў ${manager.phone}
    `;
    
    // РћР±РЅРѕРІР»СЏРµРј С„СѓС‚РµСЂ
    document.getElementById('footerManager').textContent = manager.fullName;
    document.getElementById('footerEmail').textContent = manager.email;
    document.getElementById('footerPhone').textContent = manager.phone;
    
    // РћР±РЅРѕРІР»СЏРµРј Р±Р°Р·Сѓ РґР°РЅРЅС‹С…
    allClients = [...manager.database];
    
    // Р—Р°РіСЂСѓР¶Р°РµРј РєР»РёРµРЅС‚РѕРІ РёР· localStorage
    loadClientsFromLocalStorage();
    
    filteredClients = [...allClients];
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ
    updateStatistics(manager.stats);
    
    // РћР±РЅРѕРІР»СЏРµРј С„РёР»СЊС‚СЂС‹
    updateFilters();
    
    // РћР±РЅРѕРІР»СЏРµРј С‚Р°Р±Р»РёС†Сѓ
    renderTable();
    
    // РћР±РЅРѕРІР»СЏРµРј Р±РµР№РґР¶ РІ СЂР°Р·РґРµР»Рµ РєР»РёРµРЅС‚РѕРІ
    document.getElementById('currentManagerBadge').textContent = 
        managerKey === 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ' ? 'РҐРёСЃРјР°С‚СѓР»Р»РёРЅ Р .РЁ.' : 'РҐРёС‚СЂРѕРІ Рљ.Р®.';
    
    // РћР±РЅРѕРІР»СЏРµРј Р°РєС‚РёРІРЅС‹Р№ СЌР»РµРјРµРЅС‚ РІ РІС‹РїР°РґР°СЋС‰РµРј РјРµРЅСЋ
    const dropdownItems = document.querySelectorAll('.manager-option');
    dropdownItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent.includes(manager.fullName)) {
            item.classList.add('active');
        }
    });
    
    // Р—Р°РєСЂС‹РІР°РµРј РІС‹РїР°РґР°СЋС‰РµРµ РјРµРЅСЋ
    document.getElementById('managersDropdown').classList.remove('active');
    
    // РџРѕРєР°Р·С‹РІР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ
    showNotification(`Р‘Р°Р·Р° РґР°РЅРЅС‹С… Р·Р°РіСЂСѓР¶РµРЅР°: ${manager.fullName}`, 'info');
}

function updateStatistics(stats) {
    document.getElementById('clientsCount').textContent = stats.totalClients;
    document.getElementById('statTotalClients').textContent = stats.totalClients;
}

function updateFilters() {
    const filtersGrid = document.getElementById('filtersGrid');
    
    // РЎРѕР±РёСЂР°РµРј СѓРЅРёРєР°Р»СЊРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РґР»СЏ С„РёР»СЊС‚СЂРѕРІ
    const uniqueValues = {
        codes: [...new Set(allClients.map(c => c.code))],
        names: [...new Set(allClients.map(c => c.name.split(' ')[0]))].filter(Boolean),
        segmentations: [...new Set(allClients.map(c => c.segmentation))],
        regions: [...new Set(allClients.map(c => c.region))],
        businesses: [...new Set(allClients.map(c => c.business))],
        products: [...new Set(allClients.map(c => c.product))],
        zones: [...new Set(allClients.map(c => c.zone))],
        directions: [...new Set(allClients.map(c => c.direction))],
        addresses: [...new Set(allClients.map(c => c.address.split(',')[0]))].filter(Boolean)
    };
    
    // РЎРѕР·РґР°РµРј HTML РґР»СЏ 9 С„РёР»СЊС‚СЂРѕРІ
    filtersGrid.innerHTML = `
        <!-- Р¤РР›Р¬РўР  1: РљРѕРґ -->
        <div class="filter-group">
            <label class="filter-label">РљРѕРґ РєР»РёРµРЅС‚Р°</label>
            <select class="filter-select" onchange="applyFilter('code', this.value)" id="filterCode">
                <option value="">Р’СЃРµ РєРѕРґС‹</option>
                ${uniqueValues.codes.map(code => `<option value="${code}">${code}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  2: РќР°РёРјРµРЅРѕРІР°РЅРёРµ -->
        <div class="filter-group">
            <label class="filter-label">РќР°РёРјРµРЅРѕРІР°РЅРёРµ</label>
            <select class="filter-select" onchange="applyFilter('name', this.value)" id="filterName">
                <option value="">Р’СЃРµ РЅР°Р·РІР°РЅРёСЏ</option>
                ${uniqueValues.names.map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  3: РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘ -->
        <div class="filter-group">
            <label class="filter-label">РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘</label>
            <select class="filter-select" onchange="applyFilter('segmentation', this.value)" id="filterSegmentation">
                <option value="">Р’СЃРµ СЃРµРіРјРµРЅС‚С‹</option>
                ${uniqueValues.segmentations.map(seg => `<option value="${seg}">${seg}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  4: Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ -->
        <div class="filter-group">
            <label class="filter-label">Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ</label>
            <select class="filter-select" onchange="applyFilter('region', this.value)" id="filterRegion">
                <option value="">Р’СЃРµ СЂРµРіРёРѕРЅС‹</option>
                ${uniqueValues.regions.map(region => `<option value="${region}">${region}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  5: Р’РёРґ Р±РёР·РЅРµСЃР° -->
        <div class="filter-group">
            <label class="filter-label">Р’РёРґ Р±РёР·РЅРµСЃР°</label>
            <select class="filter-select" onchange="applyFilter('business', this.value)" id="filterBusiness">
                <option value="">Р’СЃРµ РІРёРґС‹</option>
                ${uniqueValues.businesses.map(business => `<option value="${business}">${business}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  6: РўРѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР° -->
        <div class="filter-group">
            <label class="filter-label">РўРѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°</label>
            <select class="filter-select" onchange="applyFilter('product', this.value)" id="filterProduct">
                <option value="">Р’СЃРµ С‚РѕРІР°СЂС‹</option>
                ${uniqueValues.products.map(product => `<option value="${product}">${product}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  7: Р—РѕРЅР° РґРѕСЃС‚Р°РІРєРё -->
        <div class="filter-group">
            <label class="filter-label">Р—РѕРЅР° РґРѕСЃС‚Р°РІРєРё</label>
            <select class="filter-select" onchange="applyFilter('zone', this.value)" id="filterZone">
                <option value="">Р’СЃРµ Р·РѕРЅС‹</option>
                ${uniqueValues.zones.map(zone => `<option value="${zone}">${zone}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  8: РќР°РїСЂР°РІР»РµРЅРёРµ -->
        <div class="filter-group">
            <label class="filter-label">РќР°РїСЂР°РІР»РµРЅРёРµ</label>
            <select class="filter-select" onchange="applyFilter('direction', this.value)" id="filterDirection">
                <option value="">Р’СЃРµ РЅР°РїСЂР°РІР»РµРЅРёСЏ</option>
                ${uniqueValues.directions.map(dir => `<option value="${dir}">${dir}</option>`).join('')}
            </select>
        </div>

        <!-- Р¤РР›Р¬РўР  9: РђРґСЂРµСЃ -->
        <div class="filter-group">
            <label class="filter-label">РђРґСЂРµСЃ (РіРѕСЂРѕРґ)</label>
            <select class="filter-select" onchange="applyFilter('address', this.value)" id="filterAddress">
                <option value="">Р’СЃРµ Р°РґСЂРµСЃР°</option>
                ${uniqueValues.addresses.map(addr => `<option value="${addr}">${addr}</option>`).join('')}
            </select>
        </div>
    `;
    
    // РЎР±СЂР°СЃС‹РІР°РµРј С„РёР»СЊС‚СЂС‹
    currentFilters = {
        code: '',
        name: '',
        segmentation: '',
        region: '',
        business: '',
        product: '',
        zone: '',
        direction: '',
        address: ''
    };
}

// ========== Р¤РР›Р¬РўР РђР¦РРЇ Р РџРћРРЎРљ ==========
function applyFilter(filterType, value) {
    currentFilters[filterType] = value;
    filterTable();
}

function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // РџСЂРёРјРµРЅСЏРµРј РІСЃРµ С„РёР»СЊС‚СЂС‹
    filteredClients = allClients.filter(client => {
        // РџРѕРёСЃРє РїРѕ РІСЃРµРј РїРѕР»СЏРј
        if (searchTerm) {
            const searchable = [
                client.code,
                client.name,
                client.segmentation,
                client.region,
                client.business,
                client.product,
                client.zone,
                client.direction,
                client.address
            ].join(' ').toLowerCase();
            
            if (!searchable.includes(searchTerm)) {
                return false;
            }
        }
        
        // Р¤РёР»СЊС‚СЂС‹ РїРѕ РІС‹РїР°РґР°СЋС‰РёРј СЃРїРёСЃРєР°Рј
        for (const [key, value] of Object.entries(currentFilters)) {
            if (value && !client[key].includes(value)) {
                return false;
            }
        }
        
        return true;
    });
    
    // РЎР±СЂР°СЃС‹РІР°РµРј РЅР° РїРµСЂРІСѓСЋ СЃС‚СЂР°РЅРёС†Сѓ
    currentPage = 1;
    
    // РћР±РЅРѕРІР»СЏРµРј С‚Р°Р±Р»РёС†Сѓ
    renderTable();
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‡РµС‚С‡РёРє
    updateCounter();
}

function updateCounter() {
    const total = allClients.length;
    const filtered = filteredClients.length;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filtered);
    
    document.getElementById('filteredCount').innerHTML = `
        РџРѕРєР°Р·Р°РЅРѕ: <strong>${filtered}</strong> РёР· <strong>${total}</strong>
        ${filtered !== total ? ` (РЅР°Р№РґРµРЅРѕ ${filtered})` : ''}
    `;
}

// ========== РўРђР‘Р›РР¦Рђ Р РџРђР“РРќРђР¦РРЇ ==========
function renderTable() {
    const tbody = document.getElementById('clientsTableBody');
    const pagination = document.getElementById('pagination');
    
    // Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ С‚РµРєСѓС‰РµР№ СЃС‚СЂР°РЅРёС†С‹
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredClients.length);
    const pageClients = filteredClients.slice(startIndex, endIndex);
    
    // РћС‡РёС‰Р°РµРј С‚Р°Р±Р»РёС†Сѓ
    tbody.innerHTML = '';
    
    // Р—Р°РїРѕР»РЅСЏРµРј С‚Р°Р±Р»РёС†Сѓ
    pageClients.forEach((client, index) => {
        const rowNumber = startIndex + index + 1;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowNumber}</td>
            <td><strong>${client.code}</strong></td>
            <td>
                <div style="font-weight: 500;">${client.name}</div>
                <small style="color: ${client.priority === 'high' ? '#e53e3e' : client.priority === 'medium' ? '#d69e2e' : '#38a169'}">
                    ${client.priority === 'high' ? 'рџ”ґ Р’С‹СЃРѕРєРёР№ РїСЂРёРѕСЂРёС‚РµС‚' : 
                      client.priority === 'medium' ? 'рџџЎ РЎСЂРµРґРЅРёР№ РїСЂРёРѕСЂРёС‚РµС‚' : 'рџџў РќРёР·РєРёР№ РїСЂРёРѕСЂРёС‚РµС‚'}
                </small>
            </td>
            <td>${client.segmentation}</td>
            <td>${client.region}</td>
            <td>${client.business}</td>
            <td>
                <span class="product-badge">${client.product}</span>
            </td>
            <td>${client.direction}</td>
            <td>
                <div style="font-size: 13px; color: #4a5568;">${client.address}</div>
                ${client.zone ? `<div style="font-size: 12px; color: #718096; margin-top: 4px;">${client.zone}</div>` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Р•СЃР»Рё РЅРµС‚ РґР°РЅРЅС‹С…
    if (filteredClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; display: block; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 10px;">РљР»РёРµРЅС‚С‹ РЅРµ РЅР°Р№РґРµРЅС‹</h3>
                    <p>РџРѕРїСЂРѕР±СѓР№С‚Рµ РёР·РјРµРЅРёС‚СЊ РїР°СЂР°РјРµС‚СЂС‹ РїРѕРёСЃРєР° РёР»Рё С„РёР»СЊС‚СЂС‹</p>
                </td>
            </tr>
        `;
    }
    
    // РћР±РЅРѕРІР»СЏРµРј РїР°РіРёРЅР°С†РёСЋ
    renderPagination(pagination, filteredClients.length);
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‡РµС‚С‡РёРє
    updateCounter();
}

function renderPagination(container, totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // РљРЅРѕРїРєР° "РќР°Р·Р°Рґ"
    html += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // РќРѕРјРµСЂР° СЃС‚СЂР°РЅРёС†
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // РџРµСЂРІР°СЏ СЃС‚СЂР°РЅРёС†Р°
    if (startPage > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }
    
    // РћСЃРЅРѕРІРЅС‹Рµ СЃС‚СЂР°РЅРёС†С‹
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${currentPage === i ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // РџРѕСЃР»РµРґРЅСЏСЏ СЃС‚СЂР°РЅРёС†Р°
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-dots">...</span>`;
        }
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // РљРЅРѕРїРєР° "Р’РїРµСЂРµРґ"
    html += `
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredClients.length / itemsPerPage)) {
        return;
    }
    
    currentPage = page;
    renderTable();
    
    // РџСЂРѕРєСЂСѓС‡РёРІР°РµРј Рє РЅР°С‡Р°Р»Сѓ С‚Р°Р±Р»РёС†С‹
    document.querySelector('.table-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ========== РЈРџР РђР’Р›Р•РќРР• Р РђР—Р”Р•Р›РђРњР ==========
function showSection(sectionId) {
    console.log(`РџРѕРєР°Р·С‹РІР°РµРј СЂР°Р·РґРµР»: ${sectionId}`);
    
    // РЎРєСЂС‹РІР°РµРј РІСЃРµ СЂР°Р·РґРµР»С‹
    document.querySelectorAll('.clients-section, .calendar-mini, .stats-grid').forEach(section => {
        section.style.display = 'none';
    });
    
    if (sectionId === 'main') {
        // РџРѕРєР°Р·С‹РІР°РµРј РіР»Р°РІРЅСѓСЋ СЃС‚СЂР°РЅРёС†Сѓ
        document.querySelector('.menu-grid').style.display = 'grid';
        document.querySelector('.calendar-mini').style.display = 'block';
        document.querySelector('.stats-grid').style.display = 'grid';
    } else if (sectionId === 'clients') {
        // РџРѕРєР°Р·С‹РІР°РµРј СЂР°Р·РґРµР» РєР»РёРµРЅС‚РѕРІ
        document.querySelector('.menu-grid').style.display = 'none';
        document.querySelector('.calendar-mini').style.display = 'none';
        document.querySelector('.stats-grid').style.display = 'none';
        document.getElementById('clientsSection').style.display = 'block';
        
        // РћР±РЅРѕРІР»СЏРµРј С‚Р°Р±Р»РёС†Сѓ
        renderTable();
    }
}

// ========== РЈРўРР›РРўР« ==========
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        weekday: 'long' 
    };
    const dateStr = now.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDate').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function showNotification(message, type = 'info') {
    // РЎРѕР·РґР°РµРј СѓРІРµРґРѕРјР»РµРЅРёРµ
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // РЎС‚РёР»Рё РґР»СЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#3182ce'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // РђРЅРёРјР°С†РёСЏ
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // РЈРґР°Р»СЏРµРј СѓРІРµРґРѕРјР»РµРЅРёРµ С‡РµСЂРµР· 3 СЃРµРєСѓРЅРґС‹
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function syncData() {
    showNotification('РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РґР°РЅРЅС‹С…...', 'info');
    setTimeout(() => {
        showNotification('Р”Р°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹', 'success');
        // РџРµСЂРµР·Р°РіСЂСѓР¶Р°РµРј РґР°РЅРЅС‹Рµ РёР· localStorage
        loadClientsFromLocalStorage();
        renderTable();
    }, 1500);
}

function exportData() {
    showNotification('РџРѕРґРіРѕС‚РѕРІРєР° РґР°РЅРЅС‹С… РґР»СЏ СЌРєСЃРїРѕСЂС‚Р°...', 'info');
    setTimeout(() => {
        showNotification('Р­РєСЃРїРѕСЂС‚ Р·Р°РІРµСЂС€РµРЅ', 'success');
    }, 2000);
}

function exportCSV() {
    const manager = managers[currentManager];
    const filename = `Р’Р•Р РўРЈРњ_CRM_${currentManager}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // РЎРѕР·РґР°РµРј CSV Р·Р°РіРѕР»РѕРІРѕРє
    let csv = 'РљРѕРґ;РќР°РёРјРµРЅРѕРІР°РЅРёРµ;РЎРµРіРјРµРЅС‚Р°С†РёСЏ РљР‘;Р‘РёР·РЅРµСЃ-СЂРµРіРёРѕРЅ;Р’РёРґ Р±РёР·РЅРµСЃР°;РўРѕРІР°СЂРЅР°СЏ РіСЂСѓРїРїР°;РќР°РїСЂР°РІР»РµРЅРёРµ;РђРґСЂРµСЃ\n';
    
    // Р”РѕР±Р°РІР»СЏРµРј РґР°РЅРЅС‹Рµ
    allClients.forEach(client => {
        csv += `"${client.code}";"${client.name}";"${client.segmentation}";"${client.region}";"${client.business}";"${client.product}";"${client.direction}";"${client.address}"\n`;
    });
    
    // РЎРѕР·РґР°РµРј Рё СЃРєР°С‡РёРІР°РµРј С„Р°Р№Р»
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    showNotification(`Р¤Р°Р№Р» ${filename} СЃРєР°С‡Р°РЅ`, 'success');
}

function exportExcel() {
    showNotification('Р­РєСЃРїРѕСЂС‚ РІ Excel РЅР°С‡Р°С‚...', 'info');
    setTimeout(() => {
        showNotification('Excel С„Р°Р№Р» РіРѕС‚РѕРІ Рє СЃРєР°С‡РёРІР°РЅРёСЋ', 'success');
    }, 2000);
}

function importExcel() {
    showNotification('РРјРїРѕСЂС‚ РґР°РЅРЅС‹С… РёР· Excel...', 'info');
}

function showReports() {
    showNotification('РћС‚РєСЂС‹С‚РёРµ РѕС‚С‡РµС‚РѕРІ...', 'info');
}

function loadClientsFromLocalStorage() {
    try {
        const savedClients = JSON.parse(localStorage.getItem('vertum_clients') || '[]');
        
        // РћР±СЉРµРґРёРЅСЏРµРј СЃ РѕСЃРЅРѕРІРЅРѕР№ Р±Р°Р·РѕР№
        if (savedClients.length > 0) {
            // РџСЂРµРѕР±СЂР°Р·СѓРµРј СЃРѕС…СЂР°РЅРµРЅРЅС‹С… РєР»РёРµРЅС‚РѕРІ РІ С„РѕСЂРјР°С‚ СЃРёСЃС‚РµРјС‹
            const convertedClients = savedClients.map((client, index) => ({
                id: client.id || allClients.length + index + 1,
                code: client.code || `NEW-${index + 1}`,
                name: client.name || 'РќРѕРІС‹Р№ РєР»РёРµРЅС‚',
                segmentation: client.segmentation || '2.1 РЎС‚Р°РЅРґР°СЂС‚ РґРѕ Р¦РљРђР” (РІСЃРµ)',
                region: client.region || 'РњРѕСЃРєРІР°',
                business: client.business || 'Р РѕР·РЅРёС‡РЅС‹Р№ РњР°РіР°Р·РёРЅ (Р”Рћ)',
                product: client.productGroup || 'Р’РµРЅС‚РёР»СЏС†РёСЏ Р”Рћ',
                zone: 'Р—РђРџРђР” - РЎСЂРµРґР°, РЎСѓР±Р±РѕС‚Р°',
                direction: client.direction || 'РЎРёРјС„РµСЂРѕРїРѕР»СЊСЃРєРѕРµ С€.',
                address: client.legalAddress || 'РђРґСЂРµСЃ РЅРµ СѓРєР°Р·Р°РЅ',
                priority: 'medium'
            }));
            
            // Р”РѕР±Р°РІР»СЏРµРј Рє РѕСЃРЅРѕРІРЅРѕР№ Р±Р°Р·Рµ
            allClients = [...managers[currentManager].database, ...convertedClients];
        }
    } catch (error) {
        console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РєР»РёРµРЅС‚РѕРІ РёР· localStorage:', error);
    }
}


// Р¤СѓРЅРєС†РёРё РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Excel РґР°РЅРЅС‹РјРё
function showExcelDataSection() {
    showSection('excelData');
    initializeExcelData();
}

function initializeExcelData() {
    // Р—Р°РїРѕР»РЅСЏРµРј РІС‹РїР°РґР°СЋС‰РёР№ СЃРїРёСЃРѕРє Р»РёСЃС‚Р°РјРё
    const sheetSelect = document.getElementById('excelSheetSelect');
    sheetSelect.innerHTML = '<option value="">Р’С‹Р±РµСЂРёС‚Рµ Р»РёСЃС‚...</option>';
    
    const sheets = getExcelSheets();
    sheets.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet;
        option.textContent = sheet;
        sheetSelect.appendChild(option);
    });
    
    // РЎРѕР·РґР°РµРј РІРєР»Р°РґРєРё Р»РёСЃС‚РѕРІ
    const tabsContainer = document.getElementById('excelSheetTabs');
    tabsContainer.innerHTML = '';
    
    sheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.className = 'excel-tab' + (index === 0 ? ' active' : '');
        tab.textContent = sheet;
        tab.onclick = () => loadExcelSheet(sheet);
        tabsContainer.appendChild(tab);
    });
    
    // Р—Р°РіСЂСѓР¶Р°РµРј РїРµСЂРІС‹Р№ Р»РёСЃС‚
    if (sheets.length > 0) {
        loadExcelSheet(sheets[0]);
    }
}

function loadExcelSheet(sheetName = null) {
    const sheetSelect = document.getElementById('excelSheetSelect');
    const selectedSheet = sheetName || sheetSelect.value;
    
    if (!selectedSheet) return;
    
    // РћР±РЅРѕРІР»СЏРµРј Р°РєС‚РёРІРЅСѓСЋ РІРєР»Р°РґРєСѓ
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === selectedSheet) {
            tab.classList.add('active');
        }
    });
    
    // Р—Р°РіСЂСѓР¶Р°РµРј РґР°РЅРЅС‹Рµ
    const data = getExcelData(selectedSheet);
    const info = getExcelSheetInfo(selectedSheet);
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‡РµС‚С‡РёРє
    document.getElementById('excelCount').innerHTML = 
        `Р—Р°РіСЂСѓР¶РµРЅРѕ: <strong>${data.length}</strong> Р·Р°РїРёСЃРµР№`;
    
    // РЎРѕР·РґР°РµРј С‚Р°Р±Р»РёС†Сѓ
    const tableHead = document.getElementById('excelTableHead');
    const tableBody = document.getElementById('excelTableBody');
    
    // РћС‡РёС‰Р°РµРј С‚Р°Р±Р»РёС†Сѓ
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 50px;">РќРµС‚ РґР°РЅРЅС‹С…</td></tr>';
        return;
    }
    
    // РЎРѕР·РґР°РµРј Р·Р°РіРѕР»РѕРІРєРё
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    
    // Р—Р°РїРѕР»РЅСЏРµРј РґР°РЅРЅС‹РјРё
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            td.title = value; // РџРѕРґСЃРєР°Р·РєР° РїСЂРё РЅР°РІРµРґРµРЅРёРё
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // РџРѕРєР°Р·С‹РІР°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ
    const statsDiv = document.getElementById('excelStats');
    statsDiv.innerHTML = `
        <div class="excel-stat-item">
            <div class="excel-stat-label">Р›РёСЃС‚</div>
            <div class="excel-stat-value">${info.sheetName}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">Р—Р°РїРёСЃРµР№</div>
            <div class="excel-stat-value">${info.rows}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">РџРѕР»РµР№</div>
            <div class="excel-stat-value">${info.columns}</div>
        </div>
        <div class="excel-stat-item">
            <div class="excel-stat-label">РћР±РЅРѕРІР»РµРЅРѕ</div>
            <div class="excel-stat-value">${new Date().toLocaleDateString()}</div>
        </div>
    `;
}

function searchExcelData() {
    const searchTerm = document.getElementById('excelSearchInput').value;
    if (!searchTerm.trim()) {
        // Р•СЃР»Рё РїРѕРёСЃРє РїСѓСЃС‚РѕР№, РїРѕРєР°Р·С‹РІР°РµРј С‚РµРєСѓС‰РёР№ Р»РёСЃС‚
        const activeTab = document.querySelector('.excel-tab.active');
        if (activeTab) {
            loadExcelSheet(activeTab.textContent);
        }
        return;
    }
    
    const results = searchInExcelData(searchTerm);
    const tableBody = document.getElementById('excelTableBody');
    const tableHead = document.getElementById('excelTableHead');
    
    // РћС‡РёС‰Р°РµРј С‚Р°Р±Р»РёС†Сѓ
    tableBody.innerHTML = '';
    tableHead.innerHTML = '';
    
    let totalResults = 0;
    
    // РЎРѕР±РёСЂР°РµРј РІСЃРµ СЂРµР·СѓР»СЊС‚Р°С‚С‹
    for (const [sheetName, sheetResults] of Object.entries(results)) {
        if (sheetResults.length === 0) continue;
        
        totalResults += sheetResults.length;
        
        // Р”РѕР±Р°РІР»СЏРµРј Р·Р°РіРѕР»РѕРІРѕРє Р»РёСЃС‚Р°
        const headerRow = document.createElement('tr');
        const headerCell = document.createElement('td');
        headerCell.colSpan = 100;
        headerCell.innerHTML = `<strong style="color: #4CAF50;">рџ“„ ${sheetName} (${sheetResults.length} Р·Р°РїРёСЃРµР№)</strong>`;
        headerCell.style.backgroundColor = '#f0f7ff';
        headerCell.style.padding = '15px';
        headerRow.appendChild(headerCell);
        tableBody.appendChild(headerRow);
        
        // Р”РѕР±Р°РІР»СЏРµРј Р·Р°РіРѕР»РѕРІРєРё СЃС‚РѕР»Р±С†РѕРІ (С‚РѕР»СЊРєРѕ РґР»СЏ РїРµСЂРІРѕРіРѕ СЂРµР·СѓР»СЊС‚Р°С‚Р°)
        if (tableHead.innerHTML === '' && sheetResults.length > 0) {
            const headRow = document.createElement('tr');
            Object.keys(sheetResults[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headRow.appendChild(th);
            });
            tableHead.appendChild(headRow);
        }
        
        // Р”РѕР±Р°РІР»СЏРµРј РґР°РЅРЅС‹Рµ
        sheetResults.forEach(row => {
            const tr = document.createElement('tr');
            
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                const strValue = String(value);
                
                // РџРѕРґСЃРІРµС‡РёРІР°РµРј РЅР°Р№РґРµРЅРЅРѕРµ СЃР»РѕРІРѕ
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
        tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 50px;">РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ</td></tr>';
    }
    
    // РћР±РЅРѕРІР»СЏРµРј СЃС‡РµС‚С‡РёРє
    document.getElementById('excelCount').innerHTML = 
        `РќР°Р№РґРµРЅРѕ: <strong>${totalResults}</strong> Р·Р°РїРёСЃРµР№`;
}

function exportExcelToCSV() {
    const activeTab = document.querySelector('.excel-tab.active');
    if (!activeTab) return;
    
    const sheetName = activeTab.textContent;
    const data = getExcelData(sheetName);
    
    if (data.length === 0) {
        alert('РќРµС‚ РґР°РЅРЅС‹С… РґР»СЏ СЌРєСЃРїРѕСЂС‚Р°');
        return;
    }
    
    // РЎРѕР·РґР°РµРј CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Р”РѕР±Р°РІР»СЏРµРј Р·Р°РіРѕР»РѕРІРєРё
    csvRows.push(headers.join(';'));
    
    // Р”РѕР±Р°РІР»СЏРµРј РґР°РЅРЅС‹Рµ
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Р­РєСЂР°РЅРёСЂСѓРµРј РєР°РІС‹С‡РєРё Рё С‚РѕС‡РєРё СЃ Р·Р°РїСЏС‚РѕР№
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(';'));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
    if (confirm('РћР±РЅРѕРІРёС‚СЊ РґР°РЅРЅС‹Рµ РёР· Excel С„Р°Р№Р»Р°? РўСЂРµР±СѓРµС‚СЃСЏ РїРµСЂРµР·Р°РіСЂСѓР·РєР° СЃС‚СЂР°РЅРёС†С‹.')) {
        location.reload();
    }
}
