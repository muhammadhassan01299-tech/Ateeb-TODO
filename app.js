const STORAGE_KEY = 'focuslist-tasks';
const initialTasks = [
  { id: 1, text: 'Plan the day and set priorities', done: true },
  { id: 2, text: 'Work on the most important task', done: false },
  { id: 3, text: 'Take a proper lunch break', done: false },
  { id: 4, text: 'Review progress and plan tomorrow', done: false }
];

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialTasks;
let currentFilter = 'all';

const taskList = document.querySelector('#taskList');
const emptyState = document.querySelector('#emptyState');
const addForm = document.querySelector('#addForm');
const taskInput = document.querySelector('#taskInput');

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function render() {
  const visible = tasks.filter(task => currentFilter === 'all' || (currentFilter === 'completed' ? task.done : !task.done));
  taskList.innerHTML = visible.map(task => `
    <article class="task ${task.done ? 'done' : ''}" data-id="${task.id}">
      <button class="check" aria-label="Mark ${task.done ? 'active' : 'complete'}" type="button"></button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="delete" aria-label="Delete task" type="button">×</button>
    </article>`).join('');
  emptyState.hidden = visible.length !== 0;
  const completed = tasks.filter(task => task.done).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  document.querySelector('#completedCount').textContent = completed;
  document.querySelector('#totalCount').textContent = tasks.length;
  document.querySelector('#progressPercent').textContent = `${percent}%`;
  document.querySelector('#progressBar').style.width = `${percent}%`;
}

function escapeHtml(value) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }

addForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return taskInput.focus();
  tasks.unshift({ id: Date.now(), text, done: false });
  save(); render(); taskInput.value = ''; taskInput.focus();
});

taskList.addEventListener('click', event => {
  const taskElement = event.target.closest('.task');
  if (!taskElement) return;
  const id = Number(taskElement.dataset.id);
  if (event.target.closest('.check')) tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  if (event.target.closest('.delete')) tasks = tasks.filter(task => task.id !== id);
  save(); render();
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
}));

const today = new Date();
document.querySelector('#dayName').textContent = today.toLocaleDateString('en-US', { weekday: 'long' });
document.querySelector('#dateNumber').textContent = today.getDate();
document.querySelector('#monthName').textContent = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
render();
