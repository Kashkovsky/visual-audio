uniform bool colored;

varying vec3 vNormal;
varying float vPerlinStrength;

void main(){
    if (colored)
		gl_FragColor = vec4(vNormal * vPerlinStrength * 2., 1.);
	else {
		float color = vNormal.z * vPerlinStrength * 2.;
		gl_FragColor = vec4(color, color, color, 1.);
	}
}