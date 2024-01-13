const camLoc = [-5, 5, -5];

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

	gl.clearColor(0, 0.4, 1, 1);

	let buoy = new Obj("buoy", "obj", "buoy");

	let plane = new Obj("plane", "obj", "solid");

	let t = 0;
	function draw() {
		mat4.identity(buoy.model);
		mat4.translate(buoy.model, buoy.model, [0, Math.sin(t / 100), 0]);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		plane.draw();
		buoy.draw();

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
