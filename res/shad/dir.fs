precision mediump float;

vec3
	posLight = vec3(-1.0, 1.0, -1.0),
	colLight = vec3(1.0, 1.0, 1.0),
	colObj = vec3(1.0, 1.0, 1.0);

varying vec3
	_posFrag,
	_norm;

void main() {
	vec3 dirLight = normalize(posLight - _posFrag);

	float diff = max(dot(_norm, dirLight), 0.1);

	gl_FragColor = vec4(diff * colLight * colObj, 1.0);
}
