#version 300 es

precision mediump float;

in vec3 _pos;
out vec4 frag;

const float stride = 1.0;

void main() {
	frag = vec4(vec3(mod(_pos.x, stride) > stride / 2.0 ? vec3(1.0, 0.0, 0.0) : vec3(1.0)), 1.0);
}
