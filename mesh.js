class Mesh {
	vao = null;
	vbo = null;
	ibo = null;

	uniModel = null;
	uniView = null;
	uniProj = null;

	noIdc = null;

	prog = null;

	constructor(vtc, idc, nameVtx, nameFrag) {
		this.noIdc = idc.length;

		this.vao = window.gl.createVertexArray();
		window.gl.bindVertexArray(this.vao);

		this.vbo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vbo);
		window.gl.bufferData(window.gl.ARRAY_BUFFER, new Float32Array(vtc), window.gl.STATIC_DRAW);

		this.ibo = window.gl.createBuffer();
		window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		window.gl.bufferData(window.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(idc), window.gl.STATIC_DRAW);

		/* Matrix */
		model = new Float32Array(16);
		view = new Float32Array(16);
		proj = new Float32Array(16);

		mat4.identity(model);

		mat4.lookAt(
			view,
			[
				15, 8, 0
			], [
				-0.5846, 2.7, 0
			], [
				0, 1, 0
			]
		);
		mat4.perspective(proj, (1 / 4) * Math.PI, canv.clientWidth / canv.clientHeight, 0.1, 1000.0);

		mat4.identity(id);

		mat4.rotate(rot, id, theta, [0, 1, 0]);
		mat4.mul(model, rot, id);

		/* Shader */
		this.prog = window.gl.createProgram();

		const
			shadVtxBuff = Util.rd('res/shad/' + nameVtx + '.vs'),
			shadFragBuff = Util.rd('res/shad/' + nameFrag + '.fs');

		// Vertex
		let shadVtx = window.gl.createShader(window.gl.VERTEX_SHADER);
		window.gl.shaderSource(shadVtx, shadVtxBuff);

		window.gl.compileShader(shadVtx);
		if (!window.gl.getShaderParameter(shadVtx, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader', window.gl.getShaderInfoLog(shadVtx));
		}

		// Fragment
		let shadFrag = window.gl.createShader(window.gl.FRAGMENT_SHADER);
		window.gl.shaderSource(shadFrag, shadFragBuff);

		window.gl.compileShader(shadFrag);
		if (!window.gl.getShaderParameter(shadFrag, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling fragment shader', window.gl.getShaderInfoLog(shadFrag));
		}

		window.gl.attachShader(this.prog, shadVtx);
		window.gl.attachShader(this.prog, shadFrag);

		window.gl.linkProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.LINK_STATUS)) {
			console.error('Error linking program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.validateProgram(this.prog);
		if (!window.gl.getProgramParameter(this.prog, window.gl.VALIDATE_STATUS)) {
			console.error('Error validating program', window.gl.getProgramInfoLog(this.prog));
		}

		window.gl.useProgram(this.prog);

		// Attributes
		let attrPos = window.gl.getAttribLocation(this.prog, 'pos');
		window.gl.vertexAttribPointer(attrPos, 3, window.gl.FLOAT, window.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
		window.gl.enableVertexAttribArray(attrPos);

		// Uniforms
		this.uniModel = window.gl.getUniformLocation(this.prog, 'model');
		this.uniView = window.gl.getUniformLocation(this.prog, 'view');
		this.uniProj = window.gl.getUniformLocation(this.prog, 'proj');

		window.gl.uniformMatrix4fv(this.uniModel, window.gl.FALSE, model);
		window.gl.uniformMatrix4fv(this.uniView, window.gl.FALSE, view);
		window.gl.uniformMatrix4fv(this.uniProj, window.gl.FALSE, proj);

		window.gl.useProgram(null);
	}

	draw() {
		window.gl.bindVertexArray(this.vao);
		window.gl.useProgram(this.prog);

		window.gl.drawElements(window.gl.TRIANGLES, this.noIdc, window.gl.UNSIGNED_BYTE, 0);

		window.gl.useProgram(null);
		window.gl.bindVertexArray(null);
	}
};

const
	type = {
		VTX: 0,
		TEX: 1,
		NORM: 2
	},

	triVtc = 3;
