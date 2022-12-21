#version 300 es

precision mediump float;

in vec3 _pos;

out vec4 frag;

vec3 sun = vec3(1.0, 1.0, -1.0);

void main() {
	vec3 normFace = normalize(cross(dFdx(_pos), dFdy(_pos)));

	float diff = max(dot(normFace, normalize(sun)), 0.0) * 0.1;

	frag = vec4((1.0 - diff) * (vec3(214, 215, 148) / vec3(255)), 1.0);
}
