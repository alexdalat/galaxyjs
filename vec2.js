class vec2 {
	static __type__ = this.name;
	constructor(x, y) {
		this.__type__ = vec2.__type__;
		if(x===undefined)x=0
		if(y===undefined)y=0
		this.x = x;
		this.y = y;
	}
	add(v2) {
		return new vec2(this.x + v2.x, this.y + v2.y)
	}
	sub(v2) {
		return new vec2(this.x - v2.x, this.y - v2.y)
	}
	scale(f) {
		return new vec2(this.x * f, this.y * f)
	}

	distance(v2) {
		return Math.sqrt(Math.pow(v2.x - this.x, 2) + Math.pow(v2.y - this.y, 2))
	}
	dist(v2) {
		return this.distance(v2);
	}
	distanceSquared(v2) {
		return Math.pow(v2.x - this.x, 2) + Math.pow(v2.y - this.y, 2)
	}
	equal(v2) {
		return (this.x === v2.x && this.y === v2.y)
	}
	set(v2) {
		this.x = v2.x; this.y = v2.y;
	}


	static add(v1, v2) {
		return new vec2(v1.x + v2.x, v1.y + v2.y)
	}
	static sub(v1, v2) {
		return new vec2(v1.x - v2.x, v1.y - v2.y)
	}
}