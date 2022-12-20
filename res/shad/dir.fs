#version 300 es

precision mediump float;

in vec3 _pos;

out vec4 frag;

vec3 sun = vec3(1.0, 1.0, -1.0);

void main() {
	vec3 normFace = normalize(cross(dFdx(_pos), dFdy(_pos)));

	float diff = max(dot(normFace, normalize(sun)), 0.0) * 0.2;

	frag = vec4((1.0 - diff) * vec3(0.8381, 0.8441, 0.5802), 1.0);
}
