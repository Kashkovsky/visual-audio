attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;

varying vec2 vUv;
varying vec2 vCoordinates;
varying vec3 vPos;

uniform float particleSize;
uniform float move;
uniform float time;
uniform vec2 mouse;

void main() {
	vUv = uv;
	vec3 pos = position;
	// NOT STABLE
	pos.x += sin(move*aSpeed)*2.;
	pos.y += sin(move*aSpeed)*2.;
	pos.z = mod(position.z + move*200.*aSpeed + aOffset, 2000.) - 1000.; 

	// TODO: Utilize stable distortion
	vec3 stable = position;
	stable.x += 50. * sin(0.1 * time * aPress) * aDirection;
	stable.y += 50. * sin(0.1 * time * aPress) * aDirection;
	stable.z += 200. * cos(0.1 * time * aPress) * aDirection;


	vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
	gl_PointSize = particleSize * ( 1. / - mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
	vCoordinates = aCoordinates.xy;
	vPos = pos;
}