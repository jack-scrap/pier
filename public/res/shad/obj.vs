#version 300 es

precision mediump float;

in vec3 pos;
out vec3 _pos;

uniform mat4 world;
uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

void main() {
  gl_Position = proj * view * world * model * vec4(pos, 1.0);

	_pos = pos;
}
