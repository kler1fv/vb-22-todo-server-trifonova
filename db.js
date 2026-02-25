const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.log("Ошибка подключения:", err.message);
  } else {
    console.log("База SQLite подключена!");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    completed INTEGER
  )
`);

module.exports = db;
