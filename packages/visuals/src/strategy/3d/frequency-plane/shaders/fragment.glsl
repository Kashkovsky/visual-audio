varying float vMagnitude;

void main() {
	vec2 coord = gl_PointCoord - vec2(0.5);
if(length(coord) > 0.5 || vMagnitude == 0.)
    discard;
    gl_FragColor = vec4(vMagnitude, vMagnitude, vMagnitude, vMagnitude * 0.1);
 } 