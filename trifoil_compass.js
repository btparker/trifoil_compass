var four_corners_map;
var COLORS, LOCATIONS;

function setup() {
    angleMode(RADIANS);
    COLORS = {
        "iron": color(255, 0, 0),
        "gold": color(255, 223, 0),
        "platinum": color(229, 228, 226),
        "cobalt": color(0, 71, 171),
    };

    LOCATIONS = {
        "compass": createVector(1016, 265),
        "tarbean": createVector(745, 1247),
        "great_road": createVector(660, 885),
        "tinker_tanner": createVector(1040, 320),
        "ralien": createVector(415, 1380),
        "khershaen": createVector(385, 550),
    };
    // noCursor();
    createCanvas(windowWidth, windowHeight);
    four_corners_map = new FourCornersMap();
    four_corners_map.resize();
}

function draw() {
    background(color('white'));
    four_corners_map.display();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    four_corners_map.resize();
}

function mouseClicked() {

}

function getAngle(cursor, position) {
    position = position.copy();
    cursor = cursor.copy();
    var vec = cursor.sub(position);
    return vec.heading();
}

// MAP
var FourCornersMap = function() {
    this.display_markers = false;
    this.scale = 1.0;
    this.position = createVector(0, 0);
    this.background_img = loadImage("assets/map_2.jpg");
    this.width = 1200;
    this.height = 1800;
    this.cursor = new MapCursor();
    this.compass = new TrifoilCompass(LOCATIONS['compass'], 115);
    
    this.gold_marker = new LocationMarker(COLORS['gold'], LOCATIONS['tarbean']);
    this.platinum_marker = new LocationMarker(COLORS['platinum'], LOCATIONS['ralien']);
    this.cobalt_marker = new LocationMarker(COLORS['cobalt'],  LOCATIONS['khershaen']);

    this.location_markers = {
        "gold": this.gold_marker,
        "platinum": this.platinum_marker,
        "cobalt": this.cobalt_marker,
    };
}

FourCornersMap.prototype.resize  = function() {
    this.scale = windowHeight / this.height;
}

FourCornersMap.prototype.getCompass  = function() {
    return this.compass;
}

FourCornersMap.prototype.getLocationMarkers  = function() {
    return this.location_markers;
}

FourCornersMap.prototype.display = function() {
    map_mouse_x = mouseX / this.scale - this.position.x;
    map_mouse_y = mouseY / this.scale - this.position.y;

    map_mouse_position = createVector(map_mouse_x, map_mouse_y);

    push();
    scale(this.scale);
    translate(this.position.x, this.position.y);
    image(this.background_img, 0, 0);

    // Get needle orientations, mapped by location marker
    location_markers = this.getLocationMarkers();
    needle_orientations = _.mapValues(location_markers, function(location_marker) {
        return getAngle(map_mouse_position, location_marker.position);
    });

    // Set the compass needles to the computed orientations
    compass = this.getCompass();
    _.forOwn(needle_orientations, function(needle_orientation, needle_key){
        compass.setNeedleOrientation(needle_orientation, needle_key);
    });

    // Display
    compass.display();

    if (this.display_markers == false){
        _.each(location_markers, function(location_marker){
            location_marker.display();
        });
    }
    
    this.cursor.display(map_mouse_position);
    pop();
}

FourCornersMap.prototype.getAngle = function(cursor, position) {
    position = position.copy();
    cursor = cursor.copy();
    var vec = cursor.sub(position);
    return vec.heading();
}

// COMPASS
var TrifoilCompass = function(position, radius) {
    this.position = position.copy();
    this.radius = radius;

    iron_needle = new Needle(0.95 * this.radius, 15, COLORS['iron']);
    gold_needle = new Needle(0.95 * this.radius, 15, COLORS['gold']);
    platinum_needle = new Needle(0.85 * this.radius, 10, COLORS['platinum']);
    cobalt_needle = new Needle(0.75 * this.radius, 5, COLORS['cobalt']);

    this.needles = {
        // "iron": iron_needle,
        "gold": gold_needle,
        "platinum": platinum_needle,
        "cobalt": cobalt_needle,
    };
}

TrifoilCompass.prototype.setNeedleOrientation = function(orientation, key) {
    needle = this.needles[key];
    needle.orientation = orientation;
}

TrifoilCompass.prototype.display = function() {
    push();
    translate(this.position.x, this.position.y);
    rotate(- PI / 2.0);
    ellipseMode(CENTER); 
    fill(color('white'));
    ellipse(0, 0, 2*this.radius);
    for (var needle_key in this.needles) {
        if (this.needles.hasOwnProperty(needle_key)) {
            needle = this.needles[needle_key];
            needle.display();
        }
    }
    fill(color('white'));
    stroke(color('black'));
    strokeWeight(3);
    ellipse(0, 0, 40);
    pop();
}

var Needle = function(radius, width, needle_color) {
    this.radius = radius;
    this.color = needle_color;
    this.width = width;
    this.orientation = 0;
}

Needle.prototype.display = function() {
    shaded_color_0 = lerpColor(this.color, color('black'), 0.25);
    shaded_color_1 = lerpColor(this.color, color('black'), 0.50);
    shaded_color_2 = lerpColor(this.color, color('black'), 0.75);

    push();
    rotate(this.orientation);
    noStroke();

    fill(this.color);
    triangle(0, -this.radius, 0, 0, this.width, 0);

    fill(shaded_color_0);
    triangle(0, -this.radius, 0, 0, -this.width, 0);

    fill(shaded_color_1);
    triangle(0, this.radius, 0, 0, this.width, 0);

    fill(shaded_color_2);
    triangle(0, this.radius, 0, 0, -this.width, 0);

    pop();
}

// MAP CURSOR
var MapCursor = function() {
}

MapCursor.prototype.display = function(position) {
    // Update
    this.radius = 5;

    // Draw
    push();
    ellipseMode(CENTER); 
    noFill();
    stroke(color(255, 255, 0));
    strokeWeight(2);
    ellipse(position.x, position.y, 2*this.radius);
    pop();
}


// LOCATION MARKER
var LocationMarker = function(marker_color, position) {
    this.color = marker_color;
    this.position = position;
}

LocationMarker.prototype.display = function() {
    // Update
    this.radius = 15;

    // Draw
    push();
    ellipseMode(CENTER); 
    stroke(color('black'));
    strokeWeight(4);
    fill(this.color);
    ellipse(this.position.x, this.position.y, 2*this.radius);
    ellipse(this.position.x, this.position.y, 4);
    pop();
}
