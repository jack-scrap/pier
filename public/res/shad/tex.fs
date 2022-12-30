#version 300 es

precision mediump float;

in vec2 _st;

out vec4 frag;

uniform sampler2D sampler;

void main() {
	frag = texture(sampler, _st);
}
