uniform float noiseStrength;
uniform int noiseType;
uniform float particleSize;
uniform float time;
uniform float [256] frequency;

// TODO: create easing functions for glsl
float PI = 3.141592653589793;
float ease(float n) {
	return (cos(PI * n) - 1.) / 2.;
}

varying vec3 vPosition;
varying float vNoise;

@import ../../../utils/shader/perlin3d;

void main() {
	vec3 pos = position;
	int index = int(floor((pos.x + 0.5) * 64.));
	float height = frequency[index] * 0.003 - abs(pos.y * 0.75);
	vNoise = 1.;
	if (height + pos.z > 0.) {
		pos.z -= ease(height);
		if (noiseStrength > 0.) {
			vec2 base;
			if (noiseType == 0) {
				base = pos.xy;
			} else if (noiseType == 1) {
				base = pos.yx;
			} else if (noiseType == 2) {
				base = pos.xz;
			} else if (noiseType == 3) {
				base = pos.zx;
			} else if (noiseType == 4) {
				base = pos.yz;
			} else if (noiseType == 5) {
				base = pos.zy;
			}
			float perlinStrength = perlin3d(vec3(base, time * 0.01));
			float noise = perlinStrength * noiseStrength;
			pos += noise;
			vNoise = noise;
		}
	}
	vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
	gl_PointSize = particleSize;
	vPosition = pos * 10.;
}