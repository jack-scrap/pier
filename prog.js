class Prog {
	id;

	constructor(nameVtx, nameFrag) {
		this.id = window.gl.createProgram();

		// Vertex
		const shadVtxBuff = Util.rd('res/shad/' + nameVtx + '.vs');

		let shadVtx = window.gl.createShader(window.gl.VERTEX_SHADER);
		window.gl.shaderSource(shadVtx, shadVtxBuff);

		window.gl.compileShader(shadVtx);
		if (!window.gl.getShaderParameter(shadVtx, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader', window.gl.getShaderInfoLog(shadVtx));
		}

		// Fragment
		const shadFragBuff = Util.rd('res/shad/' + nameFrag + '.fs');

		let shadFrag = window.gl.createShader(window.gl.FRAGMENT_SHADER);
		window.gl.shaderSource(shadFrag, shadFragBuff);

		window.gl.compileShader(shadFrag);
		if (!window.gl.getShaderParameter(shadFrag, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling fragment shader', window.gl.getShaderInfoLog(shadFrag));
		}

		window.gl.attachShader(this.id, shadVtx);
		window.gl.attachShader(this.id, shadFrag);

		window.gl.linkProgram(this.id);
		if (!window.gl.getProgramParameter(this.id, window.gl.LINK_STATUS)) {
			console.error('Error linking program', window.gl.getProgramInfoLog(this.id));
		}

		window.gl.validateProgram(this.id);
		if (!window.gl.getProgramParameter(this.id, window.gl.VALIDATE_STATUS)) {
			console.error('Error validating program', window.gl.getProgramInfoLog(this.id));
		}
	}
};
