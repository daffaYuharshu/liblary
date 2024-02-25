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
    const result = await db.query("SELECT * FROM my_book ORDER BY id ASC;");
    res.render("index.ejs", { result: result.rows });
})

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.post("/save", async(req, res) => {
    let { title, review , rating } = req.body;
    if (!title || !review || !rating){
        return res.status(400).send("Please fill in all fields.");
    }
    rating = parseFloat(rating)
    try {
        const result = await db.query("SELECT * FROM books WHERE LOWER(title) LIKE '%' ||  $1 || '%';",[title.toLowerCase()])
        if(result.rows.length == 0) {
            return res.status(404).send("Book not found, try again.");
        }
        const data = result.rows[0];
        title = data.title;
        let isbn = data.isbn;
        let author = data.author;
        let publisher = data.publisher;
        
        const checkDuplicate = await db.query("SELECT * FROM my_book WHERE title = $1;", [title]);
        if(checkDuplicate.rows.length > 0) {
            return res.send("Book already added.");
        }
        try {
            await db.query("INSERT INTO my_book (isbn, title, author, publisher, review, rating) VALUES ($1, $2, $3, $4, $5, $6)", [isbn, title, author, publisher, review, rating]);
            res.redirect("/");
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
});

app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const result = await db.query("SELECT * FROM my_book where id = $1", [id]);
    if(result.rows.length > 0){
        const book = result.rows[0];
        return res.status(200).render("edit.ejs", { data: book });
    }
    return res.status(404).send("Book not found!");
});

app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    let { review, rating } = req.body;
    rating = parseFloat(rating);
    if (!review || !rating){
        return res.status(400).send("Please fill in all fields.");
    };
    try {
        await db.query("UPDATE my_book set review = $1, rating = $2 WHERE id = $3", [review, rating, id]);
        return res.status(200).redirect("/");
    } catch (error) {
        console.log(error);
    }
});

app.get("/delete/:id", async(req, res) => {
    const id = req.params.id;
    try {
        await db.query("DELETE FROM my_book WHERE id = $1", [id]);
        return res.status(200).redirect("/");
    } catch (error) {
        console.log(error);
    }
});

app.post("/sort", async(req, res) => {
    const { sort } = req.body;
    let result;
    switch(sort){
        case "recency":
            result = await db.query("SELECT * FROM my_book ORDER BY id DESC;");
            res.render("index.ejs", { result: result.rows });
            break;
        case "rating":
            result = await db.query("SELECT * FROM my_book ORDER BY rating DESC;");
            res.render("index.ejs", { result: result.rows });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});