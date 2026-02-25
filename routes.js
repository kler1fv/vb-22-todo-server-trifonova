const express = require("express");
const router = express.Router();
const db = require("./db");

// GET 
router.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST
router.post("/tasks", (req, res) => {
  const { text, completed } = req.body;

  db.run(
    "INSERT INTO tasks (text, completed) VALUES (?, ?)",
    [text, completed ? 1 : 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        status: "ok",
        message: "Задача добавлена",
        id: this.lastID
      });
    }
  );
});

// PATCH
router.patch("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!task) {
      return res.status(404).json({ error: "Задача не найдена" });
    }

    const newText =
      req.body.text !== undefined ? req.body.text : task.text;

    const newCompleted =
      req.body.completed !== undefined
        ? req.body.completed
        : task.completed;

    db.run(
      "UPDATE tasks SET text = ?, completed = ? WHERE id = ?",
      [newText, newCompleted ? 1 : 0, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          status: "ok",
          message: "Задача обновлена"
        });
      }
    );
  });
});

// DELETE
router.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      status: "ok",
      message: "Задача удалена"
    });
  });
});

module.exports = router;
