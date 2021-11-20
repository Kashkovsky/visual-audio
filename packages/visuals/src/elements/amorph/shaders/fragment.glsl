varying vec3 vNormal;
varying float vPerlinStrength;

void main(){
    gl_FragColor = vec4(vNormal * vPerlinStrength * 2., 1.);
}