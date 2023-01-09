class Mesh {
	vao;

	_vbo;

	constructor(pt) {
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this._vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pt), gl.STATIC_DRAW);

		gl.bindVertexArray(null);
	}
}
