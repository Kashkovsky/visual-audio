vec4 grayscale(vec4 texture, float factor) {
	float grey = 0.21 * texture.r + 0.71 * texture.g + 0.07 * texture.b;
	return vec4(texture.r * factor + grey * (1.0 - factor), texture.g * factor + grey * (1.0 - factor), texture.b * factor + grey * (1.0 - factor), 1.0);
}

vec4 grayscale(vec4 texture) {
	return grayscale(texture, 0.0);
}

#pragma glslify: export(grayscale)