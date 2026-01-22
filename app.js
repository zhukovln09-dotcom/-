// Расширенный app.js с реальной работой с Firebase

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Проверяем, на какой странице мы находимся
    const currentPage = window.location.pathname.split('/').pop();
    
    // Проверяем статус авторизации через Firebase
    checkFirebaseAuthStatus();
    
    // Загружаем данные для главной страницы
    if (currentPage === 'index.html' || currentPage === '') {
        loadHomePageData();
    }
    
    // Загружаем данные для страницы идей
    if (currentPage === 'ideas.html') {
        loadIdeasPage();
    }
    
    // Загружаем данные для страницы проектов
    if (currentPage === 'projects.html') {
        loadProjectsPage();
    }
    
    // Загружаем данные для страницы голосования
    if (currentPage === 'vote.html') {
        loadVotePage();
    }
    
    // Загружаем данные для страницы логина
    if (currentPage === 'login.html') {
        loadLoginPage();
    }
});

// Инициализация мобильного меню
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Закрытие меню при клике на ссылку
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.style.display = 'none';
            });
        });
        
        // Закрытие меню при клике вне меню
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileMenu.style.display = 'none';
            }
        });
    }
}

// Проверка статуса авторизации через Firebase
function checkFirebaseAuthStatus() {
    if (!window.firebaseAuth) {
        console.error("Firebase Auth не доступен");
        return;
    }
    
    window.firebaseAuth.onAuthStateChanged(function(user) {
        updateUIForAuth(user);
    });
}

// Обновленная функция загрузки идей
async function loadLatestIdeas() {
    const ideasContainer = document.getElementById('latestIdeas');
    if (!ideasContainer) return;
    
    try {
        ideasContainer.innerHTML = '<div class="loading">Загрузка идей...</div>';
        
        // Загружаем из Firebase
        if (window.firebaseDb) {
            const querySnapshot = await window.firebaseDb.collection('ideas')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();
            
            if (!querySnapshot.empty) {
                const ideas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Форматируем дату
                    formattedDate: doc.data().createdAt 
                        ? new Date(doc.data().createdAt.toDate()).toLocaleDateString('ru-RU')
                        : 'Дата не указана'
                }));
                
                displayIdeas(ideas, ideasContainer);
            } else {
                ideasContainer.innerHTML = '<div class="loading">Идей пока нет. Будьте первым!</div>';
            }
        } else {
            throw new Error("Firebase недоступен");
        }
    } catch (error) {
        console.error("Ошибка загрузки идей:", error);
        // Резервный вариант с демо-данными
        const demoIdeas = getDemoIdeas().slice(0, 3);
        displayIdeas(demoIdeas, ideasContainer);
    }
}

// Обновление интерфейса в зависимости от статуса авторизации
function updateUIForAuth(user) {
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        if (user) {
            // Пользователь вошел
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Мой профиль';
            loginBtn.href = 'profile.html';
            
            // Сохраняем данные пользователя в localStorage для быстрого доступа
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0]
            }));
        } else {
            // Пользователь не вошел
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Войти';
            loginBtn.href = 'login.html';
            localStorage.removeItem('currentUser');
        }
    }
    
    // Обновляем страницу логина, если она открыта
    updateLoginPage(user);
}

// Обновление страницы логина
function updateLoginPage(user) {
    const userInfo = document.getElementById('userInfo');
    const authForm = document.getElementById('authForm');
    
    if (userInfo && authForm) {
        if (user) {
            userInfo.style.display = 'block';
            authForm.style.display = 'none';
            
            // Заполняем данные пользователя
            document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').textContent = getUserInitials(user.displayName || user.email);
        } else {
            userInfo.style.display = 'none';
            authForm.style.display = 'block';
        }
    }
}

// Получение инициалов пользователя
function getUserInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// ==================== ГЛАВНАЯ СТРАНИЦА ====================

// Загрузка данных для главной страницы
async function loadHomePageData() {
    try {
        // Загружаем статистику
        await loadStats();
        
        // Загружаем последние идеи
        await loadLatestIdeas();
    } catch (error) {
        console.error("Ошибка загрузки данных главной страницы:", error);
        showFallbackHomeData();
    }
}

// Загрузка статистики из Firebase
async function loadStats() {
    try {
        // В реальном приложении здесь бы были запросы к Firestore
        // Для демонстрации используем фиктивные данные
        
        const stats = {
            activeProjects: 12,
            totalIdeas: 47,
            totalVotes: 289,
            activeUsers: 84
        };
        
        // Если Firestore доступен, пытаемся получить реальные данные
        if (window.firebaseDb) {
            try {
                // Пример получения количества идей
                const ideasSnapshot = await window.firebaseDb.collection('ideas').get();
                stats.totalIdeas = ideasSnapshot.size;
                
                // Пример получения количества проектов
                const projectsSnapshot = await window.firebaseDb.collection('projects')
                    .where('status', '==', 'active').get();
                stats.activeProjects = projectsSnapshot.size;
            } catch (dbError) {
                console.log("Используем демо-данные, так как база данных недоступна:", dbError);
            }
        }
        
        // Обновляем DOM с данными статистики
        document.getElementById('activeProjectsCount').textContent = stats.activeProjects;
        document.getElementById('totalIdeasCount').textContent = stats.totalIdeas;
        document.getElementById('totalVotesCount').textContent = stats.totalVotes;
        document.getElementById('activeUsersCount').textContent = stats.activeUsers;
        
    } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
    }
}

// Загрузка последних идей из Firebase
async function loadLatestIdeas() {
    const ideasContainer = document.getElementById('latestIdeas');
    if (!ideasContainer) return;
    
    try {
        ideasContainer.innerHTML = '<div class="loading">Загрузка идей...</div>';
        
        let ideas = [];
        
        // Пытаемся загрузить из Firebase
        if (window.firebaseDb) {
            try {
                const querySnapshot = await window.firebaseDb.collection('ideas')
                    .orderBy('createdAt', 'desc')
                    .limit(3)
                    .get();
                
                ideas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (dbError) {
                console.log("Используем демо-данные для идей:", dbError);
            }
        }
        
        // Если нет данных из Firebase, используем демо-данные
        if (ideas.length === 0) {
            ideas = getDemoIdeas().slice(0, 3);
        }
        
        // Отображаем идеи
        displayIdeas(ideas, ideasContainer);
        
    } catch (error) {
        console.error("Ошибка загрузки идей:", error);
        ideasContainer.innerHTML = '<div class="loading">Не удалось загрузить идеи. Попробуйте позже.</div>';
    }
}

// Демо-данные для идей (используются если Firebase недоступен)
function getDemoIdeas() {
    return [
        {
            id: 1,
            title: "Школьный сад",
            author: "Анна Петрова, 10Б",
            description: "Предлагаю создать школьный сад с овощами и цветами на пустующем участке за спортзалом.",
            votes: 24,
            date: "15.10.2023",
            status: "активная",
            createdAt: new Date()
        },
        {
            id: 2,
            title: "День культур народов мира",
            author: "Иван Сидоров, 9А",
            description: "Организовать день, когда каждый класс представит культуру разных народов мира.",
            votes: 18,
            date: "12.10.2023",
            status: "активная",
            createdAt: new Date()
        },
        {
            id: 3,
            title: "Книгообмен в школе",
            author: "Мария Иванова, 11А",
            description: "Установить полку в холле для свободного обмена книгами между учениками.",
            votes: 32,
            date: "10.10.2023",
            status: "в реализации",
            createdAt: new Date()
        },
        {
            id: 4,
            title: "Фестиваль школьных талантов",
            author: "Петр Кузнецов, 8Б",
            description: "Провести ежегодный фестиваль талантов, где каждый ученик может показать свои способности.",
            votes: 41,
            date: "05.10.2023",
            status: "активная",
            createdAt: new Date()
        },
        {
            id: 5,
            title: "Школьное радио",
            author: "Ольга Смирнова, 10А",
            description: "Создать школьное радио для объявлений и музыкальных пауз на переменах.",
            votes: 29,
            date: "02.10.2023",
            status: "активная",
            createdAt: new Date()
        },
        {
            id: 6,
            title: "Уроки финансовой грамотности",
            author: "Дмитрий Волков, 11Б",
            description: "Ввести факультативные занятия по финансовой грамотности для старшеклассников.",
            votes: 37,
            date: "28.09.2023",
            status: "рассматривается",
            createdAt: new Date()
        }
    ];
}

// Отображение идей в контейнере
function displayIdeas(ideas, container) {
    container.innerHTML = '';
    
    if (ideas.length === 0) {
        container.innerHTML = '<div class="loading">Идей пока нет. Будьте первым!</div>';
        return;
    }
    
    ideas.forEach(idea => {
        const ideaElement = document.createElement('div');
        ideaElement.className = 'idea-card';
        ideaElement.innerHTML = createIdeaHTML(idea);
        container.appendChild(ideaElement);
    });
}

// Создание HTML для идеи
function createIdeaHTML(idea) {
    const statusColor = getStatusColor(idea.status);
    
    return `
        <div class="idea-header">
            <h3 class="idea-title">${idea.title}</h3>
            <div class="idea-author">${idea.author} • ${idea.date || formatDate(idea.createdAt)}</div>
            ${idea.status ? `<div class="idea-status" style="display: inline-block; background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">${idea.status}</div>` : ''}
        </div>
        <div class="idea-body">
            <p class="idea-description">${idea.description}</p>
        </div>
        <div class="idea-footer">
            <div class="vote-count">${idea.votes || 0} голосов</div>
            <button class="vote-btn" onclick="voteForIdea('${idea.id}')">Голосовать</button>
        </div>
    `;
}

// Форматирование даты
function formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('ru-RU');
}

// Получение цвета статуса
function getStatusColor(status) {
    switch(status) {
        case 'в реализации': return '#ff9800';
        case 'рассматривается': return '#9e9e9e';
        case 'завершен': return '#4CAF50';
        default: return '#4a6fa5';
    }
}

// Резервные данные для главной страницы
function showFallbackHomeData() {
    // Устанавливаем демо-статистику
    document.getElementById('activeProjectsCount').textContent = 12;
    document.getElementById('totalIdeasCount').textContent = 47;
    document.getElementById('totalVotesCount').textContent = 289;
    document.getElementById('activeUsersCount').textContent = 84;
    
    // Загружаем демо-идеи
    const ideasContainer = document.getElementById('latestIdeas');
    if (ideasContainer) {
        const ideas = getDemoIdeas().slice(0, 3);
        displayIdeas(ideas, ideasContainer);
    }
}

// ==================== СТРАНИЦА ИДЕЙ ====================

// Загрузка страницы идей
function loadIdeasPage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const ideasContainer = document.getElementById('ideasContainer');
    
    if (pageTitle) pageTitle.textContent = "Идеи для школы";
    if (pageDescription) pageDescription.textContent = "Предложите свою идею или поддержите идеи других учеников";
    
    // Загружаем контент страницы
    ideasContainer.innerHTML = `
        <div class="form-container" id="ideaFormContainer">
            <h2>Предложить новую идею</h2>
            <form id="ideaForm">
                <div class="form-group">
                    <label for="ideaTitle">Название идеи</label>
                    <input type="text" id="ideaTitle" class="form-control" placeholder="Введите название идеи" required>
                </div>
                <div class="form-group">
                    <label for="ideaDescription">Описание идеи</label>
                    <textarea id="ideaDescription" class="form-control" placeholder="Опишите свою идею подробно" required></textarea>
                </div>
                <div class="form-group">
                    <label for="ideaAuthor">Ваше имя и класс</label>
                    <input type="text" id="ideaAuthor" class="form-control" placeholder="Например: Иван Иванов, 10А" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Предложить идею</button>
            </form>
        </div>
        <div class="section">
            <h2>Все идеи</h2>
            <div class="ideas-grid" id="allIdeas">
                <!-- Идеи будут загружены здесь -->
            </div>
        </div>
    `;
    
    // Инициализируем форму
    const ideaForm = document.getElementById('ideaForm');
    if (ideaForm) {
        ideaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitIdea();
        });
    }
    
    // Загружаем список идей
    loadAllIdeas();
}

// Загрузка всех идей
async function loadAllIdeas() {
    const allIdeasContainer = document.getElementById('allIdeas');
    if (!allIdeasContainer) return;
    
    try {
        allIdeasContainer.innerHTML = '<div class="loading">Загрузка идей...</div>';
        
        let ideas = [];
        
        // Пытаемся загрузить из Firebase
        if (window.firebaseDb) {
            try {
                const querySnapshot = await window.firebaseDb.collection('ideas')
                    .orderBy('createdAt', 'desc')
                    .get();
                
                ideas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (dbError) {
                console.log("Используем демо-данные:", dbError);
            }
        }
        
        // Если нет данных из Firebase, используем демо-данные
        if (ideas.length === 0) {
            ideas = getDemoIdeas();
        }
        
        // Отображаем идеи
        displayIdeas(ideas, allIdeasContainer);
        
    } catch (error) {
        console.error("Ошибка загрузки всех идей:", error);
        allIdeasContainer.innerHTML = '<div class="loading">Не удалось загрузить идеи. Попробуйте позже.</div>';
    }
}

// Отправка новой идеи
async function submitIdea() {
    const title = document.getElementById('ideaTitle').value;
    const description = document.getElementById('ideaDescription').value;
    const author = document.getElementById('ideaAuthor').value;
    
    if (!title || !description || !author) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Проверяем, авторизован ли пользователь
    const user = window.firebaseAuth ? window.firebaseAuth.currentUser : null;
    if (!user) {
        alert('Для предложения идеи необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Создаем объект идеи
        const idea = {
            title: title,
            description: description,
            author: author,
            votes: 0,
            status: "активная",
            userId: user.uid,
            userEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Сохраняем в Firebase
        if (window.firebaseDb) {
            await window.firebaseDb.collection('ideas').add(idea);
            alert('Идея успешно отправлена!');
            
            // Очищаем форму
            document.getElementById('ideaTitle').value = '';
            document.getElementById('ideaDescription').value = '';
            document.getElementById('ideaAuthor').value = '';
            
            // Обновляем список идей
            await loadAllIdeas();
        } else {
            alert('Идея отправлена (демо-режим). В реальном приложении она бы сохранилась в базе данных.');
        }
        
    } catch (error) {
        console.error("Ошибка при отправке идеи:", error);
        alert('Произошла ошибка при отправке идеи. Попробуйте еще раз.');
    }
}

// ==================== СТРАНИЦА ПРОЕКТОВ ====================

// Загрузка страницы проектов
async function loadProjectsPage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const projectsContainer = document.getElementById('projectsContainer');
    
    if (pageTitle) pageTitle.textContent = "Проекты";
    if (pageDescription) pageDescription.textContent = "Активные и завершенные проекты школы. Присоединяйтесь к реализации или создавайте свои проекты!";
    
    try {
        // Загружаем проекты из Firebase или используем демо-данные
        let activeProjects = [];
        let completedProjects = [];
        
        if (window.firebaseDb) {
            try {
                // Активные проекты
                const activeSnapshot = await window.firebaseDb.collection('projects')
                    .where('status', 'in', ['active', 'in_progress'])
                    .orderBy('createdAt', 'desc')
                    .get();
                activeProjects = activeSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Завершенные проекты
                const completedSnapshot = await window.firebaseDb.collection('projects')
                    .where('status', '==', 'completed')
                    .orderBy('completedAt', 'desc')
                    .limit(5)
                    .get();
                completedProjects = completedSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (dbError) {
                console.log("Используем демо-данные для проектов:", dbError);
            }
        }
        
        // Если нет данных, используем демо
        if (activeProjects.length === 0 && completedProjects.length === 0) {
            activeProjects = getDemoActiveProjects();
            completedProjects = getDemoCompletedProjects();
        }
        
        // Отображаем проекты
        displayProjects(activeProjects, completedProjects, projectsContainer);
        
    } catch (error) {
        console.error("Ошибка загрузки проектов:", error);
        projectsContainer.innerHTML = '<div class="loading">Не удалось загрузить проекты. Попробуйте позже.</div>';
    }
}

// Демо-активные проекты
function getDemoActiveProjects() {
    return [
        {
            id: 1,
            title: "Школьный сад",
            author: "Анна Петрова, 10Б",
            description: "Создание школьного сада с овощами и цветами на пустующем участке за спортзалом. Сейчас идет сбор семян и инструментов.",
            votes: 24,
            date: "15.10.2023",
            status: "в процессе",
            teamSize: 8,
            nextStep: "Подготовка почвы (25.10.2023)"
        },
        {
            id: 2,
            title: "Школьное радио",
            author: "Ольга Смирнова, 10А",
            description: "Создание школьного радио для объявлений и музыкальных пауз на переменах. Уже закуплено оборудование, идет монтаж студии.",
            votes: 29,
            date: "02.10.2023",
            status: "в процессе",
            teamSize: 6,
            nextStep: "Тестовый эфир (30.10.2023)"
        }
    ];
}

// Демо-завершенные проекты
function getDemoCompletedProjects() {
    return [
        {
            id: 3,
            title: "Книгообмен в школе",
            author: "Мария Иванова, 11А",
            description: "Установка полки в холле для свободного обмена книгами между учениками. Проект успешно реализован, полка установлена возле библиотеки.",
            votes: 32,
            date: "10.10.2023",
            status: "завершен",
            teamSize: 4,
            completedAt: "20.10.2023"
        }
    ];
}

// Отображение проектов
function displayProjects(activeProjects, completedProjects, container) {
    container.innerHTML = '';
    
    // Активные проекты
    let activeProjectsHTML = '';
    if (activeProjects.length > 0) {
        activeProjects.forEach(project => {
            activeProjectsHTML += createProjectHTML(project, 'active');
        });
    } else {
        activeProjectsHTML = '<div class="loading">Активных проектов пока нет</div>';
    }
    
    // Завершенные проекты
    let completedProjectsHTML = '';
    if (completedProjects.length > 0) {
        completedProjects.forEach(project => {
            completedProjectsHTML += createProjectHTML(project, 'completed');
        });
    } else {
        completedProjectsHTML = '<div class="loading">Завершенных проектов пока нет</div>';
    }
    
    container.innerHTML = `
        <div class="section">
            <h2>Активные проекты</h2>
            <div class="ideas-grid">
                ${activeProjectsHTML}
            </div>
        </div>
        
        <div class="section section-gray">
            <h2>Завершенные проекты</h2>
            <div class="ideas-grid">
                ${completedProjectsHTML}
            </div>
        </div>
    `;
}

// Создание HTML для проекта
function createProjectHTML(project, type) {
    const statusColor = type === 'completed' ? '#4CAF50' : '#ff9800';
    const statusText = type === 'completed' ? 'завершен' : 'в процессе';
    const buttonText = type === 'completed' ? 'Подробнее' : 'Присоединиться';
    const buttonAction = type === 'completed' ? `viewProject('${project.id}')` : `joinProject('${project.id}')`;
    
    return `
        <div class="idea-card">
            <div class="idea-header">
                <h3 class="idea-title">${project.title}</h3>
                <div class="idea-author">${project.author} • ${project.date}</div>
                <div class="idea-status" style="display: inline-block; background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">${statusText}</div>
            </div>
            <div class="idea-body">
                <p class="idea-description">${project.description}</p>
                <p><strong>Команда:</strong> ${project.teamSize || 0} человек</p>
                ${type === 'active' ? `<p><strong>Следующий этап:</strong> ${project.nextStep || 'Определяется'}</p>` : ''}
                ${type === 'completed' ? `<p><strong>Завершен:</strong> ${project.completedAt || 'Не указано'}</p>` : ''}
            </div>
            <div class="idea-footer">
                <div class="vote-count">${project.votes || 0} голосов</div>
                <button class="${type === 'completed' ? 'btn btn-outline' : 'vote-btn'}" onclick="${buttonAction}" style="padding: 8px 15px;">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
}

// ==================== СТРАНИЦА ГОЛОСОВАНИЯ ====================

// Загрузка страницы голосования
async function loadVotePage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const voteContainer = document.getElementById('voteContainer');
    
    if (pageTitle) pageTitle.textContent = "Голосование";
    if (pageDescription) pageDescription.textContent = "Проголосуйте за лучшие идеи для реализации в школе";
    
    try {
        // Загружаем идеи для голосования
        let votingIdeas = [];
        
        if (window.firebaseDb) {
            try {
                const querySnapshot = await window.firebaseDb.collection('ideas')
                    .where('status', 'in', ['активная', 'рассматривается'])
                    .orderBy('votes', 'desc')
                    .limit(10)
                    .get();
                
                votingIdeas = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (dbError) {
                console.log("Используем демо-данные для голосования:", dbError);
            }
        }
        
        // Если нет данных, используем демо
        if (votingIdeas.length === 0) {
            votingIdeas = getDemoVotingIdeas();
        }
        
        // Отображаем страницу голосования
        displayVotePage(votingIdeas, voteContainer);
        
    } catch (error) {
        console.error("Ошибка загрузки страницы голосования:", error);
        voteContainer.innerHTML = '<div class="loading">Не удалось загрузить данные для голосования. Попробуйте позже.</div>';
    }
}

// Демо-идеи для голосования
function getDemoVotingIdeas() {
    return [
        {
            id: 4,
            title: "Фестиваль школьных талантов",
            author: "Петр Кузнецов, 8Б",
            description: "Провести ежегодный фестиваль талантов, где каждый ученик может показать свои способности: пение, танцы, рисование, спорт и др.",
            votes: 41,
            date: "05.10.2023",
            status: "активная"
        },
        {
            id: 6,
            title: "Уроки финансовой грамотности",
            author: "Дмитрий Волков, 11Б",
            description: "Ввести факультативные занятия по финансовой грамотности для старшеклассников: бюджет, инвестиции, налоги, кредиты.",
            votes: 37,
            date: "28.09.2023",
            status: "рассматривается"
        },
        {
            id: 7,
            title: "День самоуправления",
            author: "Екатерина Новикова, 9В",
            description: "Провести день, когда ученики старших классов заменят учителей и администрацию школы, чтобы понять их работу.",
            votes: 22,
            date: "20.10.2023",
            status: "активная"
        }
    ];
}

// Отображение страницы голосования
function displayVotePage(ideas, container) {
    container.innerHTML = '';
    
    // Идеи для голосования
    let ideasHTML = '';
    if (ideas.length > 0) {
        ideas.forEach(idea => {
            ideasHTML += `
                <div class="idea-card">
                    <div class="idea-header">
                        <h3 class="idea-title">${idea.title}</h3>
                        <div class="idea-author">${idea.author} • ${idea.date}</div>
                    </div>
                    <div class="idea-body">
                        <p class="idea-description">${idea.description}</p>
                    </div>
                    <div class="idea-footer">
                        <div class="vote-count">${idea.votes || 0} голосов</div>
                        <button class="vote-btn" onclick="voteForIdea('${idea.id}')">Голосовать</button>
                    </div>
                </div>
            `;
        });
    } else {
        ideasHTML = '<div class="loading">Идей для голосования пока нет</div>';
    }
    
    container.innerHTML = `
        <div class="section">
            <h2>Идеи для голосования</h2>
            <p class="text-center" style="margin-bottom: 30px;">Вы можете отдать свой голос за одну или несколько идей. Идеи с наибольшим количеством голосов будут рассмотрены для реализации.</p>
            
            <div class="ideas-grid">
                ${ideasHTML}
            </div>
            
            <div class="text-center" style="margin-top: 40px;">
                <h3>Результаты голосования</h3>
                <div style="max-width: 600px; margin: 30px auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                    <canvas id="voteChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Инициализируем график голосования
    initVoteChart(ideas);
}

// Инициализация графика голосования
function initVoteChart(ideas) {
    const canvas = document.getElementById('voteChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Подготавливаем данные для графика
    const labels = ideas.map(idea => idea.title.length > 15 ? idea.title.substring(0, 15) + '...' : idea.title);
    const data = ideas.map(idea => idea.votes || 0);
    
    // Цвета для графика
    const backgroundColors = [
        '#4a6fa5', '#ff9800', '#9c27b0', '#4CAF50', '#2196F3',
        '#FF5722', '#795548', '#607D8B', '#9C27B0', '#3F51B5'
    ];
    
    // Создаем график
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Количество голосов',
                data: data,
                backgroundColor: backgroundColors.slice(0, ideas.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Голосов: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Количество голосов'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Идеи'
                    }
                }
            }
        }
    });
}

// ==================== СТРАНИЦА ЛОГИНА ====================

// Загрузка страницы логина
function loadLoginPage() {
    const loginContainer = document.getElementById('loginContainer');
    
    if (!loginContainer) return;
    
    loginContainer.innerHTML = `
        <div class="login-container">
            <div class="login-header">
                <h1>Вход в систему</h1>
                <p>Войдите, чтобы предлагать идеи, голосовать и участвовать в проектах</p>
            </div>
            
            <div id="authForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" class="form-control" placeholder="ваш@email.com" value="test@example.com">
                </div>
                <div class="form-group">
                    <label for="loginPassword">Пароль</label>
                    <input type="password" id="loginPassword" class="form-control" placeholder="Пароль" value="password123">
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 15px;" onclick="loginUser()">Войти</button>
                <button class="btn btn-outline" style="width: 100%; margin-bottom: 15px;" onclick="showRegisterForm()">Зарегистрироваться</button>
                <div style="text-align: center; margin-top: 20px; color: #666;">
                    <p>Для демонстрации используйте:<br>Email: test@example.com<br>Пароль: password123</p>
                </div>
            </div>
            
            <div id="userInfo" style="display: none;">
                <div class="user-info" style="justify-content: center; margin-bottom: 20px;">
                    <div class="user-avatar" id="userAvatar">ИИ</div>
                    <div>
                        <h3 id="userName">Иван Иванов</h3>
                        <p id="userEmail">ivan@example.com</p>
                    </div>
                </div>
                <button class="btn btn-outline" style="width: 100%;" onclick="logoutUser()">Выйти</button>
            </div>
        </div>
    `;
    
    // Проверяем статус авторизации
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        updateLoginPage(window.firebaseAuth.currentUser);
    }
}

// Вход пользователя
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль');
        return;
    }
    
    try {
        // Пытаемся войти через Firebase
        if (window.firebaseAuth) {
            await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            alert('Вход выполнен успешно!');
            window.location.href = 'index.html';
        } else {
            // Демо-режим
            alert('Вход выполнен (демо-режим). В реальном приложении использовалась бы аутентификация Firebase.');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', email.split('@')[0]);
            updateUIForAuth({ email: email, displayName: email.split('@')[0] });
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert(`Ошибка входа: ${error.message || error}`);
    }
}

// Регистрация пользователя
async function registerUser(email, password, displayName) {
    try {
        if (window.firebaseAuth) {
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            
            // Обновляем имя пользователя
            await userCredential.user.updateProfile({
                displayName: displayName
            });
            
            // Создаем запись о пользователе в Firestore
            if (window.firebaseDb) {
                await window.firebaseDb.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    displayName: displayName,
                    role: 'student',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            alert('Регистрация успешна!');
            return userCredential.user;
        } else {
            // Демо-режим
            alert('Регистрация выполнена (демо-режим).');
            return { email: email, displayName: displayName };
        }
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        throw error;
    }
}

// Показать форму регистрации
function showRegisterForm() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return;
    
    authForm.innerHTML = `
        <div class="form-group">
            <label for="registerName">Имя и фамилия</label>
            <input type="text" id="registerName" class="form-control" placeholder="Иван Иванов">
        </div>
        <div class="form-group">
            <label for="registerClass">Класс</label>
            <input type="text" id="registerClass" class="form-control" placeholder="10А">
        </div>
        <div class="form-group">
            <label for="registerEmail">Email</label>
            <input type="email" id="registerEmail" class="form-control" placeholder="ваш@email.com">
        </div>
        <div class="form-group">
            <label for="registerPassword">Пароль</label>
            <input type="password" id="registerPassword" class="form-control" placeholder="Пароль (минимум 6 символов)">
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-bottom: 15px;" onclick="performRegistration()">Зарегистрироваться</button>
        <button class="btn btn-outline" style="width: 100%;" onclick="showLoginForm()">Уже есть аккаунт? Войти</button>
    `;
}

// Показать форму входа
function showLoginForm() {
    loadLoginPage();
}

// Выполнить регистрацию
async function performRegistration() {
    const name = document.getElementById('registerName').value;
    const className = document.getElementById('registerClass').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
    }
    
    const displayName = className ? `${name}, ${className}` : name;
    
    try {
        await registerUser(email, password, displayName);
        alert('Регистрация успешна! Теперь вы можете войти.');
        showLoginForm();
    } catch (error) {
        alert(`Ошибка регистрации: ${error.message || error}`);
    }
}

// Выход пользователя
async function logoutUser() {
    try {
        if (window.firebaseAuth) {
            await window.firebaseAuth.signOut();
        } else {
            // Демо-режим
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
        }
        
        alert('Выход выполнен успешно!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Ошибка выхода:", error);
        alert(`Ошибка выхода: ${error.message || error}`);
    }
}

// ==================== ОБЩИЕ ФУНКЦИИ ====================

// Голосование за идею
async function voteForIdea(ideaId) {
    // Проверяем авторизацию
    const user = window.firebaseAuth ? window.firebaseAuth.currentUser : null;
    if (!user) {
        alert('Для голосования необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        if (window.firebaseDb) {
            // Проверяем, голосовал ли уже пользователь за эту идею
            const voteDoc = await window.firebaseDb.collection('votes')
                .where('ideaId', '==', ideaId)
                .where('userId', '==', user.uid)
                .get();
            
            if (!voteDoc.empty) {
                alert('Вы уже голосовали за эту идею!');
                return;
            }
            
            // Добавляем голос
            await window.firebaseDb.collection('votes').add({
                ideaId: ideaId,
                userId: user.uid,
                userEmail: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Обновляем счетчик голосов в идее
            const ideaRef = window.firebaseDb.collection('ideas').doc(ideaId);
            await ideaRef.update({
                votes: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('Спасибо за ваш голос!');
            
            // Обновляем страницу
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'vote.html') {
                loadVotePage();
            } else if (currentPage === 'ideas.html') {
                loadAllIdeas();
            } else {
                loadLatestIdeas();
            }
            
        } else {
            alert('Голос принят (демо-режим). В реальном приложении голос бы сохранился в базе данных.');
        }
    } catch (error) {
        console.error("Ошибка при голосовании:", error);
        alert(`Ошибка при голосовании: ${error.message || error}`);
    }
}

// Присоединение к проекту
async function joinProject(projectId) {
    // Проверяем авторизацию
    const user = window.firebaseAuth ? window.firebaseAuth.currentUser : null;
    if (!user) {
        alert('Для присоединения к проекту необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        if (window.firebaseDb) {
            // Проверяем, состоит ли уже пользователь в проекте
            const memberDoc = await window.firebaseDb.collection('projectMembers')
                .where('projectId', '==', projectId)
                .where('userId', '==', user.uid)
                .get();
            
            if (!memberDoc.empty) {
                alert('Вы уже состоите в этом проекте!');
                return;
            }
            
            // Добавляем пользователя в проект
            await window.firebaseDb.collection('projectMembers').add({
                projectId: projectId,
                userId: user.uid,
                userEmail: user.email,
                role: 'member',
                joinedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Обновляем счетчик участников в проекте
            const projectRef = window.firebaseDb.collection('projects').doc(projectId);
            await projectRef.update({
                teamSize: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('Вы успешно присоединились к проекту!');
            
            // Обновляем страницу проектов
            loadProjectsPage();
            
        } else {
            alert('Вы присоединились к проекту (демо-режим). В реальном приложении ваши данные бы сохранились в базе данных.');
        }
    } catch (error) {
        console.error("Ошибка при присоединении к проекту:", error);
        alert(`Ошибка при присоединении к проекту: ${error.message || error}`);
    }
}

// Просмотр проекта
function viewProject(projectId) {
    alert(`Подробная информация о проекте #${projectId}. В реальном приложении здесь бы открылась страница проекта.`);
    // В реальном приложении здесь бы была переадресация на страницу проекта
}

// ==================== ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ ====================

// Функция для инициализации демо-данных в Firebase
async function initializeDemoData() {
    if (!window.firebaseDb) {
        console.log("Firebase недоступен, пропускаем инициализацию данных");
        return;
    }
    
    try {
        // Проверяем, есть ли уже идеи в базе
        const ideasSnapshot = await window.firebaseDb.collection('ideas').limit(1).get();
        
        if (ideasSnapshot.empty) {
            console.log("Инициализируем демо-данные...");
            
            // Добавляем демо-идеи
            const demoIdeas = getDemoIdeas();
            for (const idea of demoIdeas) {
                await window.firebaseDb.collection('ideas').add({
                    ...idea,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Добавляем демо-проекты
            const demoActiveProjects = getDemoActiveProjects();
            for (const project of demoActiveProjects) {
                await window.firebaseDb.collection('projects').add({
                    ...project,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            const demoCompletedProjects = getDemoCompletedProjects();
            for (const project of demoCompletedProjects) {
                await window.firebaseDb.collection('projects').add({
                    ...project,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    completedAt: project.completedAt || new Date().toISOString()
                });
            }
            
            console.log("Демо-данные успешно инициализированы!");
        }
    } catch (error) {
        console.error("Ошибка при инициализации демо-данных:", error);
    }
}

// Инициализируем демо-данные при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Даем время на загрузку Firebase
    setTimeout(() => {
        initializeDemoData();
    }, 2000);
});
