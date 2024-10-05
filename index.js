import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: process.env.SECRET,
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function insertItems() {
  let items = [];
  const result = await db.query("SELECT * FROM items");
   result.rows.forEach((item) => {
    items.push(item);});
    return items;
   }


app.get("/", async (req, res) => {
  const items = await insertItems();
    res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  
 });

});




app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  
  
  await db.query("INSERT INTO items (title) VALUES ($1)", [
    item,
  ]);
  const items = await insertItems();
  console.log(items)
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const item = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [item, itemId]);

  const items = await insertItems();
  console.log(items)
  res.redirect("/");});

app.post("/delete", async(req, res) => {
  const del = req.body.deleteItemId;
  
  await db.query("DELETE FROM items  WHERE id = $1", [del]);

  const items = await insertItems();
  console.log(items)
  res.redirect("/");});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
