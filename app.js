const STORAGE_KEY = 'pro_tasks_v1';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const list = document.getElementById('list');
const form = document.getElementById('taskForm');
const title = document.getElementById('title');
const dialog = document.getElementById('taskDialog');
const btn = document.getElementById('newTaskBtn');

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function render(){
  list.innerHTML = '';
  tasks.forEach((t,i)=>{
    const li = document.createElement('li');
    li.textContent = t.title;
    li.onclick = ()=>{ tasks.splice(i,1); save(); render(); };
    list.append(li);
  });
}
btn.onclick = ()=> dialog.showModal();
form.onsubmit = e => {
  e.preventDefault();
  tasks.push({ title: title.value });
  title.value='';
  save();
  render();
  dialog.close();
};
render();