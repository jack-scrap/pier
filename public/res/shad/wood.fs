#version 300 es

precision mediump float;

in vec2 _pos;

out vec4 frag;

bool circ(float rad, vec2 loc) {
	return bool(step(rad, distance(loc, vec2(0.5))));
}

void main() {
	frag = vec4((circ(1.0, _pos) ? vec3(225, 195, 167) : vec3(0.0)) / 255.0, 1.0);
}
