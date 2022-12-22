class Shad {
	id;

	constructor(name, stage) {
		let ext;
		let type;
		switch (stage) {
			case 0:
				type = ctx.VERTEX_SHADER;
				ext = "vs";

				break;

			case 1:
				type = ctx.FRAGMENT_SHADER;
				ext = "fs";

				break;
		}

		const buff = Util.rd('res/shad/' + name + "." + ext);

		this.id = window.ctx.createShader(type);
		window.ctx.shaderSource(this.id, buff);

		window.ctx.compileShader(this.id);
		if (!window.ctx.getShaderParameter(this.id, window.ctx.COMPILE_STATUS)) {
			console.error('Error compiling shader', window.ctx.getShaderInfoLog(this.id));
		}
	}
};

class Prog {
	id;

	constructor(nameVtx, nameFrag) {
		this.id = window.ctx.createProgram();

		let shadVtx = new Shad(nameVtx, 0);
		let shadFrag = new Shad(nameFrag, 1);

		window.ctx.attachShader(this.id, shadVtx.id);
		window.ctx.attachShader(this.id, shadFrag.id);

		window.ctx.linkProgram(this.id);
		if (!window.ctx.getProgramParameter(this.id, window.ctx.LINK_STATUS)) {
			console.error('Error linking program', window.ctx.getProgramInfoLog(this.id));
		}

		window.ctx.validateProgram(this.id);
		if (!window.ctx.getProgramParameter(this.id, window.ctx.VALIDATE_STATUS)) {
			console.error('Error validating program', window.ctx.getProgramInfoLog(this.id));
		}
	}
};
