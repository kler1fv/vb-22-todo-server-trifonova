let tasks = [];

let taskInput = document.getElementById('taskInput');
let addTaskButton = document.getElementById('addTask');
let taskList = document.getElementById('taskList');
let deleteCompletedButton = document.getElementById('deleteCompleted');
let toggleAllCheckbox = document.getElementById('toggleAll');

let tabAll = document.getElementById('tabAll');
let tabActive = document.getElementById('tabActive');
let tabCompleted = document.getElementById('tabCompleted');

let countAll = document.getElementById('countAll');
let countActive = document.getElementById('countActive');
let countCompleted = document.getElementById('countCompleted');

let previousPageButton = document.getElementById('previousPage');
let nextPageButton = document.getElementById('nextPage');

let currentFilter = 'all';
let currentPage = 0;
let pageSize = 5;

// Функция для защиты от XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Загрузка задач с сервера
async function loadTasks() {
    const response = await fetch("http://localhost:3000/tasks");
    const data = await response.json();

    tasks = data.map(task => ({
        id: task.id,
        text: task.text,
        completed: Boolean(task.completed)
    }));

    renderTasks();
}

// Добавление задачи
async function addTask() {
    let text = taskInput.value.trim();
    if (text === '') return;

    const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text: text, completed: false})
    });

    const result = await response.json();

    tasks.unshift({
        id: result.id,
        text: text,
        completed: false
    });

    taskInput.value = '';
    currentPage = 0;
    renderTasks();
    taskInput.focus();
}

addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
    if (e.key === 'Escape') taskInput.value = '';
});

//Рендер задач
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    countAll.textContent = tasks.length;
    countActive.textContent = tasks.filter(t => !t.completed).length;
    countCompleted.textContent = tasks.filter(t => t.completed).length;

    let totalPages = Math.ceil(filteredTasks.length / pageSize);
    if (currentPage >= totalPages && totalPages > 0) currentPage = totalPages - 1;

    let start = currentPage * pageSize;
    let end = start + pageSize;

    for (let i = start; i < end && i < filteredTasks.length; i++) {
        let task = filteredTasks[i];

        let li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${escapeHTML(task.text)}</span>
            <button class="delete-button">Удалить</button>
        `;

        let checkbox = li.querySelector('input');
        let span = li.querySelector('span');
        let deleteButton = li.querySelector('button');

        checkbox.addEventListener('change', async () => {
            await fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({completed: checkbox.checked})
            });
            task.completed = checkbox.checked;
            renderTasks();
        });

        //Редактирование текста
        let oldText = task.text;
        span.addEventListener('click', () => {
            span.contentEditable = true;
            span.focus();
        });
        span.addEventListener('focus', () => oldText = task.text);
        span.addEventListener('blur', async () => {
            const newText = span.textContent.trim();
            if (newText !== task.text) {
                await fetch(`http://localhost:3000/tasks/${task.id}`, {
                    method: 'PATCH',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({text: newText})
                });
                task.text = newText;
            }
            span.contentEditable = false;
            renderTasks();
        });
        span.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                span.textContent = oldText;
                span.contentEditable = false;
                span.blur();
            }
        });

        // Удаление
        deleteButton.addEventListener('click', async () => {
            await fetch(`http://localhost:3000/tasks/${task.id}`, {method: 'DELETE'});
            tasks = tasks.filter(t => t.id !== task.id);
            renderTasks();
        });

        taskList.appendChild(li);
    }
}

// Удаление выполненных
deleteCompletedButton.addEventListener('click', async () => {
    const completedTasks = tasks.filter(t => t.completed);
    for (let t of completedTasks) {
        await fetch(`http://localhost:3000/tasks/${t.id}`, {method: 'DELETE'});
    }
    tasks = tasks.filter(t => !t.completed);
    currentPage = 0;
    renderTasks();
});

toggleAllCheckbox.addEventListener('change', async () => {
    for (let t of tasks) {
        await fetch(`http://localhost:3000/tasks/${t.id}`, {
            method: 'PATCH',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({completed: toggleAllCheckbox.checked})
        });
        t.completed = toggleAllCheckbox.checked;
    }
    renderTasks();
});

// Вкладки
function setActiveTab(activeTab) {
    tabAll.classList.remove('active');
    tabActive.classList.remove('active');
    tabCompleted.classList.remove('active');
    activeTab.classList.add('active');
}

tabAll.addEventListener('click', () => { currentFilter='all'; currentPage=0; setActiveTab(tabAll); renderTasks(); });
tabActive.addEventListener('click', () => { currentFilter='active'; currentPage=0; setActiveTab(tabActive); renderTasks(); });
tabCompleted.addEventListener('click', () => { currentFilter='completed'; currentPage=0; setActiveTab(tabCompleted); renderTasks(); });

//Пагинация
previousPageButton.addEventListener('click', () => { if(currentPage>0){ currentPage--; renderTasks(); } });
nextPageButton.addEventListener('click', () => {
    let filtered = tasks.filter(t=>{
        if(currentFilter==='active') return !t.completed;
        if(currentFilter==='completed') return t.completed;
        return true;
    });
    if((currentPage+1)*pageSize < filtered.length) currentPage++;
    renderTasks();
});

loadTasks();
taskInput.focus();
