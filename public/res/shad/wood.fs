#version 300 es

precision mediump float;

out vec4 frag;

void main() {
	frag = vec4(vec3(225, 195, 167) / 225.0, 1.0);
}
