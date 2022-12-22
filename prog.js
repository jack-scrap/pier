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

		this.id = ctx.createShader(type);
		ctx.shaderSource(this.id, buff);

		ctx.compileShader(this.id);
		if (!ctx.getShaderParameter(this.id, ctx.COMPILE_STATUS)) {
			console.error('Error compiling shader', ctx.getShaderInfoLog(this.id));
		}
	}
};

class Prog {
	id;

	constructor(nameVtx, nameFrag) {
		this.id = ctx.createProgram();

		let shadVtx = new Shad(nameVtx, 0);
		let shadFrag = new Shad(nameFrag, 1);

		ctx.attachShader(this.id, shadVtx.id);
		ctx.attachShader(this.id, shadFrag.id);

		ctx.linkProgram(this.id);
		if (!ctx.getProgramParameter(this.id, ctx.LINK_STATUS)) {
			console.error('Error linking program', ctx.getProgramInfoLog(this.id));
		}

		ctx.validateProgram(this.id);
		if (!ctx.getProgramParameter(this.id, ctx.VALIDATE_STATUS)) {
			console.error('Error validating program', ctx.getProgramInfoLog(this.id));
		}
	}
};
