// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех модулей
    initCalendar();
    initPartners();
    initReports();
    
    // Установка текущего пользователя (для демонстрации)
    document.getElementById('current-user').textContent = 'Иван Петров (Менеджер)';
    
    // Переключение между разделами
    const menuItems = document.querySelectorAll('.sidebar li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Удаляем активный класс у всех пунктов меню
            menuItems.forEach(i => i.classList.remove('active'));
            // Добавляем активный класс текущему пункту
            this.classList.add('active');
            
            // Скрываем все секции
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем выбранную секцию
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Инициализация Flatpickr для выбора даты
    flatpickr.localize(flatpickr.l10ns.ru);
    
    // Обработчик кнопки выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        alert('Вы вышли из системы');
    });
    
    // Показать модальное окно добавления контакта
    document.getElementById('add-contact-btn').addEventListener('click', function() {
        showModal('add-contact-modal');
    });
    
    // Показать модальное окно добавления партнера
    document.getElementById('add-partner-btn').addEventListener('click', function() {
        showModal('add-partner-modal');
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            hideModal(this.closest('.modal'));
        });
    });
    
    // Обработчик изменения типа контакта
    document.getElementById('contact-type').addEventListener('change', function() {
        const replaceContainer = document.getElementById('replace-planned-container');
        if (this.value === 'unscheduled') {
            replaceContainer.style.display = 'block';
        } else {
            replaceContainer.style.display = 'none';
        }
    });
    
    // Обработчик причины переноса
    document.getElementById('postpone-reason').addEventListener('change', function() {
        const otherReasonContainer = document.getElementById('other-reason-container');
        if (this.value === 'other') {
            otherReasonContainer.style.display = 'block';
        } else {
            otherReasonContainer.style.display = 'none';
        }
    });
});

// Функции для работы с модальными окнами
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Глобальные функции для работы с данными
function loadPartners() {
    // В реальном приложении здесь был бы запрос к API
    return [
        { id: 1, name: "ООО 'ТехноПром'", inn: "1234567890", region: "Москва", manager: "Иван Петров", status: "active", lastContact: "2024-05-10" },
        { id: 2, name: "АО 'СтройГарант'", inn: "0987654321", region: "Санкт-Петербург", manager: "Мария Сидорова", status: "active", lastContact: "2024-05-12" },
        { id: 3, name: "ИП Иванов А.А.", inn: "1122334455", region: "Новосибирск", manager: "Иван Петров", status: "inactive", lastContact: "2024-04-28" },
        { id: 4, name: "ЗАО 'АгроТех'", inn: "5566778899", region: "Москва", manager: "Мария Сидорова", status: "active", lastContact: "2024-05-15" },
        { id: 5, name: "ООО 'ТоргСервис'", inn: "6677889900", region: "Екатеринбург", manager: "Иван Петров", status: "active", lastContact: "2024-05-08" }
    ];
}

function loadContacts() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
        // Сегодняшние события
        { 
            id: 1, 
            partnerId: 1, 
            date: formatDateToYMD(today), 
            time: "10:00", 
            type: "planned", 
            status: "planned", 
            priority: "high", 
            notes: "Обсуждение нового контракта" 
        },
        { 
            id: 2, 
            partnerId: 2, 
            date: formatDateToYMD(today), 
            time: "14:00", 
            type: "planned", 
            status: "planned", 
            priority: "medium", 
            notes: "Уточнение условий поставки" 
        },
        { 
            id: 3, 
            partnerId: 5, 
            date: formatDateToYMD(today), 
            time: "16:30", 
            type: "unscheduled", 
            status: "completed", 
            priority: "low", 
            notes: "Внеплановый звонок по оплате" 
        },

        // Вчерашние события (просроченные)
        { 
            id: 4, 
            partnerId: 3, 
            date: formatDateToYMD(yesterday), 
            time: "11:00", 
            type: "planned", 
            status: "overdue", 
            priority: "high", 
            notes: "Не удалось дозвониться" 
        },
        { 
            id: 5, 
            partnerId: 4, 
            date: formatDateToYMD(yesterday), 
            time: "15:00", 
            type: "planned", 
            status: "overdue", 
            priority: "medium", 
            notes: "Партнер не ответил" 
        },

        // Завтрашние события
        { 
            id: 6, 
            partnerId: 1, 
            date: formatDateToYMD(tomorrow), 
            time: "09:30", 
            type: "planned", 
            status: "planned", 
            priority: "low", 
            notes: "Рутинный контрольный звонок" 
        },
        { 
            id: 7, 
            partnerId: 2, 
            date: formatDateToYMD(tomorrow), 
            time: "14:00", 
            type: "planned", 
            status: "planned", 
            priority: "medium", 
            notes: "Согласование договора" 
        },

        // События на следующей неделе
        { 
            id: 8, 
            partnerId: 3, 
            date: formatDateToYMD(nextWeek), 
            time: "11:00", 
            type: "planned", 
            status: "planned", 
            priority: "high", 
            notes: "Обсуждение новых условий" 
        },
        { 
            id: 9, 
            partnerId: 5, 
            date: formatDateToYMD(nextWeek), 
            time: "16:00", 
            type: "planned", 
            status: "planned", 
            priority: "medium", 
            notes: "Плановый контроль" 
        },

        // Перенесенные события
        { 
            id: 10, 
            partnerId: 4, 
            date: formatDateToYMD(tomorrow), 
            time: "11:00", 
            type: "planned", 
            status: "postponed", 
            originalDate: formatDateToYMD(yesterday), 
            reason: "Партнер попросил перенести", 
            priority: "high", 
            notes: "Перенесено с вчерашнего дня" 
        }
    ];
}

// Вспомогательная функция для форматирования даты
function formatDate(dateStr) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('ru-RU', options);
}