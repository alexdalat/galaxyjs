var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var canvas2 = document.getElementById("canvas2")
var ctx2 = canvas2.getContext("2d")
canvas2.width = window.innerWidth
canvas2.height = window.innerHeight

var time_step // 0.001
var speed // # of iterations per frame

// initalize in init
var config;
var camera;
var bodies;
var canvasCenter;

var start_particle_count = 100;
var thread_count = 10;
var killDist = canvas.width/2;
const G = 1;

var workers = [];
var worker_data = {
	bodies: []
};
var thread_completion = 0;
var ignore_next_workers = false;

function init() {
	camera = {
		pos: new vec2(0, 0),
		scale: 1
	}

	config = {
		// NOTE: all nulls are defined in ui()

		lag_friendly_trail: null,
		lag_friendly_trail_opacity: 0.5, //  < 0.5 leaves faint perma-trail

		debug_trails: null,
		debug_only_first_trail: false,

		rainbow: null,
	}
	console.log(config)

	canvasCenter = new vec2(canvas.width/2, canvas.height/2)
	clearCanvas();
	ui();
	createWorkers();
	tick();
}
function createBodies(num) {
	bodies = []

	maxRadius = 600;
	maxSpeed = 300000
	let total = num;

	let ostep = (maxRadius-50) / total
	let o = 50;
	for(let p = 0; p < total; p++) {
		let rand = randi(0, 360)
		let theta = radians(rand);
		let vtheta = radians(rand + 90)

		let orbit = randi(50, o)
		let s = randi(maxSpeed/2, maxSpeed) / orbit
		bodies.push(
			new Body(
				new vec2(orbit*Math.cos(theta), orbit*Math.sin(theta)),
				new vec2(s*Math.cos(vtheta), s*Math.sin(vtheta)),
				0.01, 2
			),
		)
		o += ostep;
	}

	bodies.push(
		new Body(
			new vec2(0, 0),
			new vec2(0, 0),
			400000000, 50,
			[0, 0, 0],
			false
		)
	)
}

var lastTick = performance.now()
function tick() {
	
	var now = performance.now()
	var deltaTime = now - lastTick
	lastTick = now

	var lb = largestBody(bodies);
	let thread_step = Math.ceil(bodies.length / thread_count);

	for(let t=0; t < thread_count; t++) {
		workers[t].postMessage( JSON.stringify({
			bodies: bodies.slice(t*thread_step, t*thread_step+thread_step),
			config: config,

			lb: lb,
			time_step: time_step,
			speed: speed,
			G: G,
			canvasCenter: canvasCenter,
			killDist: killDist,
			camera: camera,
			maxRadius: maxRadius
		}) );
	}
	if(config.camera_track) {
		camera.pos.x = lerp(camera.pos.x, lb.pos.x*camera.scale, 1)
	}
}

function draw() {
	requestAnimationFrame(tick);

	var now = performance.now()
	var deltaTime = now - lastTick
	lastTick = now

	clearCanvas();
	var lb = largestBody(bodies);
	for(let i = 0; i < bodies.length; i++) {
		var body = bodies[i]

		var drawPos = body.getScreenPos(body.pos)
		var newColor = (config.rainbow) ? body.color : getDistColor(body);
		if(body === lb) newColor = body.color;

		ctx.shadowBlur = ((body !== lb) ? 10 : 30)*camera.scale;
		ctx.shadowColor = (body !== lb) ? rgbToString(newColor) : rgbToString([0, 0, 0]);
		circle(drawPos, body.r*camera.scale, rgbToString(newColor));
		ctx.shadowBlur = 0;

		if(config.debug_trails && !config.debug_only_first_trail || (config.debug_only_first_trail && i === 0)) {
			ctx2.beginPath();
			var oldPos = body.getScreenPos(body.oldpos);
			ctx2.moveTo(oldPos.x, oldPos.y)
			ctx2.lineTo(drawPos.x, drawPos.y)
			ctx2.strokeStyle = rgbToString(newColor)
			ctx2.stroke()
		}
	}
}

function createWorkers() {
	for(let t=0; t < thread_count; t++) {
		workers.push(new Worker('worker.js'));
		workers[t].addEventListener('message', function(e) {
			e = JSON.parse(e.data);
			e = argsToClass(e); // revive all classes!

			worker_data.bodies = worker_data.bodies.concat(e.bodies)
			thread_completion++;
			if(thread_completion >= workers.length) {
				thread_completion = 0;
				if(!ignore_next_workers) {
					bodies = worker_data.bodies
				} else ignore_next_workers = false;
				worker_data.bodies = [];
				requestAnimationFrame(draw);
			}
		}, false);
	}
}

function updateScale(value) {
	clearCanvas()
	clearCanvas2()
	camera.scale = Math.sqrt(value);
	document.getElementById("scaleConsole").innerHTML = round(camera.scale, 2);
}
function updateIteration(value) {
	speed = value;
	document.getElementById("iterationConsole").innerHTML = value;
}
function updateStep(value) {
	time_step = round(Math.pow(value, 2), 6);
	document.getElementById("stepConsole").innerHTML = value;
}
function updateCount(value) {
	clearCanvas()
	clearCanvas2()
	createBodies(value);
	ignore_next_workers = true;
	document.getElementById("countConsole").innerHTML = value;
}
function updateTrail(value) {
	config.lag_friendly_trail = value;
	clearCanvas()
}
function updateRainbow(value) {
	config.rainbow = value;
	clearCanvas()
	clearCanvas2()
}
function updateDebugTrail(value) {
	config.debug_trails = value;
	clearCanvas()
	clearCanvas2()
}

function ui() {
	updateCount(start_particle_count);
	//updateScale(document.getElementById("scaleSlider").value);
	updateStep(document.getElementById("stepSlider").value)
	updateIteration(document.getElementById("iterationSlider").value)
	updateTrail(document.getElementById("trailCheck").checked);
	updateDebugTrail(document.getElementById("debugTrailCheck").checked);
	updateRainbow(document.getElementById("rainbowCheck").checked);
}

function clearCanvas() {
	ctx.rect(0, 0, canvas.width, canvas.height)
	if(config.lag_friendly_trail) ctx.fillStyle = "rgba(25, 29, 30, "+config.lag_friendly_trail_opacity+")"
	else ctx.fillStyle = "rgb(25, 29, 30)"
	ctx.fill();
}
function clearCanvas2() {
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
}

var classes = [vec2, Body];
var class_check_ignore = [""]

var class_types = [];
for(let i=0; i < classes.length; i++) {
    if(classes[i].__type__)
        class_types.push(classes[i].__type__)
    else
        throw new Error(`Type is undefined for ${classes[i].name}.`);
}



window.onload = init