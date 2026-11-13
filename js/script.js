document.addEventListener("DOMContentLoaded", function () {
  setupPlanner();
  setupContactForm();
});

function setupPlanner() {
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const storageKey = "cos106-academic-tasks";

  if (!form || !input || !taskList) {
    return;
  }

  let tasks = [];

  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (Array.isArray(savedTasks)) {
      tasks = savedTasks.filter(function (task) {
        return task && typeof task.text === "string";
      });
    }
  } catch {
    tasks = [];
  }

  function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }

  function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "empty-state";
      emptyItem.textContent = "No tasks yet. Add one to get started.";
      taskList.appendChild(emptyItem);
      return;
    }

    tasks.forEach(function (task) {
      const item = document.createElement("li");
      const taskMain = document.createElement("div");
      taskMain.className = "task-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(task.completed);
      checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);

      const text = document.createElement("span");
      text.textContent = task.text;
      text.className = task.completed ? "task-completed" : "";

      checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-btn";
      deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

      deleteButton.addEventListener("click", function () {
        tasks = tasks.filter(function (savedTask) {
          return savedTask.id !== task.id;
        });
        saveTasks();
        renderTasks();
      });

      taskMain.appendChild(checkbox);
      taskMain.appendChild(text);
      item.appendChild(taskMain);
      item.appendChild(deleteButton);
      taskList.appendChild(item);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const taskText = input.value.trim();

    if (!taskText) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    input.removeAttribute("aria-invalid");
    tasks.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: taskText,
      completed: false,
    });

    saveTasks();
    renderTasks();
    form.reset();
    input.focus();
  });

  input.addEventListener("input", function () {
    input.removeAttribute("aria-invalid");
  });

  renderTasks();
}

function setupContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  const status = document.getElementById("form-status");

  function setError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute("aria-invalid", "true");

    if (error) {
      error.textContent = message;
    }
  }

  function clearError(field) {
    const error = document.getElementById(`${field.id}-error`);
    field.removeAttribute("aria-invalid");

    if (error) {
      error.textContent = "";
    }
  }

  const inputFields = contactForm.querySelectorAll("input, textarea");

  for (let index = 0; index < inputFields.length; index += 1) {
    const field = inputFields[index];

    field.addEventListener("input", function () {
      clearError(field);
      if (status) {
        status.textContent = "";
      }
    });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const message = document.getElementById("message");
    const fields = [name, email, phone, message];

    for (let index = 0; index < fields.length; index += 1) {
      clearError(fields[index]);
    }

    if (status) {
      status.textContent = "";
    }

    let firstInvalidField = null;

    for (let index = 0; index < fields.length; index += 1) {
      const field = fields[index];

      if (!field.value.trim()) {
        setError(field, "This field is required.");

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    }

    if (
      !firstInvalidField &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
    ) {
      setError(email, "Enter a valid email address.");
      firstInvalidField = email;
    }

    if (!firstInvalidField && !/^\d+$/.test(phone.value.trim())) {
      setError(phone, "Use digits only for the phone number.");
      firstInvalidField = phone;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();

      if (status) {
        status.textContent = "Please correct the highlighted fields.";
        status.classList.add("is-error");
      }

      return;
    }

    if (status) {
      status.classList.remove("is-error");
      status.textContent = "Your message is valid and ready to send.";
    }

    contactForm.reset();
  });
}
