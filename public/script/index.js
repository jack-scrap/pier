const camLoc = [-1000, 1000, -1000];

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

	gl.enable(gl.CULL_FACE);

	gl.cullFace(gl.BACK);

	gl.clearColor(1, 1, 1, 1);

	let obj = [];

	let plane = new Obj("plane", "wave", "solid");

	plane.prog.use();

	let uniT = gl.getUniformLocation(plane.prog.id, "t");

	let uniAmp = gl.getUniformLocation(plane.prog.id, "amp");

	gl.uniform1f(uniAmp, amp);

	plane.prog.unUse();

	obj.push(plane);

	const stride = 2.2;

	for (let j = 0; j < 10; j++) {
		let x = -(6 + j * stride);

		let plank = new Obj("plank", "wood", "wood", [x, 2, 0]);

		plank.prog.use();

		let uniOffset = gl.getUniformLocation(plank.prog.id, "offset");

		let loc = vec2.fromValues(rand(-4, 4), rand(-1, 1));

		gl.uniform2fv(uniOffset, loc);

		plank.prog.unUse();

		mat4.rotate(plank.model, plank.model, Math.PI / 2, [0, 1, 0]);

		obj.push(plank);

		for (let i = 0; i < 2; i++) {
			obj.push(new Obj("support", "wood", "wood", [x, 0, (i ? 1 : -1) * 4]));
		}
	}

	let t = 0;
	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		plane.prog.use();

		gl.uniform1i(uniT, t);

		plane.prog.unUse();

		for (let inst of obj) {
			inst.draw();
		}

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
