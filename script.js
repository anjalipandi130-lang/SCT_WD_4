// State variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editId = null;

// DOM Elements
const taskInput = document.getElementById('task-input');
const taskDatetime = document.getElementById('task-datetime');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editTaskInput = document.getElementById('edit-task-input');
const editTaskDatetime = document.getElementById('edit-task-datetime');
const saveEditBtn = document.getElementById('save-edit-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// Initial Render
renderTasks();

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
closeModalBtn.addEventListener('click', () => editModal.style.display = 'none');
saveEditBtn.addEventListener('click', saveEdit);

// Filter Selection Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

// Function to Create/Add a Task
function addTask() {
    const text = taskInput.value.trim();
    const datetime = taskDatetime.value;

    if (!text) {
        alert("Please enter a valid task name!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        datetime: datetime ? formatDateTime(datetime) : "No due date",
        rawDatetime: datetime || "",
        completed: false
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();
    
    // Clear inputs
    taskInput.value = '';
    taskDatetime.value = '';
}

// Function to Render Tasks based on selected filter
function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 'all'
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p style="text-align:center; color: #94a3b8; margin-top: 20px;">No tasks found.</p>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-details">
                <span class="task-text">${task.text}</span>
                <span class="task-time"><i class="fa-regular fa-clock"></i> ${task.datetime}</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleComplete(${task.id})" title="Toggle Complete">
                    <i class="fa-solid ${task.completed ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
                </button>
                <button class="edit-btn" onclick="openEditModal(${task.id})" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Mark Task completed status
function toggleComplete(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveToLocalStorage();
    renderTasks();
}

// Open Edit Modal with Pre-filled Task data
function openEditModal(id) {
    editId = id;
    const task = tasks.find(t => t.id === id);
    if(task) {
        editTaskInput.value = task.text;
        editTaskDatetime.value = task.rawDatetime;
        editModal.style.display = 'flex';
    }
}

// Save Edit action
function saveEdit() {
    const text = editTaskInput.value.trim();
    const datetime = editTaskDatetime.value;

    if (!text) {
        alert("Task contents cannot be blank.");
        return;
    }

    tasks = tasks.map(task => {
        if (task.id === editId) {
            return {
                ...task,
                text: text,
                datetime: datetime ? formatDateTime(datetime) : "No due date",
                rawDatetime: datetime
            };
        }
        return task;
    });

    saveToLocalStorage();
    renderTasks();
    editModal.style.display = 'none';
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveToLocalStorage();
    renderTasks();
}

// LocalStorage Helper functions
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Clean date layout formatting helper
function formatDateTime(dateTimeStr) {
    const dateObj = new Date(dateTimeStr);
    return dateObj.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}