#version 300 es

precision mediump float;

in vec3 _pos;
in vec2 _st;

out vec4 frag;

uniform sampler2D sampler;

vec3 sun = vec3(1.0, 1.0, -1.0);

void main() {
	vec3 normFace = normalize(cross(dFdx(_pos), dFdy(_pos)));

	float diff = max(dot(normFace, normalize(sun)), 0.0) * 0.1;

	frag = vec4((1.0 - diff) * texture(sampler, _st));
}
