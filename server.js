const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();

const port = 3000;

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(express.text());

app.set("views", path.join(__dirname, "/public/view"));

app.use("/public", express.static("public"));

app.listen(port, (err) => {
	if (err) {
		console.log(err);

		return;
	}

	console.log(`Server is running on port ${port}...`);
});
