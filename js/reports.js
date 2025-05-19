// Модуль отчетов и статистики
function initReports() {
    // Загрузка данных
    const contacts = loadContacts();
    const partners = loadPartners();
    
    // Инициализация графиков
    renderReports(contacts, partners);
    
    // Обработчик изменения периода отчетов
    document.getElementById('report-period').addEventListener('change', function() {
        renderReports(contacts, partners);
    });
}

function renderReports(contacts, partners) {
    const period = document.getElementById('report-period').value;
    
    // Фильтруем контакты по выбранному периоду
    let filteredContacts = [...contacts];
    const now = new Date();
    
    if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        filteredContacts = filteredContacts.filter(c => new Date(c.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        filteredContacts = filteredContacts.filter(c => new Date(c.date) >= monthAgo);
    } else if (period === 'quarter') {
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        filteredContacts = filteredContacts.filter(c => new Date(c.date) >= quarterAgo);
    } else if (period === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        filteredContacts = filteredContacts.filter(c => new Date(c.date) >= yearAgo);
    }
    
    // Обновляем статистические карточки
    updateStatsCards(filteredContacts);
    
    // Обновляем графики
    updateCharts(filteredContacts, partners);
}

function updateStatsCards(contacts) {
    // Считаем контакты по статусам
    const stats = {
        completed: contacts.filter(c => c.status === 'completed').length,
        overdue: contacts.filter(c => c.status === 'overdue').length,
        postponed: contacts.filter(c => c.status === 'postponed').length,
        unscheduled: contacts.filter(c => c.type === 'unscheduled').length,
        total: contacts.length
    };
    
    // Обновляем значения в карточках
    document.getElementById('completed-contacts').textContent = stats.completed;
    document.getElementById('overdue-contacts').textContent = stats.overdue;
    document.getElementById('postponed-contacts').textContent = stats.postponed;
    document.getElementById('unscheduled-contacts').textContent = stats.unscheduled;
}

function updateCharts(contacts, partners) {
    // Получаем контексты canvas
    const contactsCtx = document.getElementById('contacts-chart').getContext('2d');
    const workloadCtx = document.getElementById('workload-chart').getContext('2d');
    const reasonsCtx = document.getElementById('postpone-reasons-chart').getContext('2d');
    const priorityCtx = document.getElementById('priority-chart').getContext('2d');
    
    // Удаляем старые графики, если они есть
    if (window.contactsChart) window.contactsChart.destroy();
    if (window.workloadChart) window.workloadChart.destroy();
    if (window.reasonsChart) window.reasonsChart.destroy();
    if (window.priorityChart) window.priorityChart.destroy();
    
    // График выполнения контактов
    window.contactsChart = new Chart(contactsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Выполнено', 'Просрочено', 'Перенесено', 'Запланировано'],
            datasets: [{
                data: [
                    contacts.filter(c => c.status === 'completed').length,
                    contacts.filter(c => c.status === 'overdue').length,
                    contacts.filter(c => c.status === 'postponed').length,
                    contacts.filter(c => c.status === 'planned').length
                ],
                backgroundColor: [
                    '#4CAF50', // green
                    '#F44336', // red
                    '#FFC107', // yellow
                    '#2196F3'  // blue
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // График нагрузки по дням
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return formatDateToYMD(d);
    }).reverse();
    
    const workloadData = last7Days.map(date => {
        return contacts.filter(c => c.date === date).length;
    });
    
    window.workloadChart = new Chart(workloadCtx, {
        type: 'bar',
        data: {
            labels: last7Days.map(date => formatDate(new Date(date))),
            datasets: [{
                label: 'Количество контактов',
                data: workloadData,
                backgroundColor: '#4a6fa5',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // График причин переносов (заглушка)
    window.reasonsChart = new Chart(reasonsCtx, {
        type: 'pie',
        data: {
            labels: ['Нет ответа', 'Партнер занят', 'Перенесено по договоренности', 'Другие причины'],
            datasets: [{
                data: [12, 8, 5, 3],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // График распределения по приоритетам
    window.priorityChart = new Chart(priorityCtx, {
        type: 'polarArea',
        data: {
            labels: ['Высокий', 'Средний', 'Низкий'],
            datasets: [{
                data: [
                    contacts.filter(c => c.priority === 'high').length,
                    contacts.filter(c => c.priority === 'medium').length,
                    contacts.filter(c => c.priority === 'low').length
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}