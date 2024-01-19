const camLoc = [-10, 10, -10];

var world;

const amp = 0.4;

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

	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(1, 1, 1, 1);

	gl.cullFace(gl.BACK);

	world = mat4.create();
	mat4.identity(world);
	mat4.rotate(world, world, 0, [0, 1, 0]);

	let plane = new Obj("plane", "wave", "solid");

	plane.prog.use();

	let uniT = gl.getUniformLocation(plane.prog.id, "t");

	let uniAmp = gl.getUniformLocation(plane.prog.id, "amp");

	gl.uniform1f(uniAmp, amp);

	let uniWorld = gl.getUniformLocation(plane.prog.id, "world");

	plane.prog.unUse();

	let plank = new Obj("plank", "plank", "wood");

	mat4.translate(plank.model, plank.model, [0, 2, 0]);

	plank.prog.use();

	let uniWorldPlank = gl.getUniformLocation(plank.prog.id, "world");

	plank.prog.unUse();

	let plank1 = new Obj("plank", "plank", "wood");

	mat4.translate(plank1.model, plank1.model, [0, 2, 2.2]);

	plank1.prog.use();

	let uniWorldPlank1 = gl.getUniformLocation(plank1.prog.id, "world");

	plank1.prog.unUse();

	let support = new Obj("support", "plank", "wood");

	support.prog.use();

	let uniWorldSupport = gl.getUniformLocation(support.prog.id, "world");

	support.prog.unUse();

	let t = 0;
	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		plane.prog.use();

		gl.uniform1i(uniT, t);
		gl.uniformMatrix4fv(uniWorld, gl.FALSE, world);

		plane.prog.unUse();

		support.prog.use();

		gl.uniformMatrix4fv(uniWorldSupport, gl.FALSE, world);

		support.prog.unUse();

		plank.prog.use();

		gl.uniformMatrix4fv(uniWorldPlank, gl.FALSE, world);

		plank.prog.unUse();

		plank1.prog.use();

		gl.uniformMatrix4fv(uniWorldPlank1, gl.FALSE, world);

		plank1.prog.unUse();

		plane.draw();

		support.draw();

		plank.draw();
		plank1.draw();

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
