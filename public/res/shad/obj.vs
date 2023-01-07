#version 300 es

precision mediump float;

in vec3 pos;
in vec2 st;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

out vec3 _pos;
out vec2 _st;

void main() {
	gl_Position = proj * view * model * vec4(pos, 1.0);

	_pos = vec3(model * vec4(pos, 1.0));
	_st = vec2(st.x, 1.0 - st.y);
}
