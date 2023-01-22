class Mesh {
	_pt;
	_noPt;

	vao;

	_vbo;

	constructor(pt) {
		this._pt = pt;
		this._noPt = this._pt.length / 2;

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._pt), gl.STATIC_DRAW);

		gl.bindVertexArray(null);
	}
}
