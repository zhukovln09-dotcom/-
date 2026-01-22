// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Проверяем, на какой странице мы находимся
    const currentPage = window.location.pathname.split('/').pop();
    
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
    
    // Проверяем статус авторизации
    checkAuthStatus();
});

// Инициализация мобильного меню
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            if (mobileMenu.style.display === 'flex') {
                mobileMenu.style.display = 'none';
            } else {
                mobileMenu.style.display = 'flex';
            }
        });
        
        // Закрытие меню при клике на ссылку
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.style.display = 'none';
            });
        });
    }
}

// Загрузка данных для главной страницы
function loadHomePageData() {
    // Загружаем статистику
    loadStats();
    
    // Загружаем последние идеи
    loadLatestIdeas();
}

// Загрузка статистики
function loadStats() {
    // Здесь мы бы загружали реальные данные из Firebase
    // Для демонстрации используем фиктивные данные
    const stats = {
        activeProjects: 12,
        totalIdeas: 47,
        totalVotes: 289,
        activeUsers: 84
    };
    
    // Обновляем DOM с данными статистики
    document.getElementById('activeProjectsCount').textContent = stats.activeProjects;
    document.getElementById('totalIdeasCount').textContent = stats.totalIdeas;
    document.getElementById('totalVotesCount').textContent = stats.totalVotes;
    document.getElementById('activeUsersCount').textContent = stats.activeUsers;
}

// Загрузка последних идей
function loadLatestIdeas() {
    const ideasContainer = document.getElementById('latestIdeas');
    
    // Фиктивные данные для демонстрации
    const ideas = [
        {
            id: 1,
            title: "Школьный сад",
            author: "Анна Петрова, 10Б",
            description: "Предлагаю создать школьный сад с овощами и цветами на пустующем участке за спортзалом.",
            votes: 24,
            date: "15.10.2023"
        },
        {
            id: 2,
            title: "День культур народов мира",
            author: "Иван Сидоров, 9А",
            description: "Организовать день, когда каждый класс представит культуру разных народов мира.",
            votes: 18,
            date: "12.10.2023"
        },
        {
            id: 3,
            title: "Книгообмен в школе",
            author: "Мария Иванова, 11А",
            description: "Установить полку в холле для свободного обмена книгами между учениками.",
            votes: 32,
            date: "10.10.2023"
        }
    ];
    
    // Очищаем контейнер
    ideasContainer.innerHTML = '';
    
    // Добавляем идеи в DOM
    ideas.forEach(idea => {
        const ideaElement = document.createElement('div');
        ideaElement.className = 'idea-card';
        ideaElement.innerHTML = `
            <div class="idea-header">
                <h3 class="idea-title">${idea.title}</h3>
                <div class="idea-author">${idea.author} • ${idea.date}</div>
            </div>
            <div class="idea-body">
                <p class="idea-description">${idea.description}</p>
            </div>
            <div class="idea-footer">
                <div class="vote-count">${idea.votes} голосов</div>
                <button class="vote-btn" onclick="voteForIdea(${idea.id})">Голосовать</button>
            </div>
        `;
        ideasContainer.appendChild(ideaElement);
    });
}

// Загрузка страницы идей
function loadIdeasPage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const ideasContainer = document.getElementById('ideasContainer');
    
    if (pageTitle) pageTitle.textContent = "Идеи для школы";
    if (pageDescription) pageDescription.textContent = "Предложите свою идею или поддержите идеи других учеников";
    
    // Загружаем все идеи
    // В реальном приложении здесь был бы запрос к Firebase
    setTimeout(() => {
        if (ideasContainer) {
            ideasContainer.innerHTML = `
                <div class="form-container">
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
    }, 100);
}

// Загрузка всех идей
function loadAllIdeas() {
    const allIdeasContainer = document.getElementById('allIdeas');
    
    if (!allIdeasContainer) return;
    
    // Фиктивные данные
    const allIdeas = [
        {
            id: 1,
            title: "Школьный сад",
            author: "Анна Петрова, 10Б",
            description: "Предлагаю создать школьный сад с овощами и цветами на пустующем участке за спортзалом.",
            votes: 24,
            date: "15.10.2023",
            status: "активная"
        },
        {
            id: 2,
            title: "День культур народов мира",
            author: "Иван Сидоров, 9А",
            description: "Организовать день, когда каждый класс представит культуру разных народов мира.",
            votes: 18,
            date: "12.10.2023",
            status: "активная"
        },
        {
            id: 3,
            title: "Книгообмен в школе",
            author: "Мария Иванова, 11А",
            description: "Установить полку в холле для свободного обмена книгами между учениками.",
            votes: 32,
            date: "10.10.2023",
            status: "в реализации"
        },
        {
            id: 4,
            title: "Фестиваль школьных талантов",
            author: "Петр Кузнецов, 8Б",
            description: "Провести ежегодный фестиваль талантов, где каждый ученик может показать свои способности.",
            votes: 41,
            date: "05.10.2023",
            status: "активная"
        },
        {
            id: 5,
            title: "Школьное радио",
            author: "Ольга Смирнова, 10А",
            description: "Создать школьное радио для объявлений и музыкальных пауз на переменах.",
            votes: 29,
            date: "02.10.2023",
            status: "активная"
        },
        {
            id: 6,
            title: "Уроки финансовой грамотности",
            author: "Дмитрий Волков, 11Б",
            description: "Ввести факультативные занятия по финансовой грамотности для старшеклассников.",
            votes: 37,
            date: "28.09.2023",
            status: "рассматривается"
        }
    ];
    
    // Очищаем контейнер
    allIdeasContainer.innerHTML = '';
    
    // Добавляем идеи в DOM
    allIdeas.forEach(idea => {
        const ideaElement = document.createElement('div');
        ideaElement.className = 'idea-card';
        
        // Определяем цвет статуса
        let statusColor = '#4a6fa5';
        if (idea.status === 'в реализации') statusColor = '#ff9800';
        if (idea.status === 'рассматривается') statusColor = '#9e9e9e';
        
        ideaElement.innerHTML = `
            <div class="idea-header">
                <h3 class="idea-title">${idea.title}</h3>
                <div class="idea-author">${idea.author} • ${idea.date}</div>
                <div class="idea-status" style="display: inline-block; background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">${idea.status}</div>
            </div>
            <div class="idea-body">
                <p class="idea-description">${idea.description}</p>
            </div>
            <div class="idea-footer">
                <div class="vote-count">${idea.votes} голосов</div>
                <button class="vote-btn" onclick="voteForIdea(${idea.id})">Голосовать</button>
            </div>
        `;
        allIdeasContainer.appendChild(ideaElement);
    });
}

// Загрузка страницы проектов
function loadProjectsPage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (pageTitle) pageTitle.textContent = "Проекты";
    if (pageDescription) pageDescription.textContent = "Активные и завершенные проекты школы";
    
    // Загружаем проекты
    setTimeout(() => {
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="section">
                    <h2>Активные проекты</h2>
                    <div class="ideas-grid">
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">Школьный сад</h3>
                                <div class="idea-author">Анна Петрова, 10Б • 15.10.2023</div>
                                <div class="idea-status" style="display: inline-block; background-color: #ff9800; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">в процессе</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Создание школьного сада с овощами и цветами на пустующем участке за спортзалом. Сейчас идет сбор семян и инструментов.</p>
                                <p><strong>Команда:</strong> 8 человек</p>
                                <p><strong>Следующий этап:</strong> Подготовка почвы (25.10.2023)</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">24 голоса</div>
                                <button class="vote-btn" onclick="joinProject(1)">Присоединиться</button>
                            </div>
                        </div>
                        
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">Школьное радио</h3>
                                <div class="idea-author">Ольга Смирнова, 10А • 02.10.2023</div>
                                <div class="idea-status" style="display: inline-block; background-color: #ff9800; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">в процессе</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Создание школьного радио для объявлений и музыкальных пауз на переменах. Уже закуплено оборудование, идет монтаж студии.</p>
                                <p><strong>Команда:</strong> 6 человек</p>
                                <p><strong>Следующий этап:</strong> Тестовый эфир (30.10.2023)</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">29 голосов</div>
                                <button class="vote-btn" onclick="joinProject(2)">Присоединиться</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="section section-gray">
                    <h2>Завершенные проекты</h2>
                    <div class="ideas-grid">
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">Книгообмен в школе</h3>
                                <div class="idea-author">Мария Иванова, 11А • 10.10.2023</div>
                                <div class="idea-status" style="display: inline-block; background-color: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem; margin-top: 5px;">завершен</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Установка полки в холле для свободного обмена книгами между учениками. Проект успешно реализован, полка установлена возле библиотеки.</p>
                                <p><strong>Команда:</strong> 4 человека</p>
                                <p><strong>Завершен:</strong> 20.10.2023</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">32 голоса</div>
                                <a href="#" class="btn btn-outline" style="padding: 8px 15px;">Подробнее</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 100);
}

// Загрузка страницы голосования
function loadVotePage() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (pageTitle) pageTitle.textContent = "Голосование";
    if (pageDescription) pageDescription.textContent = "Проголосуйте за лучшие идеи для реализации в школе";
    
    // Загружаем идеи для голосования
    setTimeout(() => {
        const voteContainer = document.getElementById('voteContainer');
        if (voteContainer) {
            voteContainer.innerHTML = `
                <div class="section">
                    <h2>Идеи для голосования</h2>
                    <p class="text-center" style="margin-bottom: 30px;">Вы можете отдать свой голос за одну или несколько идей. Идеи с наибольшим количеством голосов будут рассмотрены для реализации.</p>
                    
                    <div class="ideas-grid">
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">Фестиваль школьных талантов</h3>
                                <div class="idea-author">Петр Кузнецов, 8Б • 05.10.2023</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Провести ежегодный фестиваль талантов, где каждый ученик может показать свои способности: пение, танцы, рисование, спорт и др.</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">41 голос</div>
                                <button class="vote-btn" onclick="voteForIdea(4)">Голосовать</button>
                            </div>
                        </div>
                        
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">Уроки финансовой грамотности</h3>
                                <div class="idea-author">Дмитрий Волков, 11Б • 28.09.2023</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Ввести факультативные занятия по финансовой грамотности для старшеклассников: бюджет, инвестиции, налоги, кредиты.</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">37 голосов</div>
                                <button class="vote-btn" onclick="voteForIdea(6)">Голосовать</button>
                            </div>
                        </div>
                        
                        <div class="idea-card">
                            <div class="idea-header">
                                <h3 class="idea-title">День самоуправления</h3>
                                <div class="idea-author">Екатерина Новикова, 9В • 20.10.2023</div>
                            </div>
                            <div class="idea-body">
                                <p class="idea-description">Провести день, когда ученики старших классов заменят учителей и администрацию школы, чтобы понять их работу.</p>
                            </div>
                            <div class="idea-footer">
                                <div class="vote-count">22 голоса</div>
                                <button class="vote-btn" onclick="voteForIdea(7)">Голосовать</button>
                            </div>
                        </div>
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
            initVoteChart();
        }
    }, 100);
}

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
                    <input type="email" id="loginEmail" class="form-control" placeholder="ваш@email.com">
                </div>
                <div class="form-group">
                    <label for="loginPassword">Пароль</label>
                    <input type="password" id="loginPassword" class="form-control" placeholder="Пароль">
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 15px;" onclick="loginUser()">Войти</button>
                <button class="btn btn-outline" style="width: 100%;" onclick="showRegisterForm()">Зарегистрироваться</button>
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
}

// Инициализация графика голосования
function initVoteChart() {
    const canvas = document.getElementById('voteChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Данные для графика
    const data = {
        labels: ['Фестиваль талантов', 'Фин. грамотность', 'День самоуправления', 'Школьное радио', 'Школьный сад'],
        datasets: [{
            label: 'Количество голосов',
            data: [41, 37, 22, 29, 24],
            backgroundColor: [
                '#4a6fa5',
                '#ff9800',
                '#9c27b0',
                '#4CAF50',
                '#2196F3'
            ],
            borderWidth: 1
        }]
    };
    
    // Создаем график
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Проверка статуса авторизации
function checkAuthStatus() {
    // В реальном приложении здесь бы проверялся статус в Firebase Auth
    // Для демонстрации используем фиктивные данные
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        if (isLoggedIn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Мой профиль';
            loginBtn.href = 'profile.html';
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Войти';
            loginBtn.href = 'login.html';
        }
    }
    
    // На странице логина показываем информацию о пользователе
    const userInfo = document.getElementById('userInfo');
    const authForm = document.getElementById('authForm');
    
    if (userInfo && authForm) {
        if (isLoggedIn) {
            userInfo.style.display = 'block';
            authForm.style.display = 'none';
            
            // Загружаем данные пользователя
            const userName = localStorage.getItem('userName') || 'Иван Иванов';
            const userEmail = localStorage.getItem('userEmail') || 'ivan@example.com';
            
            document.getElementById('userName').textContent = userName;
            document.getElementById('userEmail').textContent = userEmail;
            document.getElementById('userAvatar').textContent = getUserInitials(userName);
        } else {
            userInfo.style.display = 'none';
            authForm.style.display = 'block';
        }
    }
}

// Получение инициалов пользователя
function getUserInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Функции для работы с идеями и проектами
function voteForIdea(ideaId) {
    alert(`Спасибо за ваш голос за идею #${ideaId}! В реальном приложении голос бы сохранился в базе данных.`);
    // В реальном приложении здесь бы был вызов Firebase для обновления количества голосов
}

function joinProject(projectId) {
    alert(`Вы присоединились к проекту #${projectId}! В реальном приложении ваши данные бы сохранились в базе данных.`);
    // В реальном приложении здесь бы был вызов Firebase для добавления пользователя в проект
}

function submitIdea() {
    const title = document.getElementById('ideaTitle').value;
    const description = document.getElementById('ideaDescription').value;
    const author = document.getElementById('ideaAuthor').value;
    
    if (!title || !description || !author) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    alert(`Идея "${title}" успешно отправлена! В реальном приложении она бы сохранилась в базе данных Firebase.`);
    
    // Очищаем форму
    document.getElementById('ideaTitle').value = '';
    document.getElementById('ideaDescription').value = '';
    document.getElementById('ideaAuthor').value = '';
    
    // В реальном приложении здесь бы был вызов Firebase Firestore для сохранения идеи
    // db.collection('ideas').add({...})
}

// Функции для работы с аутентификацией
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль');
        return;
    }
    
    // В реальном приложении здесь бы была аутентификация через Firebase Auth
    // auth.signInWithEmailAndPassword(email, password).then(...)
    
    // Для демонстрации просто сохраняем данные в localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', email.split('@')[0]); // Просто для демонстрации
    
    alert('Вход выполнен успешно!');
    window.location.href = 'index.html';
}

function showRegisterForm() {
    alert('В реальном приложении здесь бы открылась форма регистрации. Для демонстрации используйте любые данные для входа.');
}

function logoutUser() {
    // В реальном приложении здесь бы был выход через Firebase Auth
    // auth.signOut().then(...)
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    alert('Выход выполнен успешно!');
    window.location.href = 'index.html';
}
