"use strict";

// Ruler and Compass
var rac = rac || {};

rac.Stroke = function(r, g, b, alpha = 1, weight = 1) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
  this.weight = weight;
}

rac.Stroke.prototype.copy = function() {
  return new rac.Stroke(this.r, this.g, this.b, this.alpha, this.weight);
}

rac.Stroke.prototype.withAlpha = function(alpha) {
  var copy = this.copy();
  copy.alpha = alpha;
  return copy;
}

rac.Stroke.prototype.withWeight = function(weight) {
  var copy = this.copy();
  copy.weight = weight;
  return copy;
}

rac.Stroke.prototype.apply = function() {
  stroke(this.r * 255, this.g * 255, this.b * 255, this.alpha * 255);
  strokeWeight(this.weight);
}


rac.Angle = function(value) {
  this.set(value);
}

rac.Angle.fromRadians = function(radians) {
  return new rac.Angle(radians / TWO_PI);
}

rac.Angle.fromPoint = function(point) {
  return rac.Angle.fromRadians(Math.atan2(point.y, point.x));
}

rac.Angle.fromSegment = function(segment) {
  var point = segment.end.add(segment.start.negative());
  return rac.Angle.fromPoint(point);
}

rac.Angle.prototype.set = function(value) {
  this.value = value % 1;
  if (this.value < 0) {
    this.value = (this.value + 1) % 1;
  }
  return this;
}

rac.Angle.prototype.add = function(other) {
  if (other instanceof rac.Angle) {
    return new rac.Angle(this.value + other.value);  
  }
  
  return new rac.Angle(this.value + other);
}

rac.Angle.prototype.inverse = function() {
  return this.add(rac.Angle.inverse);
}

rac.Angle.prototype.negative = function() {
  return new rac.Angle(-this.value);
}

rac.Angle.prototype.radians = function() {
  return this.value * TWO_PI;
}

rac.Angle.zero = new rac.Angle(0.0);
rac.Angle.square = new rac.Angle(1/4);
rac.Angle.inverse = new rac.Angle(1/2);

rac.Angle.eight = new rac.Angle(1/8);
rac.Angle.quarter = new rac.Angle(1/4);
rac.Angle.half = new rac.Angle(1/2);

rac.Angle.n = new rac.Angle(3/4);
rac.Angle.e = new rac.Angle(0/4);
rac.Angle.s = new rac.Angle(1/4);
rac.Angle.w = new rac.Angle(2/4);

rac.Angle.ne = rac.Angle.n.add(1/8);
rac.Angle.se = rac.Angle.e.add(1/8);
rac.Angle.sw = rac.Angle.s.add(1/8);
rac.Angle.nw = rac.Angle.w.add(1/8);

rac.Angle.nne = rac.Angle.ne.add(-1/16);
rac.Angle.ene = rac.Angle.ne.add(+1/16);

rac.Angle.ese = rac.Angle.se.add(-1/16);
rac.Angle.sse = rac.Angle.se.add(+1/16);

rac.Angle.ssw = rac.Angle.sw.add(-1/16);
rac.Angle.wsw = rac.Angle.sw.add(+1/16);

rac.Angle.wnw = rac.Angle.nw.add(-1/16);
rac.Angle.nnw = rac.Angle.nw.add(+1/16);

rac.Angle.right = rac.Angle.e;
rac.Angle.down = rac.Angle.s;
rac.Angle.left = rac.Angle.w;
rac.Angle.up = rac.Angle.n;


rac.Point = function(x, y) {
  this.x = x;
  this.y = y;
};

rac.Point.prototype.draw = function(stroke = undefined) {
  push();
  if (stroke !== undefined) {
    stroke.apply();
  }
  point(this.x, this.y);
  pop();
  return this;
}

rac.Point.prototype.add = function(other) {
  return new rac.Point(
    this.x + other.x,
    this.y + other.y);
}

rac.Point.prototype.addX = function(x) {
  return new rac.Point(
    this.x + x,
    this.y);
}

rac.Point.prototype.addY = function(y) {
  return new rac.Point(
    this.x,
    this.y + y);
}


rac.Point.prototype.negative = function() {
  return new rac.Point(-this.x, -this.y);
}

rac.Point.prototype.distance = function(other) {
  var x = Math.pow((other.x - this.x), 2);
  var y = Math.pow((other.y - this.y), 2);
  return Math.sqrt(x+y);
}

rac.Point.prototype.segmentToPoint = function(point) {
  return new rac.Segment(this, point);
}

rac.Point.prototype.segmentToAngle = function(angle, distance) {
  var distanceX = distance * Math.cos(angle.radians());
  var distanceY = distance * Math.sin(angle.radians());
  let end = new rac.Point(this.x + distanceX, this.y + distanceY);
  return new rac.Segment(this, end);
}

rac.Point.prototype.arc = function(radius, start = rac.Angle.zero, end = start, clockwise = true) {
  return new rac.Arc(this, radius, start, end, clockwise);
}


rac.Segment = function(start, end) {
  this.start = start;
  this.end = end;
}

rac.Segment.prototype.draw = function(stroke = undefined) {
  push();
  if (stroke !== undefined) {
    stroke.apply();
  }
  line(this.start.x, this.start.y,
       this.end.x,   this.end.y);
  pop();
  return this;
}

rac.Segment.prototype.length = function() {
  return this.start.distance(this.end);
}

rac.Segment.prototype.angle = function() {
  return rac.Angle.fromSegment(this);
}

rac.Segment.prototype.reverseAngle = function() {
  return rac.Angle.fromSegment(this).inverse();
}

rac.Segment.prototype.reverse = function() {
  return new rac.Segment(this.end, this.start);
}

rac.Segment.prototype.arc = function(
  end = rac.Angle.fromSegment(this),
  clockwise = true)
{
  return new rac.Arc(
    this.start, this.length(),
    rac.Angle.fromSegment(this), end,
    clockwise);
}

rac.Segment.prototype.segmentExtending = function(distance) {
  return this.end.segmentToAngle(this.angle(), distance);
}

rac.Segment.prototype.relativeArc = function(relativeAngle, clockwise = true) {
  var arcStart = this.angle();
  var arcEnd;
  if (clockwise) {
    arcEnd = arcStart.add(relativeAngle);
  } else {
    arcEnd = arcStart.add(relativeAngle.negative());
  }
  return new rac.Arc(
    this.start, this.length(),
    arcStart, arcEnd,
    clockwise);
}

rac.Segment.prototype.segmentToRelativeAngle = function(
  relativeAngle, distance, clockwise = true)
{
  var angle;
  if (clockwise) {
    angle = this.reverseAngle().add(relativeAngle);
  } else {
    angle = this.reverseAngle().add(relativeAngle.negative());
  }
  return this.end.segmentToAngle(angle, distance);
}

rac.Segment.prototype.perpendicularWithHyp = function(hypotenuse, clockwise = true) {
  // cos = ady / hyp
  // acos can error if hypotenuse is smaller that length
  var radians = Math.acos(this.length() / hypotenuse);
  var angle = rac.Angle.fromRadians(radians);

  var hypSegment = this.reverse()
    .segmentToRelativeAngle(angle, hypotenuse, !clockwise);
  return this.end.segmentToPoint(hypSegment.end);
}


rac.Arc = function(center, radius, start = rac.Angle.zero, end = start, clockwise = true) {
  this.center = center;
  this.radius = radius;
  this.start = start;
  this.end = end;
  this.clockwise = clockwise;
}

rac.Arc.prototype.copy = function() {
  return new rac.Arc(
    this.center,
    this.radius,
    this.start,
    this.end,
    this.clockwise);
}

rac.Arc.prototype.draw = function(stroke = undefined) {
  push();
  if (stroke !== undefined) {
    stroke.apply();
  }
  
  var start = this.start;
  var end = this.end;
  if (!this.clockwise) {
    start = this.end;
    end = this.start;
  }

  arc(this.center.x, this.center.y,
      this.radius * 2, this.radius * 2,
      start.radians(), end.radians());
  pop();
  return this;
}

rac.Arc.prototype.withRadius = function(radius) {
  var copy = this.copy();
  copy.radius = radius;
  return copy;
}



function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#111111");
  noLoop();
  noStroke();
  noFill();
}


function draw() {
  var mainStroke = new rac.Stroke(1, 0, 0);
  mainStroke.apply();
  
  // RAC testing
  var highlight = new rac.Stroke(0, 1, 1, 0.8, 5);
  
  // Center of the tear circle
  var center = new rac.Point(windowWidth/2, windowHeight*2/3);
  // Radius of tear main arc
  var radius = 100;
  // Width of the concentric circles
  var concentricWidth = 20;
  
  // Last step is draw if its width would be greater that zero
  var concentricCount = Math.ceil(radius/concentricWidth) -1;
  var smallestRadius = concentricCount > 0
    ? radius - concentricCount * concentricWidth
    : radius;
  
  // Tear main radius & arc
  center.segmentToAngle(rac.Angle.sse, radius).draw()
    .arc().draw();
  
  // Main concentric arcs
  for(var index = 1; index <= concentricCount; index++) {
    var concentricRadius = radius - concentricWidth * index;
    center.arc(concentricRadius).draw();
  }
  
  // Slope centers orbit arc
  center.segmentToAngle(rac.Angle.wsw, radius * 3).draw()
    .arc(rac.Angle.ese).draw();
  center.segmentToAngle(rac.Angle.up, radius*2).draw()
    .end.arc(radius).draw();
  
  // Slope centers left column
  var columnCenterLeft = center.addX(-radius*2);
  center.segmentToPoint(columnCenterLeft).draw()
    .segmentExtending(radius/5).draw();
  columnCenterLeft.arc(radius, rac.Angle.n, rac.Angle.nw, true).draw();
  
  // Slope centers right column
  var columnCenterRight = center.addX(radius*2);
  center.segmentToPoint(columnCenterRight).draw()
    .segmentExtending(radius/5).draw();
  columnCenterRight.arc(radius, rac.Angle.n, rac.Angle.ne, false).draw();
  
  // Ray to slope center left
  var columnLeft = center.segmentToPoint(columnCenterLeft)
    .perpendicularWithHyp(radius*3, false).draw();
  var slopeCenterLeft = columnLeft.end;
  columnLeft.segmentExtending(radius/5).draw();
  center.segmentToPoint(slopeCenterLeft).draw()
    .segmentExtending(radius/5).draw();
  
  // Ray to slope center right
  var columnRight = center.segmentToPoint(columnCenterRight)
    .perpendicularWithHyp(radius*3, true).draw();
  var slopeCenterRight = columnRight.end;
  columnRight.segmentExtending(radius/5).draw();
  center.segmentToPoint(slopeCenterRight).draw()
    .segmentExtending(radius/5).draw();
  
  // Slope arcs
  slopeCenterLeft
    .segmentToAngle(rac.Angle.s.add(1/32), radius*2).draw()
    .relativeArc(new rac.Angle(3/8), false).draw();
  slopeCenterRight
    .segmentToAngle(rac.Angle.s.add(-1/32), radius*2).draw()
    .relativeArc(new rac.Angle(3/8), true).draw();
  
  // Slope concentric arcs
  for(var index = 1; index <= concentricCount; index++) {
    var concentricRadius = radius*2 + concentricWidth * index;
    
    slopeCenterLeft.arc(concentricRadius,
      rac.Angle.s.add(-1/32), rac.Angle.e.add(-1/32), false).draw();
    slopeCenterRight.arc(concentricRadius,
      rac.Angle.s.add(1/32), rac.Angle.w.add(1/32), true).draw();
  }

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}
