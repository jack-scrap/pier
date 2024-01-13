const col = [214, 215, 148];

const scrLoc = [-0.5846, 2.7, 0];

const lineHt = 0.2;

const cursorPt = [
	0.0, 0.0,
	-1.0, 1.0,
	-1.0, -1.0
];

const tachyonPt = [
	0.0, 0.0,
	0.0, 1.0
];

const scrBoundPt = [
	-1.0, -1.0,
	1.0, -1.0,
	1.0, 1.0,
	-1.0, 1.0
];

var o = 0;
var m = 0;

var s = 0;

var cabinet;
var scr;

var drag;

var mouseStartX;
var mouseCurrX;
var mouseDeltaX;

var theta = 0.3;

const dragFac = 500;

const camMin = [scrLoc[0] + 1.2, scrLoc[1], scrLoc[2]];
const camMax = [15, 8, 0];

const camDelta = [camMax[0] - camMin[0], camMax[1] - camMin[1], camMax[2] - camMin[2]];

var camScale = 1;

var camLoc = [camMin[0] + (camDelta[0] * camScale), camMin[1] + (camDelta[1] * camScale), camMin[2] + (camDelta[2] * camScale)];

var ship;

var scrBound;

var score;
var scoreStr;

var life;
var lifeStr;

var tachyonVec;

var scoreBoard = {};
var scoreBuff = [];

var gameOver;

var cursor;

var aste = [];
var ufo = [];

var laser = [];
var tachyon = [];

var vol;

function fitCanv() {
	window.canv.width = window.innerWidth;
	window.canv.height = window.innerHeight;
}

document.addEventListener("DOMContentLoaded", async function() {
	/* Context */
	window.canv = document.getElementById("disp");

	fitCanv();

	window.gl = window.canv.getContext("webgl2");

	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = canv.getContext("experimental-webgl");
	}

	if (!gl) {
		alert("Your browser does not support WebGL");
	}

	gl.cullFace(gl.BACK);

	gl.lineWidth(3);

	const audioOpt = {
		sampleRate: 6000
	};

	window.audioCtx = new window.AudioContext(audioOpt) || window.webkitAudioContext(audioOpt);

	vol = audioCtx.createGain();
	vol.gain = 0.2;

	/* Screen */
	scr = new Obj("scr", "scr", "tex");

	scr.prog.use();

	// Texture
	scr.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, scr.tex);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, window.canv.width, window.canv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	let fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	let cbo = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, cbo, gl.TEXTURE_2D, scr.tex, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, scr.tex);

	scr.prog.unUse();

	cabinet = new Obj("cabinet", "obj", "tex_dir", [0, 0, 0], [0, theta, 0], [
		scr
	]);

	cabinet.prog.use();

	cabinet.tex = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, cabinet.tex);

	let img = await Ld.img("cabinet.bmp");

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	cabinet.prog.unUse();

	// Menu
	const title = new Str("tachyon", [0.0, lineHt]);

	const opt = [
		new Str("play", [0.0, -lineHt]),
		new Str("scoreboard", [0.0, 2 * -lineHt])
	];

	cursor = new Vec(cursorPt, [-0.6, (o + 1) * -lineHt]);

	// Scoreboard
	scoreBuff = [];
	const key = Object.keys(scoreBoard);
	for (let i = 0; i < 3; i++) {
		if (i < key.length) {
			let k = key[i];

			scoreBuff.push(new Str(k, [0.0, i * -lineHt]));
		}
	}

	/* Ship */
	ship = new Ship;

	/* Asteroids */
	for (let i = 0; i < 3; i++) {
		aste.push(new AsteLg);
	}

	gameOver = new Str("game over");

	/* Screen bounds */
	scrBound = new Vec(scrBoundPt);

	function draw() {
		// Framebuffer
		gl.disable(gl.DEPTH_TEST);

		gl.disable(gl.CULL_FACE);

		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		gl.clearColor(0, 0.06, 0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		switch (m) {
			case 0: // Menu
				title.draw();

				for (let line of opt) {
					line.draw();
				}

				cursor.draw();

				break;

			case 1: { // Game
				scoreStr.draw();
				lifeStr.draw();

				if (ship.tachyon) {
					tachyonVec.draw();
				}

				if (!randInt(0, 500)) {
					ufo.push(new UFO);
				}

				for (let vec of aste) {
					vec.draw();
				}

				for (let vec of ufo) {
					vec.draw();
				}

				for (let vec of laser) {
					vec.draw();
				}

				for (let vec of tachyon) {
					vec.draw();
				}

				ship.draw();

				break;
			}

			case 2: // Scoreboard
				for (let line of scoreBuff) {
					line.draw();
				}

				break;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// Cabinet
		gl.enable(gl.DEPTH_TEST);

		gl.enable(gl.CULL_FACE);

		gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);
});
