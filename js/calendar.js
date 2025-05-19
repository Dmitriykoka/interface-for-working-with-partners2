// Модуль календаря
function initCalendar() {
    // Загрузка данных
    const partners = loadPartners();
    const contacts = loadContacts();
    
    // Установка текущей даты
    const currentDate = new Date();
    let currentView = 'month';
    
    // Инициализация календаря
    renderCalendar(currentDate, currentView, contacts, partners);
    
    // Обработчики кнопок переключения вида
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.getAttribute('data-view');
            renderCalendar(currentDate, currentView, contacts, partners);
        });
    });
    
    // Обработчики кнопок навигации
    document.getElementById('prev-period').addEventListener('click', function() {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderCalendar(currentDate, currentView, contacts, partners);
    });
    
    document.getElementById('next-period').addEventListener('click', function() {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderCalendar(currentDate, currentView, contacts, partners);
    });
    
    // Инициализация Flatpickr для формы добавления контакта
    flatpickr('#contact-date', {
        dateFormat: 'Y-m-d',
        locale: 'ru'
    });
    
    flatpickr('#contact-time', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true
    });
    
    // Обработчик формы добавления контакта
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // В реальном приложении здесь был бы запрос к API
        alert('Контакт успешно добавлен');
        hideModal(document.getElementById('add-contact-modal'));
        
        // Обновляем календарь
        renderCalendar(currentDate, currentView, contacts, partners);
    });
}

function renderCalendar(date, view, contacts, partners) {
    const calendarEl = document.getElementById('calendar');
    const periodTitleEl = document.getElementById('current-period');
    
    if (view === 'month') {
        renderMonthView(date, calendarEl, periodTitleEl, contacts, partners);
    } else if (view === 'week') {
        renderWeekView(date, calendarEl, periodTitleEl, contacts, partners);
    } else {
        renderDayView(date, calendarEl, periodTitleEl, contacts, partners);
    }
}

function renderMonthView(date, calendarEl, periodTitleEl, contacts, partners) {
    // Устанавливаем заголовок с месяцем и годом
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    periodTitleEl.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    // Получаем первый день месяца и день недели
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Приводим к формату Пн-Вс (0-6)
    
    // Получаем количество дней в месяце
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем количество дней в предыдущем месяце
    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    const daysInPrevMonth = prevLastDay.getDate();
    
    // Создаем сетку календаря
    let calendarHtml = `
        <div class="calendar-grid">
            <div class="calendar-day-header">Пн</div>
            <div class="calendar-day-header">Вт</div>
            <div class="calendar-day-header">Ср</div>
            <div class="calendar-day-header">Чт</div>
            <div class="calendar-day-header">Пт</div>
            <div class="calendar-day-header">Сб</div>
            <div class="calendar-day-header">Вс</div>
            
            <div class="calendar-legend">
                <div><span class="legend-color planned"></span> Запланированные</div>
                <div><span class="legend-color overdue"></span> Просроченные</div>
                <div><span class="legend-color postponed"></span> Перенесенные</div>
                <div><span class="legend-color completed"></span> Выполненные</div>
                <div><span class="legend-color unscheduled"></span> Внеплановые</div>
            </div>
    `;
    
    // Добавляем дни из предыдущего месяца
    for (let i = firstDayOfWeek; i > 0; i--) {
        const day = daysInPrevMonth - i + 1;
        calendarHtml += `<div class="calendar-day empty">${day}</div>`;
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
        const dateStr = formatDateToYMD(currentDate);
        
        // Получаем контакты на этот день
        const dayContacts = contacts.filter(c => c.date === dateStr);
        
        // Определяем классы для дня
        let dayClasses = 'calendar-day';
        if (currentDate.toDateString() === new Date().toDateString()) {
            dayClasses += ' current-day';
        }
        
        // Создаем HTML для контактов
        let contactsHtml = '';
        if (dayContacts.length > 0) {
            contactsHtml = `<div class="day-contacts">`;
            
            // Ограничиваем количество отображаемых контактов до 3
            const contactsToShow = dayContacts.slice(0, 3);
            const hiddenContactsCount = dayContacts.length - contactsToShow.length;
            
            contactsToShow.forEach(contact => {
                const partner = partners.find(p => p.id === contact.partnerId);
                const statusClass = getStatusClass(contact.status);
                const priorityClass = `priority-${contact.priority}`;
                
                contactsHtml += `
                    <div class="contact-badge ${statusClass} ${priorityClass}" 
                         title="${partner?.name || 'Партнер не найден'}\n${contact.time} - ${getPriorityText(contact.priority)}\nСтатус: ${getStatusText(contact.status)}">
                        ${contact.time} - ${partner?.name?.split(' ')[0] || 'Партнер'}
                    </div>
                `;
            });
            
            if (hiddenContactsCount > 0) {
                contactsHtml += `
                    <div class="more-contacts" title="Еще ${hiddenContactsCount} контактов">
                        +${hiddenContactsCount}
                    </div>
                `;
            }
            
            contactsHtml += `</div>`;
        }
        
        calendarHtml += `
            <div class="${dayClasses}" data-date="${dateStr}">
                <div class="calendar-date">${i}</div>
                ${contactsHtml}
            </div>
        `;
    }
    
    // Добавляем дни из следующего месяца
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 недель * 7 дней
    
    for (let i = 1; i <= remainingCells; i++) {
        calendarHtml += `<div class="calendar-day empty">${i}</div>`;
    }
    
    calendarHtml += `</div>`;
    calendarEl.innerHTML = calendarHtml;
    
    // Обработчик клика по дню
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
        dayEl.addEventListener('click', function() {
            const dateStr = this.getAttribute('data-date');
            showDayEvents(dateStr, contacts, partners);
        });
    });
    
    // Показываем события для текущего дня
    const todayStr = formatDateToYMD(new Date());
    showDayEvents(todayStr, contacts, partners);
}


function renderWeekView(date, calendarEl, periodTitleEl, contacts, partners) {
    // Находим понедельник текущей недели
    const monday = new Date(date);
    monday.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
    
    // Находим воскресенье текущей недели
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Устанавливаем заголовок с диапазоном дат
    periodTitleEl.textContent = `${formatDate(monday)} - ${formatDate(sunday)}`;
    
    // Создаем HTML для недельного вида
    let calendarHtml = '<div class="week-view">';
    
    // Добавляем дни недели
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const dateStr = formatDateToYMD(currentDay);
        
        // Получаем контакты на этот день
        const dayContacts = contacts.filter(c => c.date === dateStr);
        
        // Определяем классы для дня
        let dayClasses = 'week-day';
        if (currentDay.toDateString() === new Date().toDateString()) {
            dayClasses += ' current-day';
        }
        
        // Форматируем название дня недели
        const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        const dayName = dayNames[i];
        const dayNumber = currentDay.getDate();
        
        // Создаем HTML для контактов
        let contactsHtml = '';
        if (dayContacts.length > 0) {
            contactsHtml = '<div class="day-events">';
            dayContacts.forEach(contact => {
                const partner = partners.find(p => p.id === contact.partnerId);
                const statusClass = getStatusClass(contact.status);
                
                contactsHtml += `
                    <div class="week-event ${statusClass}" data-contact-id="${contact.id}">
                        <span class="event-time">${contact.time}</span>
                        <span class="event-partner">${partner ? partner.name : 'Неизвестный партнер'}</span>
                        <span class="event-priority priority-${contact.priority}">${getPriorityText(contact.priority)}</span>
                    </div>
                `;
            });
            contactsHtml += '</div>';
        }
        
        calendarHtml += `
            <div class="${dayClasses}" data-date="${dateStr}">
                <div class="day-header">
                    <span class="day-name">${dayName}</span>
                    <span class="day-number">${dayNumber}</span>
                </div>
                ${contactsHtml}
            </div>
        `;
    }
    
    calendarHtml += '</div>';
    calendarEl.innerHTML = calendarHtml;
    
    // Обработчик клика по дню
    document.querySelectorAll('.week-day').forEach(dayEl => {
        dayEl.addEventListener('click', function() {
            const dateStr = this.getAttribute('data-date');
            showDayEvents(dateStr, contacts, partners);
        });
    });
    
    // Обработчик клика по событию
    document.querySelectorAll('.week-event').forEach(eventEl => {
        eventEl.addEventListener('click', function(e) {
            e.stopPropagation();
            const contactId = parseInt(this.getAttribute('data-contact-id'));
            showContactDetails(contactId, contacts, partners);
        });
    });
    
    // Показываем события для текущего дня
    const todayStr = formatDateToYMD(new Date());
    showDayEvents(todayStr, contacts, partners);
}

function renderDayView(date, calendarEl, periodTitleEl, contacts, partners) {
    // Устанавливаем заголовок с датой
    periodTitleEl.textContent = formatDate(date);
    
    const dateStr = formatDateToYMD(date);
    
    // Получаем контакты на этот день
    const dayContacts = contacts.filter(c => c.date === dateStr);
    
    // Создаем HTML для дневного вида
    let calendarHtml = '<div class="day-view">';
    
    if (dayContacts.length > 0) {
        // Сортируем контакты по времени
        dayContacts.sort((a, b) => a.time.localeCompare(b.time));
        
        dayContacts.forEach(contact => {
            const partner = partners.find(p => p.id === contact.partnerId);
            const statusClass = getStatusClass(contact.status);
            
            calendarHtml += `
                <div class="day-event ${statusClass}" data-contact-id="${contact.id}">
                    <div class="event-time">${contact.time}</div>
                    <div class="event-details">
                        <div class="event-partner">${partner ? partner.name : 'Неизвестный партнер'}</div>
                        <div class="event-type">${getTypeText(contact.type)}</div>
                        <div class="event-priority priority-${contact.priority}">${getPriorityText(contact.priority)}</div>
                    </div>
                    <div class="event-notes">${contact.notes || 'Нет примечаний'}</div>
                </div>
            `;
        });
    } else {
        calendarHtml += '<div class="no-events">Нет запланированных контактов</div>';
    }
    
    calendarHtml += '</div>';
    calendarEl.innerHTML = calendarHtml;
    
    // Обработчик клика по событию
    document.querySelectorAll('.day-event').forEach(eventEl => {
        eventEl.addEventListener('click', function() {
            const contactId = parseInt(this.getAttribute('data-contact-id'));
            showContactDetails(contactId, contacts, partners);
        });
    });
    
    // Показываем события для выбранного дня
    showDayEvents(dateStr, contacts, partners);
}

function showDayEvents(dateStr, contacts, partners) {
    // Устанавливаем заголовок
    const date = new Date(dateStr);
    document.getElementById('selected-day-title').textContent = formatDate(date);
    
    // Получаем контакты на этот день
    const dayContacts = contacts.filter(c => c.date === dateStr);
    
    const eventsListEl = document.getElementById('day-events-list');
    
    if (dayContacts.length === 0) {
        eventsListEl.innerHTML = '<div class="no-events">Нет запланированных контактов</div>';
        return;
    }
    
    // Сортируем контакты по времени
    dayContacts.sort((a, b) => a.time.localeCompare(b.time));
    
    // Создаем HTML для списка событий
    let eventsHtml = '';
    
    dayContacts.forEach(contact => {
        const partner = partners.find(p => p.id === contact.partnerId);
        const statusClass = getStatusClass(contact.status);
        
        eventsHtml += `
            <div class="event-item ${statusClass}" data-contact-id="${contact.id}">
                <span class="event-time">${contact.time}</span>
                <span class="event-partner">${partner ? partner.name : 'Неизвестный партнер'}</span>
                <span class="event-priority priority-${contact.priority}">${getPriorityText(contact.priority)}</span>
                <div class="event-actions">
                    <button class="edit-contact" title="Редактировать"><i class="fas fa-edit"></i></button>
                    <button class="delete-contact" title="Удалить"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    
    eventsListEl.innerHTML = eventsHtml;
    
    // Обработчики кликов по событиям
    document.querySelectorAll('.event-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.event-actions')) return;
            
            const contactId = parseInt(this.getAttribute('data-contact-id'));
            showContactDetails(contactId, contacts, partners);
        });
    });
    
    // Обработчики кнопок редактирования и удаления
    document.querySelectorAll('.edit-contact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const contactId = parseInt(this.closest('.event-item').getAttribute('data-contact-id'));
            editContact(contactId, contacts, partners);
        });
    });
    
    document.querySelectorAll('.delete-contact').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const contactId = parseInt(this.closest('.event-item').getAttribute('data-contact-id'));
            deleteContact(contactId, contacts, partners);
        });
    });
}

function showContactDetails(contactId, contacts, partners) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const partner = partners.find(p => p.id === contact.partnerId);
    
    // Заполняем модальное окно данными
    document.getElementById('detail-partner').textContent = partner ? partner.name : 'Неизвестный партнер';
    document.getElementById('detail-datetime').textContent = `${formatDate(contact.date)} в ${contact.time}`;
    document.getElementById('detail-type').textContent = getTypeText(contact.type);
    document.getElementById('detail-priority').textContent = getPriorityText(contact.priority);
    document.getElementById('detail-status').textContent = getStatusText(contact.status);
    document.getElementById('detail-notes').textContent = contact.notes || 'Нет примечаний';
    
    // Показываем/скрываем кнопки в зависимости от статуса
    const completeBtn = document.getElementById('complete-contact');
    const postponeBtn = document.getElementById('postpone-contact');
    
    if (contact.status === 'planned' || contact.status === 'overdue') {
        completeBtn.style.display = 'inline-block';
        postponeBtn.style.display = 'inline-block';
    } else {
        completeBtn.style.display = 'none';
        postponeBtn.style.display = 'none';
    }
    
    // Обработчики кнопок
    completeBtn.onclick = function() {
        contact.status = 'completed';
        alert('Контакт отмечен как выполненный');
        hideModal(document.getElementById('contact-details-modal'));
    };
    
    postponeBtn.onclick = function() {
        showModal('postpone-modal');
        hideModal(document.getElementById('contact-details-modal'));
        
        // Инициализация Flatpickr для переноса
        flatpickr('#postpone-date', {
            dateFormat: 'Y-m-d',
            locale: 'ru',
            defaultDate: contact.date
        });
        
        flatpickr('#postpone-time', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            defaultDate: contact.time
        });
        
        // Обработчик формы переноса
        document.getElementById('postpone-form').onsubmit = function(e) {
            e.preventDefault();
            
            // В реальном приложении здесь был бы запрос к API
            alert('Контакт успешно перенесен');
            hideModal(document.getElementById('postpone-modal'));
        };
    };
    
    document.getElementById('delete-contact').onclick = function() {
        if (confirm('Вы уверены, что хотите удалить этот контакт?')) {
            // В реальном приложении здесь был бы запрос к API
            const index = contacts.findIndex(c => c.id === contactId);
            if (index !== -1) {
                contacts.splice(index, 1);
            }
            alert('Контакт удален');
            hideModal(document.getElementById('contact-details-modal'));
        }
    };
    
    // Показываем модальное окно
    showModal('contact-details-modal');
}

// Вспомогательные функции
function formatDateToYMD(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStatusClass(status) {
    switch (status) {
        case 'planned': return 'planned';
        case 'overdue': return 'overdue';
        case 'postponed': return 'postponed';
        case 'completed': return 'completed';
        case 'unscheduled': return 'unscheduled';
        default: return '';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'planned': return 'Запланирован';
        case 'overdue': return 'Просрочен';
        case 'postponed': return 'Перенесен';
        case 'completed': return 'Выполнен';
        case 'unscheduled': return 'Внеплановый';
        default: return status;
    }
}

function getTypeText(type) {
    switch (type) {
        case 'planned': return 'Плановый';
        case 'unscheduled': return 'Внеплановый';
        default: return type;
    }
}

function getPriorityText(priority) {
    switch (priority) {
        case 'low': return 'Низкий';
        case 'medium': return 'Средний';
        case 'high': return 'Высокий';
        default: return priority;
    }
}

function getStatusText(status) {
    switch (status) {
        case 'planned': return 'Запланирован (ожидает выполнения)';
        case 'overdue': return 'Просрочен (не выполнен в срок)';
        case 'postponed': return 'Перенесен (новый контакт создан)';
        case 'completed': return 'Выполнен (звонок состоялся)';
        case 'unscheduled': return 'Внеплановый (инициатива менеджера)';
        default: return status;
    }
}