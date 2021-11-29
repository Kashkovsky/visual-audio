float distanceFromCenter(vec2 coord, vec2 center) {
	float d = sqrt(
		abs(
			pow(coord.x - center.x, 2.) + pow(coord.y - center.y, 2.)
		)
	);

	return d;
}

float vignette(vec2 coord, float radius, float alpha) {
	float fromCenter = distanceFromCenter(coord, vec2(radius, radius));
	if (fromCenter >= radius) {
		return alpha * 1./fromCenter;
	}

	return alpha;
}

#pragma glslify: export(vignette)