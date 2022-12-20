#version 300 es

precision mediump float;

in vec3 pos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

out vec3 _pos;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_pos = vec3(model * vec4(pos, 1.0));
}
