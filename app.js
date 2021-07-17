const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  path = require("path"),
  cons = require("consolidate"),
  dust = require("dustjs-helpers"),
  pg = require("pg"),
  cors = require("cors");
PORT = 4000;
require("dotenv").config();

// connect to POSTGRESQL database
const config = {
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.PASSWORD,
  port: process.env.PORT,
};

pool = new pg.Pool(config);

// middlewares
app.use(cors());
app.engine("dust", cons.dust);
app.set("view engine", "dust");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.get("/", async (req, res) => {
  // PG Connect
  pool.connect(function (err, client, done) {
    if (err) {
      return console.error("error fetching client from pool", err.message);
    }
    client.query("SELECT * FROM recipes", function (err, result) {
      if (err) {
        return console.error("error running query", err.message);
      }
      res.render("index", { recipes: result.rows });
      //console.log(result.rows)
      done();
    });
  });
});

app.post("/add", async (req, res) => {
  // PG Connect
  pool.connect(function (err, client, done) {
    if (err) {
      return console.error("error fetching client from pool", err.message);
    }
    client.query(
      "INSERT INTO recipes(name,ingredients,directions) VALUES($1, $2, $3)",
      [req.body.name, req.body.ingredients, req.body.directions]
    );
    done();
    res.redirect("/");
  });
});

app.post("/edit", (req, res) => {
  // PG Connect
  pool.connect(function (err, client, done) {
    if (err) {
      return console.error("error fetching client from pool", err.message);
    }
    client.query(
      "UPDATE recipes SET name= $1,ingredients= $2, directions= $3 WHERE id= $4",
      [req.body.name, req.body.ingredients, req.body.directions, req.body.id]
    );
    done();
    res.redirect("/");
  });
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  // PG Connect
  pool.connect(function (err, client, done) {
    if (err) {
      return console.error("error fetching client from pool", err.message);
    }
    client.query("DELETE FROM recipes WHERE id = $1", [id]);

    done();
    res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log(`your app is running on port ${PORT}`);
});
