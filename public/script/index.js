const camLoc = [-10, 10, -10];

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

	let plane = new Obj("plane", "wave", "solid");

	plane.prog.use();

	let uniT = gl.getUniformLocation(plane.prog.id, "t");

	let uniAmp = gl.getUniformLocation(plane.prog.id, "amp");

	gl.uniform1f(uniAmp, amp);

	plane.prog.unUse();

	let plank = [];
	for (let i = 0; i < 3; i++) {
		plank.push(new Obj("plank", "plank", "wood", [0, 2, i * 2.2]));
	}

	let support = new Obj("support", "plank", "wood", [4, 0, 0]);

	let t = 0;
	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		plane.prog.use();

		gl.uniform1i(uniT, t);

		plane.prog.unUse();

		plane.draw();

		support.draw();

		for (let i = 0; i < plank.length; i++) {
			plank[i].draw();
		}

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
