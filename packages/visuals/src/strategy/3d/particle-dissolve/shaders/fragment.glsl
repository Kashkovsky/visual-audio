uniform sampler2D t1;
uniform sampler2D mask;
uniform float imageSize;

varying vec2 vCoordinates;
varying vec3 vPos;

@import ../../../../utils/shader/vignette.glsl;
@import ../../../../utils/shader/grayscale.glsl;

void main() {
	vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
	
	vec4 maskTexture = texture2D(mask, gl_PointCoord);
	vec2 myUv = vec2(vCoordinates.x / imageSize, vCoordinates.y / imageSize);
	vec4 image = texture2D(t1, myUv);
	 
	float alpha = 1. - clamp(0.,1., abs(vPos.z / 900.));
	float radius = imageSize/ 2.;
	alpha = vignette(vCoordinates.xy, radius, alpha);
	gl_FragColor = grayscale(image);
	gl_FragColor.a *= step(ll, 0.5) * maskTexture.r*alpha;
 } 