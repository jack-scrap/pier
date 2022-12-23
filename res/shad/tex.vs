#version 300 es

precision mediump float;

in vec3 pos;
in vec2 st;

out vec2 _st;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_st = st;
}
