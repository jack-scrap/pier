#version 300 es

precision mediump float;

in vec2 _pos;

out vec4 frag;

bool circ(float rad, vec2 loc) {
	return bool(step(rad, distance(loc, vec2(0.5))));
}

void main() {
	frag = vec4(vec3(circ(0.1, _pos)), 1.0);
}
