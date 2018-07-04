var four_corners_map;
var COLORS, LOCATIONS;
var SLIDERS;
var DEBUG = true;
var canvas;

function setup() {
    angleMode(RADIANS);
    COLORS = {
        "iron": color(255, 0, 0),
        "gold": color(255, 223, 0),
        "platinum": color(229, 228, 226),
        "cobalt": color(0, 71, 171),
    };

    // SLIDERS = {
    //     "gold": createSlider(-180, 180, 0).position(0,30).style('width', '80px'),
    //     "platinum": createSlider(-180, 180, 0).position(0,60).style('width', '80px'),
    //     "cobalt": createSlider(-180, 180, 0).position(0,90).style('width', '80px'),
    // };

    LOCATIONS = {
        "compass": createVector(1011, 269),
        "tarbean": createVector(745, 1247),
        "great_road": createVector(660, 885),
        "tinker_tanner": createVector(1040, 320),
        "ralien": createVector(415, 1380),
        "khershaen": createVector(385, 550),
    };
    // noCursor();

    four_corners_map = new FourCornersMap();
    canvas = createCanvas(four_corners_map.width, four_corners_map.height);
    four_corners_map.resize();
}

function draw() {
    background(color('white'));
    four_corners_map.display();
}

function windowResized() {
    four_corners_map.resize();
}

function mouseClicked() {

}

// https://stackoverflow.com/questions/19723641/find-intersecting-point-of-three-circles-programmatically
function calculateThreeCircleIntersection(circle0, circle1, circle2) {
    var a, dx, dy, d, h, rx, ry;
    var point2_x, point2_y;

    x0 = circle0.centroid.x;
    y0 = circle0.centroid.y;
    r0 = circle0.radius;

    x1 = circle1.centroid.x;
    y1 = circle1.centroid.y;
    r1 = circle1.radius;

    x2 = circle2.centroid.x;
    y2 = circle2.centroid.y;
    r2 = circle2.radius;

    /* dx and dy are the vertical and horizontal distances between
    * the circle centers.
    */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = p5.Vector.dist(circle0.centroid, circle1.centroid);

    /* Check for solvability. */
    if (d > (r0 + r1))
    {
        /* no solution. circles do not intersect. */
        return false;
    }
    if (d < abs(r0 - r1))
    {
        /* no solution. one circle is contained in the other */
        return false;
    }

    /* 'point 2' is the point where the line through the circle
    * intersection points crosses the line between the circle
    * centers.
    */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    point2_x = x0 + (dx * a/d);
    point2_y = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
    * intersection points.
    */
    h = sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
    * point 2.
    */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    var i_pt1_x = point2_x + rx;
    var i_pt2_x = point2_x - rx;
    var i_pt1_y = point2_y + ry;
    var i_pt2_y = point2_y - ry;

    /* Lets determine if circle 3 intersects at either of the above intersection points. */
    dx = i_pt1_x - x2;
    dy = i_pt1_y - y2;

    var d1 = sqrt((dy*dy) + (dx*dx));

    dx = i_pt2_x - x2;
    dy = i_pt2_y - y2;

    var d2 = sqrt((dy*dy) + (dx*dx));

    var intersection_pt;
    if(abs(d1 - r2) < abs(d2 - r2)) {
        intersection_pt = createVector(i_pt1_x, i_pt1_y);
    }
    else {
        intersection_pt = createVector(i_pt2_x, i_pt2_y);
    }
    return intersection_pt;
}

function getDirectionAngle(cursor, position) {
    var vec = p5.Vector.sub(cursor, position);
    return vec.heading();
}

function getAngleBetweenTwoPoints(cursor, posA, posB) {
    var vecA = p5.Vector.sub(cursor, posA);
    var vecB = p5.Vector.sub(cursor, posB);
    return p5.Vector.angleBetween(vecA, vecB);
}

function getSignedAngleBetweenTwoHeadings(angleA, angleB) {
    var vecA = p5.Vector.fromAngle(angleA);
    var vecB = p5.Vector.fromAngle(angleB);
    angle = atan2(vecB.y, vecB.x) - atan2(vecA.y, vecA.x);
    if (angle < 0){
        angle += 2 * PI;
    }
    return angle;
}

function circleFrom3Points(p1, p2, p3) {
    var deltaA = p5.Vector.sub(p2, p1),
        deltaB = p5.Vector.sub(p3, p2),
        centroid,
        radius;

    if (abs(deltaA.x) <= Number.EPSILON && abs(deltaB.y) <= Number.EPSILON) {
        centroid = createVector(p2.x + p3.x, p1.y + p2.y).mult(0.5);
        radius = centroid.dist(p1);
    } 
    else {
        var aSlope = deltaA.y / deltaA.x;
        var bSlope = deltaB.y / deltaB.x;
        if (abs(aSlope - bSlope) > Number.EPSILON && aSlope !== 0) {
            var x = (aSlope * bSlope * (p1.y - p3.y) + bSlope * (p1.x + p2.x) - aSlope * (p2.x + p3.x)) / (2 * (bSlope - aSlope));
            var y = -(x - (p1.x + p2.x) / 2) / aSlope + (p1.y + p2.y) / 2;
            centroid = createVector(x, y);
            radius = centroid.dist(p1);
        }
    }
    
    return new Circle(radius, centroid);
}

function midpoint(A, B) {
    AB = p5.Vector.sub(B, A);
    M = p5.Vector.add(A, AB.mult(0.5));
    return M;
}

function cot(x) {
    return 1 / tan(x);
}

function hAB(A, B, theta) {
    AB = p5.Vector.sub(B, A);
    xAB = AB.mag() / 2.0;
    return xAB * cot(theta / 2.0);
}

function perpUnitVec(A, B) {
    AB = p5.Vector.sub(B, A);
    AB_perp = AB.rotate(HALF_PI);
    AB_perp.normalize();
    return AB_perp;
}

// MAP
var FourCornersMap = function() {
    this.display_markers = false;
    this.scale = 1.0;
    this.position = createVector(0, 0);
    this.background_img = loadImage("assets/four_corners_map.jpg");
    this.tinker_tanner = loadImage("assets/tinker_tanner.png");
    this.width = 1200;
    this.height = 1800;
    this.map_cursor = new MapCursor();
    this.compass = new TrifoilCompass(LOCATIONS['compass']);
    this.mouse_over = false;
    this.gold_marker = new LocationMarker(COLORS['gold'], LOCATIONS['tarbean']);
    this.platinum_marker = new LocationMarker(COLORS['platinum'], LOCATIONS['ralien']);
    this.cobalt_marker = new LocationMarker(COLORS['cobalt'],  LOCATIONS['khershaen']);

    this.location_markers = {
        "gold": this.gold_marker,
        "platinum": this.platinum_marker,
        "cobalt": this.cobalt_marker,
    };

    this.needle_orientations = {};
}

FourCornersMap.prototype.getNeedleOrientations = function() {
    return this.needle_orientations;
}

FourCornersMap.prototype.resize  = function() {
    this.scale = windowHeight / this.height;
    resizeCanvas(this.width * this.scale, this.height * this.scale);
}

FourCornersMap.prototype.getCompass  = function() {
    return this.compass;
}

FourCornersMap.prototype.getLocationMarkers  = function() {
    return this.location_markers;
}

FourCornersMap.prototype.updateMapCursor = function() {
    map_mouse_x = mouseX / this.scale - this.position.x;
    map_mouse_y = mouseY / this.scale - this.position.y;

    map_mouse_position = createVector(map_mouse_x, map_mouse_y);
    
    if (
        map_mouse_position.x <= this.width &&
        map_mouse_position.x >= 0 &&
        map_mouse_position.y <= this.height &&
        map_mouse_position.y >= 0){
        noCursor();
        this.map_cursor.set_position(map_mouse_position);
        this.mouse_over = true;
    }
    else {
        this.mouse_over = false;
        cursor();
    }
}

FourCornersMap.prototype.display = function() {
    this.updateMapCursor();
    map_mouse_position = this.map_cursor.position;

    push();
    scale(this.scale);
    // this.position.x = (windowWidth - this.width * this.scale) / (2.0);
    translate(this.position.x, this.position.y);
    image(this.background_img, 0, 0);

    // Get needle orientations, mapped by location marker
    location_markers = this.getLocationMarkers();
    this.needle_orientations = _.mapValues(location_markers, function(location_marker) {
        return getDirectionAngle(map_mouse_position, location_marker.position);
    });

    // Set the compass needles to the computed orientations
    compass = this.getCompass();
    _.forOwn(this.needle_orientations, function(needle_orientation, needle_key){
        compass.setNeedleOrientation(needle_orientation, needle_key);
    });

    // Display
    compass.display();

    if (this.display_markers == false){
        _.each(location_markers, function(location_marker){
            location_marker.display();
        });
    }
    
    this.map_cursor.display();
    push();
    translate(this.map_cursor.position.x, this.map_cursor.position.y);
    scale(0.5);
    imageMode(CENTER);
    image(this.tinker_tanner, 0, -50);
    pop();

    if (DEBUG) {
        g_pos = location_markers['gold'].position;
        g_angle = this.needle_orientations['gold'];
        p_pos = location_markers['platinum'].position;
        p_angle = this.needle_orientations['platinum'];
        c_pos = location_markers['cobalt'].position;
        c_angle = this.needle_orientations['cobalt'];

        h_gp = get_estimation(g_pos, p_pos, g_angle, p_angle);
        h_pc = get_estimation(p_pos, c_pos, p_angle, c_angle);
        h_cg = get_estimation(c_pos, g_pos, c_angle, g_angle);

        c_gp = circleFrom3Points(g_pos, p_pos, h_gp);
        c_pc = circleFrom3Points(p_pos, c_pos, h_pc);
        c_cg = circleFrom3Points(c_pos, g_pos, h_cg);

        estimated_pt = calculateThreeCircleIntersection(c_gp, c_pc, c_cg);
        if (estimated_pt != null) {
            estimated_marker = new LocationMarker(color('white'), estimated_pt);
            estimated_marker.display();
        }

        // c_gp.display();
        // c_pc.display();
        // c_cg.display();
    }

    pop();
}

FourCornersMap.prototype.displayDebug = function() {

}

function get_estimation(a_pos, b_pos, a_angle, b_angle) {
    ab_angle = getSignedAngleBetweenTwoHeadings(a_angle, b_angle);

    hMag = hAB(a_pos, b_pos, ab_angle);
    hVec = perpUnitVec(a_pos, b_pos);
    mgp = midpoint(a_pos, b_pos);
    h = p5.Vector.add(mgp, hVec.setMag(hMag));

    return h;
}

var Circle = function(radius, centroid) {
    this.radius = radius;
    this.centroid = centroid;
}

Circle.prototype.display = function() {
    push();
    ellipseMode(CENTER);
    noFill();
    stroke(color('black'));
    strokeWeight(3);
    ellipse(this.centroid.x, this.centroid.y, 2 * this.radius);
    pop();
};

// COMPASS
var TrifoilCompass = function(position) {
    this.position = position.copy();
    this.radius = 115;
    this.compass_img = loadImage("assets/compass.png");
    this.north_marker_img = loadImage("assets/north.png");
    this.compass_heading = 0;
    iron_needle = new Needle(0.95 * this.radius, 15, COLORS['iron']);
    gold_needle = new Needle(0.95 * this.radius, 15, COLORS['gold']);
    platinum_needle = new Needle(0.85 * this.radius, 10, COLORS['platinum']);
    cobalt_needle = new Needle(0.75 * this.radius, 5, COLORS['cobalt']);

    this.north_marker_radius = 1.53 * this.radius;

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


    // Draw the compass background
    push();
    rotate(this.compass_heading);
    imageMode(CENTER);
    image(this.compass_img, 0, 0);  // Draw image using CENTER mode
    pop();


    // Draw the north marker at the orientation
    push();
    // No image rotation, as the N must always be up
    north_placement = createVector(0, -this.north_marker_radius, 0);
    north_placement.rotate(this.compass_heading);
    imageMode(CENTER);
    image(this.north_marker_img, north_placement.x, north_placement.y);
    pop();


    // Draw compass needles
    push();
    rotate(this.compass_heading);
    for (var needle_key in this.needles) {
        if (this.needles.hasOwnProperty(needle_key)) {
            needle = this.needles[needle_key];
            needle.display();
        }
    }
    pop();


    // Draw the needle "pivot cover"
    push();
    ellipseMode(CENTER);
    fill(color('white'));
    stroke(color('black'));
    strokeWeight(3);
    ellipse(0, 0, 40);
    pop();

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
    this.position = createVector(0, 0);
}

MapCursor.prototype.display = function() {
    // Update
    this.radius = 10;

    // Draw
    push();
    ellipseMode(CENTER); 
    noFill();
    stroke(color('black'));
    strokeWeight(4);
    ellipse(this.position.x, this.position.y, 2*this.radius);
    pop();
}

MapCursor.prototype.set_position = function(position) {
    this.position = position.copy();
}

// LOCATION MARKER
var LocationMarker = function(marker_color, position) {
    this.color = marker_color;
    this.position = position;
}

LocationMarker.prototype.display = function() {
    // Update
    this.radius = 10;

    // Draw
    push();
    ellipseMode(CENTER); 
    stroke(color('black'));
    strokeWeight(3);
    fill(this.color);
    ellipse(this.position.x, this.position.y, 2*this.radius);
    ellipse(this.position.x, this.position.y, 4);
    pop();
}
