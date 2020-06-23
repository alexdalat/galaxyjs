class Body {
	constructor(pos, vel, mass, radius, color, moveable, oldpos) {
		this.__type__ = Body.name;

		this.pos = pos
		this.velocity = vel
		this.mass = mass
		if(radius == 0)this.r = Math.sqrt(G*mass) / 50
		else this.r = radius

		if(color === undefined) color = HSVtoRGB(Math.random()*360, 100, 100)
		this.color = color
		if(moveable === undefined) moveable = true
		this.moveable = moveable

		this.oldpos = oldpos
	}
	tick(other_body, dt) {
		var a0 = this.getAcceleration(other_body)
		this.velocity = this.velocity.add(a0.scale(0.5 * dt))
		this.pos = this.pos.add(this.velocity.scale(dt))
		
		var a1 = this.getAcceleration(other_body)
		this.velocity = this.velocity.add(a1.scale(0.5 * dt))
	}
	getAcceleration(other_body) {
		var slope = (other_body.pos.y - this.pos.y)/(other_body.pos.x - this.pos.x)
		var angle = Math.atan(slope)
		var distanceSquared = this.pos.distanceSquared(other_body.pos)
		var F = G * this.mass * other_body.mass / distanceSquared;
		var xForce = F * Math.cos(angle)
		var yForce = F * Math.sin(angle)

		var new_acceleration = new vec2(Math.abs(xForce / this.mass), Math.abs(yForce / this.mass))
		if(this.pos.x > other_body.pos.x)
			new_acceleration.x = -new_acceleration.x;
		if(this.pos.y > other_body.pos.y)
			new_acceleration.y = -new_acceleration.y;
		return new_acceleration
	}
	collisionCheck(other_body, scale) { // https://stackoverflow.com/questions/1736734/circle-circle-collision
		if( ((this.pos.distance(other_body.pos)*scale) <= ((this.r*scale+other_body.r*scale)^2)) ) return true;
		else return false;
	}
	getScreenPos(npos) {
		return canvasCenter.sub(camera.pos.sub(npos.scale(camera.scale)))
	}
	orbitVel(nbody) { // https://en.wikipedia.org/wiki/Orbital_speed
		return Math.sqrt((G*nbody.mass)*(1/this.pos.dist(nbody.pos)))
	}

	getG() {
		return (G * this.mass) / Math.pow(this.r, 2);
	}
}
Body.__type__ = Body.name;