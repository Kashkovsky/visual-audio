uniform float particleSize;
uniform float [256] frequency;

// TODO: create easing functions for glsl
float PI = 3.141592653589793;
float ease(float n) {
	return (cos(PI * n) - 1.) / 2.;
}

varying float vMagnitude;

void main() {
	vec3 pos = position;
	int index = int(floor((pos.x + 0.5) * 64.));
	float height = frequency[index] * 0.003 - abs(pos.y * 0.75);
	if (height + pos.z > 0.) {
		pos.z -= ease(height);
	}
	vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
	gl_PointSize = particleSize;
	vMagnitude = pos.z * 10.;
}