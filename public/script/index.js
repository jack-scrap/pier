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

	gl.clearColor(1, 0, 0, 1);

	const pt = [
		0.0, 0.0,
		0.5, 1.0,
		1.0, 0.0
	];

	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	let vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pt), gl.STATIC_DRAW);

	let prog = new Prog("vec", "green");

	prog.use();

	let attrPos = gl.getAttribLocation(prog.id, "pos");
	gl.vertexAttribPointer(attrPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	prog.unUse();

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindVertexArray(vao);
		prog.use();

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		prog.unUse();
		gl.bindVertexArray(null);

		requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);
});
