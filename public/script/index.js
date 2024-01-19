const camLoc = [-10, 10, -10];

var drag;

var mouseStartX;
var mouseCurrX;
var mouseDeltaX;

var theta = 0.0;

const dragFac = 500;

var world;

const amp = 0.4;

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

	theta += mouseDeltaX / dragFac;
});

document.addEventListener("mousemove", function(e) {
	if (drag) {
		mouseCurrX = e.clientX;

		mouseDeltaX = mouseCurrX - mouseStartX;

		mat4.identity(world);
		mat4.rotate(world, world, theta + (mouseDeltaX / dragFac), [0, 1, 0]);
	}
});

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

	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(1, 1, 1, 1);

	gl.cullFace(gl.BACK);

	world = mat4.create();
	mat4.identity(world);
	mat4.rotate(world, world, 0, [0, 1, 0]);

	let plank = new Obj("plank", "plank", "wood");

	plank.prog.use();

	let uniWorldPlank = gl.getUniformLocation(plank.prog.id, "world");

	plank.prog.unUse();

	let t = 0;
	function draw() {
		mat4.identity(plank.model);
		mat4.translate(plank.model, plank.model, [0, Math.sin(t / 100) * amp, 0]);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		plank.prog.use();

		gl.uniformMatrix4fv(uniWorldPlank, gl.FALSE, world);

		plank.prog.unUse();

		plank.draw();

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
