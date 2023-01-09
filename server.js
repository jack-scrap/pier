const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const highScore = require("./high_score");

const app = express();

let router = express.Router();

const port = 3000;

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(express.text());

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/public/view/index.html"));
});

app.use("/", router);

app.set("views", path.join(__dirname, "/public/view"));

app.use("/public", express.static("public"));

app.get("/high_score", (req, res) => {
	const raw = fs.readFileSync(path.join(__dirname, "conf.json"));
	const conf = JSON.parse(raw);

	mongoose.connect(`mongodb+srv://${conf.user}:${conf.pass}@cluster0.vxrjwi8.mongodb.net/tachyon`);

	highScore.HighScore.find({}, (err, response) => {
		res.json(response);
	});
});

app.listen(port, (err) => {
	if (err) {
		console.log(err);

		return;
	}

	console.log(`Server is running on port ${port}...`);
});
