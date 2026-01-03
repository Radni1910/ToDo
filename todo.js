// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Firebase config (PASTE YOUR OWN)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Global tasks array
let tasks = [];

// 🔹 Fetch tasks from Firestore (READ)
const fetchTasks = async () => {
  tasks = [];
  const snapshot = await getDocs(collection(db, "tasks"));

  snapshot.forEach((docSnap) => {
    tasks.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  updateTasksList();
  updateStats();
};

// 🔹 Add task (CREATE)
const addTask = async () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();

  if (!text) return;

  await addDoc(collection(db, "tasks"), {
    text: text,
    completed: false,
    createdAt: new Date(),
  });

  taskInput.value = "";
  fetchTasks();
};

// 🔹 Toggle task complete (UPDATE)
const toggleTaskComplete = async (index) => {
  const task = tasks[index];

  await updateDoc(doc(db, "tasks", task.id), {
    completed: !task.completed,
  });

  fetchTasks();
};

// 🔹 Delete task (DELETE)
const deleteTask = async (index) => {
  const task = tasks[index];
  await deleteDoc(doc(db, "tasks", task.id));
  fetchTasks();
};

// 🔹 Edit task
const editTask = async (index) => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;

  await deleteDoc(doc(db, "tasks", tasks[index].id));
  fetchTasks();
};

// 🔹 Update stats
const updateStats = () => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  document.getElementById("progress").style.width = `${progress}%`;
  document.getElementById("numbers").innerText =
    `${completedTasks}/${totalTasks}`;
};

// 🔹 Render tasks
const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" ${task.completed ? "checked" : ""} />
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="./img/edit.png" />
          <img src="./img/bin.png" />
        </div>
      </div>
    `;

    li.querySelector("input").addEventListener("change", () =>
      toggleTaskComplete(index)
    );
    li.querySelector(".icons img:first-child").addEventListener("click", () =>
      editTask(index)
    );
    li.querySelector(".icons img:last-child").addEventListener("click", () =>
      deleteTask(index)
    );

    taskList.appendChild(li);
  });
};

// 🔹 Button click
document.getElementById("newTask").addEventListener("click", (e) => {
  e.preventDefault();
  addTask();
});

// 🔹 Load tasks on page load
document.addEventListener("DOMContentLoaded", fetchTasks);
