const col = [214, 215, 148];

const scrLoc = [-0.5846, 2.7, 0];

const lineHt = 0.2;

var o = 0;
var m = 0;

var cabinet;
var scr;

var drag;

var mouseStartX;
var mouseCurrX;
var mouseDeltaX;

var theta = 0.3;

var id = new Float32Array(16);
var idWorld = new Float32Array(16);

const camLoc = [15, 8, 0];
var camScale = 1;

var ship;

var scn = [];

var score;
var scoreStr;

var scoreBoard = {
	'asdf': 3,
	'hjkl': 7,
	'qwer': 12
};

var cursor;

var osc;

function fitCanv() {
	window.canv.width = window.innerWidth;
	window.canv.height = window.innerHeight;
}

document.addEventListener("mousedown", function(e) {
	drag = true;

	mouseStartX = e.clientX;
});

document.addEventListener("mouseup", function() {
	drag = false;

	theta += mouseDeltaX;
});

document.addEventListener("mousemove", function(e) {
	if (drag) {
		mouseCurrX = e.clientX;

		mouseDeltaX = mouseCurrX - mouseStartX;

		mat4.identity(id);
		mat4.rotate(cabinet.model, id, (theta + mouseDeltaX) / 500, [0, 1, 0]);

		cabinet.accModel(idWorld);
	}
});

document.addEventListener("mousewheel", function(e) {
	camScale += e.deltaY / 300;

	camScale = Math.min(camScale, 2.0);
	camScale = Math.max(camScale, 0.2);
});

document.addEventListener("keydown", function(e) {
	if (audioCtx.state === "suspended") {
		audioCtx.resume();
	}

	switch (m) {
		case 0: // Menu
			switch (e.keyCode) {
				case 40: { // Down
					o++;

					o = Math.min(o, 1);

					let model = new Float32Array(16);
					mat4.identity(model);
					mat4.translate(model, model, [-0.6, (o + 1) * -lineHt, 0]);

					cursor.prog.use();

					gl.uniformMatrix4fv(cursor.uniModel, gl.FALSE, model);

					cursor.prog.unUse();

					break;
				}

				case 38: { // Up
					o--;

					o = Math.max(o, 0);

					let model = new Float32Array(16);
					mat4.identity(model);
					mat4.translate(model, model, [-0.6, (o + 1) * -lineHt, 0]);

					cursor.prog.use();

					gl.uniformMatrix4fv(cursor.uniModel, gl.FALSE, model);

					cursor.prog.unUse();

					break;
				}

				case 13: // Enter
					score = 0;
					scoreStr = new Str(score.toString(), [-0.8, 0.8]);

					m = o + 1;

					break;
			}

			break;

		case 1: // Game
			switch (e.keyCode) {
				case 37: // Left
					e.preventDefault();

					mat4.rotate(ship.model, ship.model, 0.1, [0, 0, 1]);

					ship.prog.use();

					gl.uniformMatrix4fv(ship.uniModel, gl.FALSE, ship.model);

					ship.prog.unUse();

					break;

				case 39: // Right
					e.preventDefault();

					mat4.rotate(ship.model, ship.model, -0.1, [0, 0, 1]);

					ship.prog.use();

					gl.uniformMatrix4fv(ship.uniModel, gl.FALSE, ship.model);

					ship.prog.unUse();

					break;

				case 38: // Up
					e.preventDefault();

					ship.speed = Ship.speedFast;

					break;

				case 13: // Enter
					let laser = new Laser();

					laser.model = mat4.clone(ship.model);

					laser.prog.use();

					gl.uniformMatrix4fv(laser.uniModel, gl.FALSE, laser.model);

					laser.prog.unUse();

					scn.push(laser);

					score++;
					scoreStr = new Str(score.toString(), [-0.8, 0.8]);

					break;
			}

			break;
	};
});

document.addEventListener("keyup", function(e) {
	switch (m) {
		case 1: // Game
			switch (e.keyCode) {
				case 38: // Up
					e.preventDefault();

					ship.speed = Ship.speedDefault;

					break;
			}

			break;
	}
});

window.addEventListener("resize", fitCanv);

document.addEventListener("DOMContentLoaded", function() {
	/* Context */
	window.canv = document.getElementById("disp");

	fitCanv();

	window.gl = window.canv.getContext("webgl2");

	if (!gl) {
		console.log("WebGL not supported, falling back on experimental-webgl");
		gl = window.canv.getContext("experimental-webgl");
	}

	if (!gl) {
		alert("Your browser does not support WebGL");
	}

	gl.cullFace(gl.BACK);

	window.audioCtx = new window.AudioContext() || window.webkitAudioContext();

	mat4.identity(idWorld);

	/* Screen */
	scr = new Obj("scr", "scr", "tex");

	scr.prog.use();

	// Texture
	let tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, window.canv.width, window.canv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	let fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	let cbo = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, cbo, gl.TEXTURE_2D, tex, 0);

	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.activeTexture(gl.TEXTURE0);

	scr.prog.unUse();

	cabinet = new Obj("cabinet", "obj", "dir", [0, 0, 0], [0, theta, 0], [
		scr
	]);

	// Menu
	const title = new Str("tachyon", [0.0, lineHt]);

	const opt = [
		new Str("play", [0.0, -lineHt]),
		new Str("scoreboard", [0.0, 2 * -lineHt])
	];

	const cursorVtc = [
		0.0, 0.0,
		-1.0, 1.0,
		-1.0, -1.0
	];

	cursor = new Entity(cursorVtc, [-0.6, (o + 1) * -lineHt]);

	// Scoreboard
	let scoreBuff = [];
	const key = Object.keys(scoreBoard);
	for (let i = 0; i < 3; i++) {
		if (i < key.length) {
			let k = key[i];

			scoreBuff.push(new Str(k, [0.0, i * -lineHt]));
		}
	}

	/* Ship */
	ship = new Ship();

	scn.push(ship);

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

			case 1: // Game
				scoreStr.draw();

				for (let vec of scn) {
					vec.draw();
				}

				break;

			case 2: // Scoreboard
				for (let line of scoreBuff) {
					line.draw();
				}

				break;
		};

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// Cabinet
		gl.enable(gl.DEPTH_TEST);

		gl.enable(gl.CULL_FACE);

		gl.clearColor(1 - ((1 - (col[0] / 255)) / 2), 1 - ((1 - (col[1] / 255)) / 2), 1 - ((1 - (col[2] / 255)) / 2), 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		cabinet.draw();

		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
});
