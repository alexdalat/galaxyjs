function circle(xy, r, color) {
	ctx.beginPath();
	ctx.arc(xy.x, xy.y, r, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}
function getDistColor(body) {
	var dist = body.pos.distance(largestBody(bodies).pos) / (canvasCenter.y - largestBody(bodies).r) * 100
	return HSVtoRGB(240, dist, 150-dist)
}
function getDistBodyColor(body) {
	var newColor = RGBtoHSV(body.color[0], body.color[1], body.color[2])
	var dist = body.pos.distance(largestBody(bodies).pos) / (canvasCenter.y - largestBody(bodies).r) * 100
	newColor.v = 100 - dist
	return HSVtoRGB(newColor.h, newColor.s, newColor.v)
}
function largestBody(array) {
	return array.reduce(function(prev, current) {
		return (prev.mass > current.mass) ? prev : current
	})
}
function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}
function rgbToString(rgb) {
	if(rgb.r === undefined)
		return "rgb("+rgb[0]+", "+rgb[1]+", "+rgb[2]+")"
	else
		return "rgb("+rgb.r+", "+rgb.g+", "+rgb.b+")"
}
function rgbaToString(rgba) {
	if(rgba.r === undefined)
		return "rgb("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")"
	else
		return "rgb("+rgba.r+", "+rgba.g+", "+rgba.b+", "+rgba.a+")"
}
function HSVtoRGB(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    s /= 100;
    v /= 100;
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
    return [
        Math.round(r * 255), 
        Math.round(g * 255), 
        Math.round(b * 255)
    ];
}
function RGBtoHSV (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}
function randi(min, max) { // inclusive for both
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function randf(min, max) {
	return Math.random() * (max - min) + min;
}
function removeFromArray(needle, array) {
	return array.filter(function(item) {
		return item !== needle
	})
}
function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function round(num, place) {
	return Math.round((num + Number.EPSILON) * Math.pow(10, place)) / Math.pow(10, place)
}
function radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

/****** WORKER STUFF ********/

function argsToClass(d) {
    var l = 0;
    if(isObject(d))
        l = Object.size(d);
    else
        l = d.length;
    for(let i=0; i < l; i++) {
        var element;
        var element_key = null;
        if(isObject(d)) {
            element = Object.values(d)[i];
            element_key = Object.keys(d)[i];
        } else
            element = d[i];
        if(class_check_ignore.includes(element_key))continue;
        if(isObject(element) || Array.isArray(element)) {
            if(isObject(element)) {
                if(element.__type__ != null) {
                    var idx = class_types.indexOf(element.__type__);
                    if(idx == -1) {
                        throw new Error(`Type ${element.__type__} is not defined in classes.`);
                    } else {
                        d[element_key] = argsToClass(element);
                        d[element_key] = new classes[idx](...Object.values(element).slice(1));
                    }
                } else { // is a non-class object
                    d[element_key] = argsToClass(element);
                }
            } else { // is an array
                d[i] = argsToClass(element);
            }
        }
    }
    return d;
}

function isObject(element) {
    return (typeof element === 'object' && element !== null)
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};