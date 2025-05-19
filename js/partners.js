// Модуль работы с партнерами
function initPartners() {
    // Загрузка данных
    const partners = loadPartners();
    const contacts = loadContacts();
    
    // Инициализация таблицы партнеров
    renderPartnersTable(partners, contacts);
    
    // Обработчики фильтров
    document.getElementById('apply-filters').addEventListener('click', function() {
        applyFilters(partners, contacts);
    });
    
    document.getElementById('reset-filters').addEventListener('click', function() {
        resetFilters();
        renderPartnersTable(partners, contacts);
    });
    
    // Обработчики массовых действий
    document.getElementById('select-all').addEventListener('click', function() {
        document.querySelectorAll('#partners-table tbody input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        updateMassActionsState();
    });
    
    document.getElementById('deselect-all').addEventListener('click', function() {
        document.querySelectorAll('#partners-table tbody input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateMassActionsState();
    });
    
    document.getElementById('assign-calls').addEventListener('click', function() {
        const selectedIds = getSelectedPartnerIds();
        if (selectedIds.length > 0) {
            showMassAssignmentModal(selectedIds);
        }
    });
    
    // Обработчик изменения состояния чекбоксов
    document.getElementById('partners-table').addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            updateMassActionsState();
        }
    });
    
    // Инициализация Flatpickr для массового назначения
    flatpickr('#call-date', {
        dateFormat: 'Y-m-d',
        locale: 'ru'
    });
    
    // Обработчик формы добавления партнера
    document.getElementById('partner-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // В реальном приложении здесь был бы запрос к API
        alert('Партнер успешно добавлен');
        hideModal(document.getElementById('add-partner-modal'));
        
        // Обновляем таблицу
        renderPartnersTable(partners, contacts);
    });
    
    // Обработчик формы массового назначения звонков
    document.getElementById('assign-calls-btn').addEventListener('click', function() {
        const selectedIds = getSelectedPartnerIds();
        const callDate = document.getElementById('call-date').value;
        const callPeriod = document.getElementById('call-period').value;
        const callPriority = document.getElementById('call-priority').value;
        const callNotes = document.getElementById('call-notes').value;
        
        if (!callDate) {
            alert('Пожалуйста, укажите дату звонка');
            return;
        }
        
        // В реальном приложении здесь был бы запрос к API
        alert(`Звонки для ${selectedIds.length} партнеров успешно назначены на ${callDate}`);
        hideModal(document.getElementById('add-partner-modal'));
        
        // Обновляем таблицу
        renderPartnersTable(partners, contacts);
    });
}

function renderPartnersTable(partners, contacts) {
    const tableBody = document.querySelector('#partners-table tbody');
    tableBody.innerHTML = '';
    
    if (partners.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Нет данных о партнерах</td></tr>';
        return;
    }
    
    partners.forEach(partner => {
        // Находим последний контакт с этим партнером
        const lastContact = contacts
            .filter(c => c.partnerId === partner.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        const lastContactText = lastContact 
            ? `${formatDate(lastContact.date)} (${getStatusText(lastContact.status)})` 
            : 'Нет контактов';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-partner-id="${partner.id}"></td>
            <td>${partner.name}</td>
            <td>${partner.inn}</td>
            <td>${partner.region}</td>
            <td>${partner.manager}</td>
            <td><span class="status-badge status-${partner.status}">${
                partner.status === 'active' ? 'Активный' : 'Неактивный'
            }</span></td>
            <td>${lastContactText}</td>
            <td>
                <button class="btn-action view-partner" data-partner-id="${partner.id}" title="Просмотр">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action assign-call" data-partner-id="${partner.id}" title="Назначить звонок">
                    <i class="fas fa-phone"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Обработчики кнопок действий
    document.querySelectorAll('.view-partner').forEach(btn => {
        btn.addEventListener('click', function() {
            const partnerId = parseInt(this.getAttribute('data-partner-id'));
            viewPartnerDetails(partnerId, partners, contacts);
        });
    });
    
    document.querySelectorAll('.assign-call').forEach(btn => {
        btn.addEventListener('click', function() {
            const partnerId = parseInt(this.getAttribute('data-partner-id'));
            assignCallToPartner(partnerId);
        });
    });
}

function applyFilters(partners, contacts) {
    const regionFilter = document.getElementById('region-filter').value;
    const managerFilter = document.getElementById('manager-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredPartners = [...partners];
    
    if (regionFilter !== 'all') {
        filteredPartners = filteredPartners.filter(p => p.region === regionFilter);
    }
    
    if (managerFilter !== 'all') {
        filteredPartners = filteredPartners.filter(p => p.manager === managerFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredPartners = filteredPartners.filter(p => p.status === statusFilter);
    }
    
    renderPartnersTable(filteredPartners, contacts);
}

function resetFilters() {
    document.getElementById('region-filter').value = 'all';
    document.getElementById('manager-filter').value = 'all';
    document.getElementById('status-filter').value = 'all';
}

function updateMassActionsState() {
    const selectedCount = getSelectedPartnerIds().length;
    const assignBtn = document.getElementById('assign-calls');
    
    if (selectedCount > 0) {
        assignBtn.disabled = false;
        assignBtn.textContent = `Назначить звонки (${selectedCount})`;
    } else {
        assignBtn.disabled = true;
        assignBtn.textContent = 'Назначить звонки';
    }
}

function getSelectedPartnerIds() {
    const selectedIds = [];
    document.querySelectorAll('#partners-table tbody input[type="checkbox"]:checked').forEach(checkbox => {
        selectedIds.push(parseInt(checkbox.getAttribute('data-partner-id')));
    });
    return selectedIds;
}

function showMassAssignmentModal(selectedIds) {
    // Очищаем список выбранных партнеров
    const selectedList = document.getElementById('selected-partners-list');
    selectedList.innerHTML = '';
    
    // Загружаем партнеров
    const partners = loadPartners();
    
    // Добавляем выбранных партнеров в список
    selectedIds.forEach(id => {
        const partner = partners.find(p => p.id === id);
        if (partner) {
            const partnerEl = document.createElement('div');
            partnerEl.className = 'selected-partner';
            partnerEl.innerHTML = `
                <span>${partner.name}</span>
                <button class="remove-partner" data-partner-id="${id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedList.appendChild(partnerEl);
        }
    });
    
    // Обновляем счетчик
    document.getElementById('selected-count').textContent = selectedIds.length;
    
    // Показываем секцию планирования
    document.querySelectorAll('.sidebar li').forEach(item => item.classList.remove('active'));
    document.querySelector('.sidebar li[data-section="planning"]').classList.add('active');
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('planning-section').classList.add('active');
}

function viewPartnerDetails(partnerId, partners, contacts) {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    
    // Находим все контакты с этим партнером
    const partnerContacts = contacts
        .filter(c => c.partnerId === partnerId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // В реальном приложении здесь было бы модальное окно с подробной информацией
    alert(`Подробная информация о партнере:\n\nНазвание: ${partner.name}\nИНН: ${partner.inn}\nРегион: ${partner.region}\nМенеджер: ${partner.manager}\nСтатус: ${partner.status === 'active' ? 'Активный' : 'Неактивный'}\n\nВсего контактов: ${partnerContacts.length}`);
}

function assignCallToPartner(partnerId) {
    // В реальном приложении здесь было бы модальное окно для назначения звонка
    alert(`Назначение звонка для партнера с ID: ${partnerId}`);
}