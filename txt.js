var glyphBuff = Util.rd("res/glyph.json");

var glyph = JSON.parse(glyphBuff);

class Char {
	asciiToAlphaNo(c) {
		let i = c.charCodeAt(0);

		if (i >= "0".charCodeAt(0) && i <= "9".charCodeAt(0)) {
			return i - 48;
		}

		if (i >= "a".charCodeAt(0) && i <= "z".charCodeAt(0)) {
			return i - 97 + 10;
		}
	}

	constructor(c, loc = [0.0, 0.0]) {
		this.x = loc[0];
		this.y = loc[1];

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		// Data
		this.vtc = glyph[this.asciiToAlphaNo(c)];

		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vtc), gl.STATIC_DRAW);

		// Matrix
		this.model = new Float32Array(16);
		mat4.identity(this.model);

		mat4.translate(this.model, this.model, [this.x, this.y, 0.0]);

		// Program
		this.prog = new Prog("vec", "green");

		this.prog.use();

		// Attribute
		this.attrPos = gl.getAttribLocation(this.prog.id, "pos");
		gl.vertexAttribPointer(this.attrPos, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(this.attrPos);

		// Uniform
		this.uniModel = gl.getUniformLocation(this.prog.id, "model");
		gl.uniformMatrix4fv(this.uniModel, gl.FALSE, this.model);

		this.prog.unUse();
	}

	draw() {
		gl.bindVertexArray(this.vao);
		gl.useProgram(this.prog.id);

		gl.drawArrays(gl.LINES, 0, this.vtc.length / 2);

		gl.bindVertexArray(null);
		this.prog.unUse();
	}
};

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
};
