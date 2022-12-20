#version 300 es

precision mediump float;

in vec3 pos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

out vec3 _pos;
out vec3 _norm;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_pos = gl_Position.xyz;
}
