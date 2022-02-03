uniform bool colored;

varying vec3 vPosition;
varying float vNoise;

void main() {
	vec2 coord = gl_PointCoord - vec2(0.5);
	if(length(coord) > 0.5 || vPosition.z == 0.)
    	discard;
	if (colored) 
		gl_FragColor = vec4(vPosition.x * vNoise, vPosition.y * vNoise, vPosition.z, vPosition.z * 0.1);
	else 
		gl_FragColor = vec4(vPosition.z, vPosition.z, vPosition.z, vPosition.z * 0.1);
 } 