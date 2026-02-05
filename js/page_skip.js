
let currentPage = 1; // Начальная страница
const totalPages = 2; // Общее количество страниц
let labNumber = 0;

// Функция для получения параметров из URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Использование функции для получения ID
labNumber = getQueryParam('id');
console.log(labNumber);

// Функция для загрузки данных из JSON-файла
function loadData() {
    return fetch(`lb/laba_${labNumber}/data.json`)
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            return response.json();
        })
        .then(data => {
            totalPages = data.totalPages;
            console.log(totalPages);
            // document.getElementById('current-page').textContent = `Лабораторная ${labNumber}, всего страниц: ${totalPages}`;
            loadPage(1);
        })
        .catch(error => {
            console.error(error);
        });
}

// Функция для загрузки содержимого страницы
function loadPage(page) {
    const contentDiv = document.getElementById('content');
    fetch(`lb/laba_${labNumber}/lb${labNumber}_page${page}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки страницы');
            return response.text();
        })
        .then(data => {
            contentDiv.innerHTML = data;
            document.getElementById('current-page').textContent = `из ${totalPages}`;
        })
        .catch(error => {
            contentDiv.innerHTML = `<p>${error.message}</p>`;
        });
}

// Функция для навигации
function navigate(direction) {
    currentPage += direction;
    if (currentPage < 1) {
        currentPage = 1; // Не позволяйте пользователю идти ниже первой страницы
    } else if (currentPage > totalPages) {
        currentPage = totalPages; // Не позволяйте пользователю идти выше последней страницы
    }
    loadPage(currentPage);
}

// Проверка нажатия Enter
function checkEnter(event) {
    if (event.key === 'Enter') {
        const pageInput = document.getElementById('page-input');
        const pageNumber = parseInt(pageInput.value);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            loadPage(currentPage);
        }
    }
}

// Загрузка первой страницы при загрузке
window.onload = function() {
    loadPage(currentPage);
};