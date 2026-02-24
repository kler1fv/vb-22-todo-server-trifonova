const express = require("express");
const database = require("./db"); // подключаем SQLite из отдельного файла
const app = express();
const PORT = 3000;

// Middleware JSON и логирование
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.method, req.url, req.body || req.query);
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Массив в памяти (для лекции)
let tasks = [];

// GET /tasks
app.get("/tasks", (req, res) => {
    database.all("SELECT * FROM tasks ORDER BY id DESC", (err, rows) => {
        if (err) return res.json({ error: err.message });
        tasks = rows; // синхронизируем массив
        res.json(tasks);
    });
});

// POST /tasks
app.post("/tasks", (req, res) => {
    tasks.push(req.body); // как в лекции

    const { text, completed } = req.body;

    database.run(
        `INSERT INTO tasks (text, completed) VALUES ('${text}', ${completed ? 1 : 0})`,
        function(err) {
            if (err) return res.json({ error: err.message });
            req.body.id = this.lastID; // сохраняем id из базы
            res.json({ status: "ok", tasks });
        }
    );
});

// PATCH /tasks/:id
app.patch("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: "Задача не найдена" });

    if (req.body.text !== undefined) task.text = req.body.text;
    if (req.body.completed !== undefined) task.completed = req.body.completed;

    database.run(
        `UPDATE tasks SET text='${task.text}', completed=${task.completed ? 1 : 0} WHERE id=${id}`,
        function(err) {
            if (err) return res.json({ error: err.message });
            res.json({ status: "ok", message: "Задача обновлена", task });
        }
    );
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    tasks = tasks.filter(t => t.id !== id);

    database.run(`DELETE FROM tasks WHERE id=${id}`, function(err) {
        if (err) return res.json({ error: err.message });
        res.json({ status: "ok", message: "Задача удалена" });
    });
});

// DELETE /tasks/completed
app.delete("/tasks/completed", (req, res) => {
    tasks = tasks.filter(t => !t.completed);

    database.run(`DELETE FROM tasks WHERE completed=1`, function(err) {
        if (err) return res.json({ error: err.message });
        res.json({ status: "ok", message: "Все выполненные задачи удалены" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
