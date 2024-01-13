#version 300 es

precision mediump float;

in vec3 _pos;
out vec4 frag;

const float stroke = 0.16;

bool inRng(float val, float floor, float roof) {
	return val >= floor && val <= roof;
}

void main() {
	frag = vec4(inRng(_pos.x, -stroke, stroke) ||  inRng(_pos.z, -stroke, stroke) ? vec3(1.0) : vec3(1.0, 0.0, 0.0), 1.0);
}
