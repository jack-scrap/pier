const mongoose = require("mongoose");

const {
	Schema,
	model
} = mongoose;

const highScoreSchema = new Schema({
	player: String,
	score: Number
});

const HighScore = model("HighScore", highScoreSchema);

module.exports.HighScore = HighScore;
