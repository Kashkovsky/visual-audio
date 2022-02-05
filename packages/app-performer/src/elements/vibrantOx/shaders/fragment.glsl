uniform bool colored;
uniform float vTime;
uniform float vDistortionFrequency;
uniform float vDisplacementFrequency;
uniform float vDisplacementStrength;
uniform sampler2D vTexture;

varying vec3 vNormal;
varying float vPerlinStrength;
varying vec2 vUv;

float PI = 3.141592653589793;

@import ../../../utils/shader/perlin4d;

void main(){
    if (colored)
	{
		
		float diff = dot(vec3(1.), vNormal);
		float phi = acos(vNormal.y);
		float angle = atan(vNormal.x, vNormal.z);

		float fresnel = pow(abs(dot(cameraPosition, vNormal)), 3.);
		vec2 fakeUv = vec2((angle + PI) / (2. * PI), phi / PI);
		
		vec2 uv = vec2(dot(vec3(1.), vNormal), dot(vec3(-1., 0., 1.), vNormal));
		vec2 mutatingUv = uv + 0.3 * perlin4d(vec4(fakeUv * 5., vTime/100., 0.), vec4(10.));
		vec4 tex = texture2D(vTexture, mutatingUv) * fresnel;
		gl_FragColor = tex;
	}
	else {
		float color = vNormal.z * vPerlinStrength * 2.;
		gl_FragColor = vec4(color, color, color, 1.);
	}
}