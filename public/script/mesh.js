class Mesh {
	vao;

	_vbo;

	constructor(vtc) {
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtc), gl.STATIC_DRAW);

		gl.bindVertexArray(null);
	}
}
