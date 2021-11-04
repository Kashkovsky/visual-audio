varying vec3 vNormal;

// #pragma glslify: perlin3d = require('../../../../utils/shader/perlin3d.glsl')

void main(){
    vec4 viewPosition = viewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    vNormal = normal;
}