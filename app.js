// Simple To-Do List app using localStorage
// Features: add, edit, delete, toggle complete, filter, clear completed

const STORAGE_KEY = 'todos.v1';

// DOM elements
const newTaskInput = document.getElementById('new-task');
const addBtn = document.getElementById('add-btn');
const tasksList = document.getElementById('tasks');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');

let todos = [];
let currentFilter = 'all';

// Load from localStorage
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse todos from storage', e);
    todos = [];
  }
}

// Save to localStorage
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Create a single todo item object
function createTodo(text) {
  return {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
}

// Render tasks according to current filter
function render() {
  // Clear list
  tasksList.innerHTML = '';

  const visible = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No tasks — add your first one!';
    empty.style.color = '#6b7280';
    tasksList.appendChild(empty);
    return;
  }

  visible.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'task';
    li.dataset.id = todo.id;

    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'toggle' + (todo.completed ? ' completed' : '');
    toggle.title = todo.completed ? 'Mark as active' : 'Mark as completed';
    toggle.setAttribute('aria-pressed', todo.completed);
    toggle.addEventListener('click', () => toggleTodo(todo.id));
    toggle.innerHTML = todo.completed ? '✓' : '';

    // Content (text)
    const content = document.createElement('div');
    content.className = 'content' + (todo.completed ? ' completed' : '');
    content.textContent = todo.text;
    content.tabIndex = 0;
    content.setAttribute('role', 'textbox');
    content.setAttribute('aria-label', 'Task: ' + todo.text);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn edit';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = 'Edit';
    editBtn.addEventListener('click', () => startEdit(todo.id, content));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(toggle);
    li.appendChild(content);
    li.appendChild(actions);

    tasksList.appendChild(li);
  });
}

// Add new task
function addTask() {
  const text = newTaskInput.value;
  if (!text.trim()) return;
  const todo = createTodo(text);
  todos.unshift(todo); // newest first
  newTaskInput.value = '';
  saveTodos();
  render();
  newTaskInput.focus();
}

// Toggle completed state
function toggleTodo(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTodos();
  render();
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

// Start editing a todo: replace content with input
function startEdit(id, contentEl) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;
  input.style.width = '100%';
  input.style.padding = '6px 8px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #e6e9ef';
  contentEl.replaceWith(input);
  input.focus();
  // Move caret to end
  input.setSelectionRange(input.value.length, input.value.length);

  function finishSave() {
    const v = input.value.trim();
    if (v) {
      todo.text = v;
      saveTodos();
    }
    render();
  }

  function cancelEdit() {
    render();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishSave();
    if (e.key === 'Escape') cancelEdit();
  });

  // Save on blur
  input.addEventListener('blur', finishSave);
}

// Change filter
function setFilter(filter) {
  currentFilter = filter;
  filters.forEach(f => {
    const isActive = f.dataset.filter === filter;
    f.classList.toggle('active', isActive);
    f.setAttribute('aria-selected', isActive);
  });
  render();
}

// Clear completed tasks
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
}

// Event listeners
addBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

filters.forEach(f => {
  f.addEventListener('click', () => setFilter(f.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize
loadTodos();
render();