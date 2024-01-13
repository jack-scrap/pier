#version 300 es

precision mediump float;

in vec2 pos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

void main() {
  gl_Position = proj * view * model * vec4(vec3(pos, 0.0), 1.0);
}
