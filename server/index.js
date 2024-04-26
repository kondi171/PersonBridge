const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const userRoutes = require("./routes/users.routes");

const PORT = process.env.PORT || 4000;
const app = express();

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
}));

const username = "WebKing";
const password = "gJKkzxRt1toy7TCr";
const cluster = "cluster0.niyeq92";
const dbname = "PersonBridge";

mongoose.connect(`mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`);

app.use(userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});