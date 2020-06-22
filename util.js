function circle(xy, r, color) {
	ctx.beginPath();
	ctx.arc(xy.x, xy.y, r, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}
function getDistColor(body) {
	var dist = body.pos.distance(largestBody(bodies).pos) / (maxRadius - largestBody(bodies).r) * 100
	return HSVtoRGB(240, dist, 100)
}
function largestBody(array) {
	return array.reduce(function(prev, current) {
		return (prev.mass > current.mass) ? prev : current
	})
}

function storeLastPosition(arr, xy) {
	// push an item
	arr.push(xy);
   
	//get rid of first item
	if (arr.length > config.fancy_trail_length) {
		arr.shift();
	}
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
function randi(min, max) { // inclusive for both
	return Math.floor(Math.random() * (max - min + 1) ) + min;
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