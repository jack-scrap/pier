var glyph = JSON.parse(Fs.rd(Ld.resPath + "/glyph.json"));

class Char extends Vec {
	static asciiToAlphaNo(c) {
		let i = c.charCodeAt(0);

		if (i >= "0".charCodeAt(0) && i <= "9".charCodeAt(0)) {
			return i - 48;
		}

		if (i >= "a".charCodeAt(0) && i <= "z".charCodeAt(0)) {
			return i - 97 + 10;
		}
	}

	constructor(c, loc = [0.0, 0.0]) {
		super(glyph[Char.asciiToAlphaNo(c)], loc);
	}

	draw() {
		gl.bindVertexArray(this._mesh.vao);
		gl.useProgram(this.prog.id);

		gl.drawArrays(gl.LINES, 0, this._pt.length);

		gl.bindVertexArray(null);
		this.prog.unUse();
	}
}

class Str {
	constructor(buff, loc = [0.0, 0.0]) {
		this.buff = [];

		this.wd = (buff.length + (buff.length - 1)) / 10;

		for (let i = 0; i < buff.length; i++) {
			this.buff.push(new Char(buff[i], [loc[0] - (this.wd / 4) + (i * (1 / 10)), loc[1]]));
		}
	}

	draw() {
		for (let c of this.buff) {
			c.draw();
		}
	}
}
