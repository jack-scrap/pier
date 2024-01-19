#version 300 es

precision mediump float;

in vec2 _pos;

out vec4 frag;

const float pi = 3.141593;

bool hex(vec2 loc, float rad) {
	loc = loc * 2.0 - 1.0;

	float angle = atan(loc.x, loc.y);

	float slice = pi * 2.0 / float(6);

	return bool(step(rad, cos(floor(0.5 + angle / slice) * slice - angle) * length(loc)));
}

void main() {
	frag = vec4(vec3((hex(_pos.xy, 1.0) ? vec3(225, 195, 167) : vec3(225, 170, 119)) / vec3(255.0)), 1.0);
}
