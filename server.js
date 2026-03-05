const express = require("express");
const cors = require("cors");
const router = require("./routes.js");
const app = express();
const PORT = 3000;

app.use(cors()); // до маршрутов
app.use(express.json({ limit: "10kb" })); // до маршрутов
app.use(router);

app.get("/", (req, res) => {
    res.send("ToDo backend is work!");
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});