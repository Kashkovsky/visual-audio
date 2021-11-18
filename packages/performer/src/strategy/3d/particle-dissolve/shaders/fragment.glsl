uniform sampler2D t1;
uniform sampler2D mask;
uniform float imageSize;

varying vec2 vCoordinates;
varying vec3 vPos;

 void main() {
	vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
	
	vec4 maskTexture = texture2D(mask, gl_PointCoord);
	vec2 myUv = vec2(vCoordinates.x / imageSize, vCoordinates.y / imageSize);
	vec4 image = texture2D(t1, myUv);
	 
	float alpha = 1. - clamp(0.,1., abs(vPos.z / 900.));

	gl_FragColor = image;
	gl_FragColor.a *= step(ll, 0.5) * maskTexture.r*alpha;
 } 