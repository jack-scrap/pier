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

	gl.clearColor(0, 0.4, 1, 1);

	let vtcUnIdxed = Ld.attr("buoy", 0);
	let idcVtc = Ld.idc("buoy", 0);

	let vtc = idx(vtcUnIdxed, idcVtc, 3);

	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	let vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

	let prog = new Prog("scr", "solid");

	prog.use();

	let attrPos = gl.getAttribLocation(prog.id, "pos");
	gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.enableVertexAttribArray(attrPos);

	let model = mat4.create();
	mat4.identity(model);

	let vec = [0, 1, 0];

	let view = mat4.create();
	mat4.identity(view);

	mat4.lookAt(view, [
		-5, 5, -5
	], [
		0, 0, 0
	], [
		0, 1, 0
	]);

	let proj = mat4.create();
	mat4.identity(proj);

	mat4.perspective(proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

	let uniModel = gl.getUniformLocation(prog.id, "model");
	let uniView = gl.getUniformLocation(prog.id, "view");
	let uniProj = gl.getUniformLocation(prog.id, "proj");

	gl.uniformMatrix4fv(uniModel, gl.FALSE, model);
	gl.uniformMatrix4fv(uniView, gl.FALSE, view);
	gl.uniformMatrix4fv(uniProj, gl.FALSE, proj);

	prog.unUse();

	let t = 0;
	function draw() {
		mat4.identity(model);
		mat4.translate(model, model, [0, Math.sin(t / 100), 0]);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.bindVertexArray(vao);
		prog.use();

		gl.uniformMatrix4fv(uniModel, gl.FALSE, model);

		gl.drawArrays(gl.TRIANGLES, 0, vtc.length / 3);

		prog.unUse();
		gl.bindVertexArray(null);

		requestAnimationFrame(draw);

		t++;
	}
	requestAnimationFrame(draw);
});
