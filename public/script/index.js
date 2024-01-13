document.addEventListener("DOMContentLoaded", async function() {
	/* Context */
	window.canv = document.getElementById("disp");

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

	gl.clearColor(1, 0, 0, 1);

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);
});
