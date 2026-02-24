const sqlite3 = require("sqlite3").verbose();

const database = new sqlite3.Database("./tasks.db", function(error) {
    if (error) {
        console.log("Ошибка подключения:", error.message);
    } else {
        console.log("База SQLite подключена!");
    }
});

database.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    completed INTEGER
  )
`);

module.exports = database;
