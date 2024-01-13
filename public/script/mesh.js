class Mesh {
	vtc;
	_noVtc;

	vao;

	_vbo;

	constructor(vtc) {
		this.vtc = vtc;
		this._noVtc = this.vtc.length / 3;

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vtc), gl.STATIC_DRAW);

		gl.bindVertexArray(null);
	}
}
