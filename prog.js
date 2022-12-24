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

		const buff = Util.rd("res/shad/" + name + "." + ext);

		this.id = gl.createShader(type);
		gl.shaderSource(this.id, buff);

		gl.compileShader(this.id);
		if (!gl.getShaderParameter(this.id, gl.COMPILE_STATUS)) {
			console.error("Error compiling shader", gl.getShaderInfoLog(this.id));
		}
	}
}

class Prog {
	id;

	constructor(nameVtx, nameFrag) {
		this.id = gl.createProgram();

		let shadVtx = new Shad(nameVtx, 0);
		let shadFrag = new Shad(nameFrag, 1);

		gl.attachShader(this.id, shadVtx.id);
		gl.attachShader(this.id, shadFrag.id);

		gl.linkProgram(this.id);
		if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
			console.error("Error linking program", gl.getProgramInfoLog(this.id));
		}

		gl.validateProgram(this.id);
		if (!gl.getProgramParameter(this.id, gl.VALIDATE_STATUS)) {
			console.error("Error validating program", gl.getProgramInfoLog(this.id));
		}
	}

	use() {
		gl.useProgram(this.id);
	}

	unUse() {
		gl.useProgram(null);
	}
}
