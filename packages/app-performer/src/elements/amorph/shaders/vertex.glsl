uniform float vTime;
uniform float vDistortionFrequency;
uniform float vDisplacementFrequency;
uniform float vDisplacementStrength;

varying vec3 vNormal;
varying float vPerlinStrength;

@import ../../../utils/shader/perlin3d;
@import ../../../utils/shader/perlin4d;

void main(){
	vec3 newPosition = position;

	vec3 dispacementPosition = vec3(position * vDisplacementFrequency);
	
	dispacementPosition.x = perlin3d(vec3(position.yz * vDistortionFrequency, vTime * 0.01));
	dispacementPosition.y = perlin3d(vec3(position.xz * vDistortionFrequency, vTime * 0.01));
	dispacementPosition.z = perlin3d(vec3(position.xy * vDistortionFrequency, vTime * 0.01));

	float perlinStrength = perlin4d(vec4(dispacementPosition, vTime * 0.01)) * vDisplacementStrength;

	newPosition += normal * perlinStrength;
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    vNormal = normal;
	vPerlinStrength = perlinStrength;
}