const express = require("express");
const pg = require("pg");

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "ltdmoon123",
    port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));


app.get("/", async(req, res) => {
    const result = await db.query("SELECT * FROM my_book;");
    res.render("index.ejs", { result: result.rows });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});