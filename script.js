const taskText = document.getElementById("taskText");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskRepeat = document.getElementById("taskRepeat");
const taskList = document.getElementById("taskList");
const filters = document.querySelectorAll(".filter");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let activeFilter = "all";

if (Notification.permission !== "granted") Notification.requestPermission();

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
};

function addTask() {
  const text = taskText.value.trim();
  const date = taskDate.value;
  const time = taskTime.value;
  const repeat = taskRepeat.value;

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    date,
    time,
    repeat,
    completed: false,
    notified: false
  });

  saveTasks();
  renderTasks();
  taskText.value = "";
  taskDate.value = "";
  taskTime.value = "";
  taskRepeat.value = "none";
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  tasks.filter(task => {
    if (activeFilter === "completed") return task.completed;
    if (activeFilter === "today") return task.date === today;
    if (activeFilter === "upcoming") return task.date > today;
    return true;
  }).forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    const content = document.createElement("div");
    content.innerHTML = `<span>${task.text}</span><small>${task.date || ""} ${task.time || ""}</small>`;
    content.onclick = () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = e => {
      e.stopPropagation();
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    };

    li.appendChild(content);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

function notify(task) {
  if (Notification.permission === "granted") {
    new Notification("Reminder", {
      body: task.text,
      icon: "https://cdn-icons-png.flaticon.com/512/9068/9068750.png"
    });
  }
}

setInterval(() => {
  const now = new Date();
  const nowDate = now.toISOString().split("T")[0];
  const nowTime = now.toTimeString().slice(0, 5);

  tasks.forEach(task => {
    if (task.date === nowDate && task.time === nowTime && !task.completed && !task.notified) {
      notify(task);
      task.notified = true;
      if (task.repeat === "daily") {
        task.date = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
        task.notified = false;
      } else if (task.repeat === "weekly") {
        task.date = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
        task.notified = false;
      }
    }
  });

  saveTasks();
}, 60000);

renderTasks();
