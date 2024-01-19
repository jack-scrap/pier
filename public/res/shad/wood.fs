#version 300 es

precision mediump float;

in vec2 _pos;

out vec4 frag;

const float pi = 3.141593;

const vec3 light = vec3(225, 195, 167);

const vec3 saturated = vec3(225, 170, 119);

bool hex(vec2 loc, float rad) {
	loc = loc * 2.0 - 1.0;

	float angle = atan(loc.x, loc.y);

	float slice = pi * 2.0 / float(6);

	return !bool(step(rad, cos(floor(0.5 + angle / slice) * slice - angle) * length(loc)));
}

void main() {
	frag = vec4(light / 255.0, 1.0);

	const int n = 7;
	for (int i = 0; i < n; i++) {
		if (hex(_pos.xy, float(n - i))) {
			if (bool(mod(float(i), 2.0))) {
				frag = vec4(saturated / 255.0, 1.0);
			} else {
				frag = vec4(light / 255.0, 1.0);
			}
		}
	}
}
