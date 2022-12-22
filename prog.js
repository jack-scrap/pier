class Shad {
	id;

	constructor(name, stage) {
		let ext;
		let type;
		switch (stage) {
			case 0:
				type = gl.VERTEX_SHADER;
				ext = "vs";

				break;

			case 1:
				type = gl.FRAGMENT_SHADER;
				ext = "fs";

				break;
		}

		const buff = Util.rd('res/shad/' + name + "." + ext);

		this.id = window.gl.createShader(type);
		window.gl.shaderSource(this.id, buff);

		window.gl.compileShader(this.id);
		if (!window.gl.getShaderParameter(this.id, window.gl.COMPILE_STATUS)) {
			console.error('Error compiling shader', window.gl.getShaderInfoLog(this.id));
		}
	}
};

class Prog {
	id;

	constructor(nameVtx, nameFrag) {
		this.id = window.gl.createProgram();

		let shadVtx = new Shad(nameVtx, 0);
		let shadFrag = new Shad(nameFrag, 1);

		window.gl.attachShader(this.id, shadVtx.id);
		window.gl.attachShader(this.id, shadFrag.id);

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
