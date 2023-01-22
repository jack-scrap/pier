class Mesh {
	pt;
	_noPt;

	vao;

	_vbo;

	constructor(pt) {
		this.pt = pt;
		this._noPt = this.pt.length / 2;

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pt), gl.STATIC_DRAW);

		gl.bindVertexArray(null);
	}
}
