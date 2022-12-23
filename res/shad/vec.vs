#version 300 es

precision mediump float;

in vec2 pos;

uniform mat4 model;

const float scale = 0.1;

vec2 dim = vec2(1.2, 0.6);

void main() {
	float aspect = dim[0] / dim[1];

  gl_Position = model * vec4(vec3(vec2(pos.x / aspect, pos.y), 0.0) * scale, 1.0);
}
