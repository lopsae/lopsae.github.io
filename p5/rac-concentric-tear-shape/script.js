"use strict";

// Ruler and Compass
var rac = rac || {};


rac.Color = function(r, g, b, alpha = 1) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
};

rac.Color.prototype.copy = function () {
  return new rac.Color(this.r, this.g, this.b, this.alpha);
};


rac.Color.prototype.applyBackground = function() {
  background(this.r * 255, this.g * 255, this.b * 255);
};


rac.Stroke = function(color, weight = 1) {
  this.color = color;
  this.weight = weight;
};

rac.Stroke.prototype.copy = function() {
  return new rac.Stroke(this.color.copy(), this.weight);
};

rac.Stroke.prototype.withAlpha = function(alpha) {
  var copy = this.copy();
  copy.color.alpha = alpha;
  return copy;
};

rac.Stroke.prototype.withWeight = function(weight) {
  var copy = this.copy();
  copy.weight = weight;
  return copy;
};

rac.Stroke.prototype.apply = function() {
  stroke(
    this.color.r * 255,
    this.color.g * 255,
    this.color.b * 255,
    this.color.alpha * 255);
  strokeWeight(this.weight);
};


rac.Angle = function(turn) {
  this.set(turn);
};

rac.Angle.fromRadians = function(radians) {
  return new rac.Angle(radians / TWO_PI);
};

rac.Angle.fromPoint = function(point) {
  return rac.Angle.fromRadians(Math.atan2(point.y, point.x));
};

rac.Angle.fromSegment = function(segment) {
  var point = segment.end.add(segment.start.negative());
  return rac.Angle.fromPoint(point);
};

rac.Angle.prototype.set = function(turn) {
  this.turn = turn % 1;
  if (this.turn < 0) {
    this.turn = (this.turn + 1) % 1;
  }
  // TODO: delete once unused
  this.value = turn;
  return this;
};

rac.Angle.prototype.add = function(other) {
  if (other instanceof rac.Angle) {
    return new rac.Angle(this.value + other.value);
  }

  return new rac.Angle(this.value + other);
};

rac.Angle.prototype.mult = function(factor) {
  return new rac.Angle(this.value * factor);
};

rac.Angle.prototype.inverse = function() {
  return this.add(rac.Angle.inverse);
};

rac.Angle.prototype.negative = function() {
  return new rac.Angle(-this.value);
};

rac.Angle.prototype.distance = function(other, clockwise = true) {
  let offset = other.add(this.negative());
  return clockwise
    ? offset
    : offset.negative();
};

rac.Angle.prototype.radians = function() {
  return this.value * TWO_PI;
};

rac.Angle.zero = new rac.Angle(0.0);
rac.Angle.square = new rac.Angle(1/4);
rac.Angle.inverse = new rac.Angle(1/2);

rac.Angle.half = new rac.Angle(1/2);
rac.Angle.quarter = new rac.Angle(1/4);
rac.Angle.eight = new rac.Angle(1/8);


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
};

rac.Point.prototype.vertex = function() {
  vertex(this.x, this.y);
  return this;
};

rac.Point.prototype.add = function(other) {
  return new rac.Point(
    this.x + other.x,
    this.y + other.y);
};

rac.Point.prototype.addX = function(x) {
  return new rac.Point(
    this.x + x,
    this.y);
};

rac.Point.prototype.addY = function(y) {
  return new rac.Point(
    this.x,
    this.y + y);
};


rac.Point.prototype.negative = function() {
  return new rac.Point(-this.x, -this.y);
};

rac.Point.prototype.distance = function(other) {
  var x = Math.pow((other.x - this.x), 2);
  var y = Math.pow((other.y - this.y), 2);
  return Math.sqrt(x+y);
};

rac.Point.prototype.segmentToPoint = function(point) {
  return new rac.Segment(this, point);
};

rac.Point.prototype.segmentToAngle = function(angle, distance) {
  var distanceX = distance * Math.cos(angle.radians());
  var distanceY = distance * Math.sin(angle.radians());
  let end = new rac.Point(this.x + distanceX, this.y + distanceY);
  return new rac.Segment(this, end);
};

rac.Point.prototype.arc = function(radius, start = rac.Angle.zero, end = start, clockwise = true) {
  return new rac.Arc(this, radius, start, end, clockwise);
};


rac.Segment = function(start, end) {
  this.start = start;
  this.end = end;
};

rac.Segment.prototype.draw = function(stroke = undefined) {
  push();
  if (stroke !== undefined) {
    stroke.apply();
  }
  line(this.start.x, this.start.y,
       this.end.x,   this.end.y);
  pop();
  return this;
};

rac.Segment.prototype.middle = function() {
  return new rac.Point(
    this.start.x + (this.end.x - this.start.x) /2,
    this.start.y + (this.end.y - this.start.y) /2);
};

rac.Segment.prototype.length = function() {
  return this.start.distance(this.end);
};

rac.Segment.prototype.angle = function() {
  return rac.Angle.fromSegment(this);
};

rac.Segment.prototype.reverseAngle = function() {
  return rac.Angle.fromSegment(this).inverse();
};

rac.Segment.prototype.reverse = function() {
  return new rac.Segment(this.end, this.start);
};

rac.Segment.prototype.arc = function(
  end = rac.Angle.fromSegment(this),
  clockwise = true)
{
  return new rac.Arc(
    this.start, this.length(),
    rac.Angle.fromSegment(this), end,
    clockwise);
};

rac.Segment.prototype.segmentExtending = function(distance) {
  return this.end.segmentToAngle(this.angle(), distance);
};

rac.Segment.prototype.segmentToMiddle = function() {
  return new rac.Segment(this.start, this.middle());
};

rac.Segment.prototype.segmentToRatio = function(ratio) {
  return this.start.segmentToAngle(this.angle(), this.length() * ratio);
};

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
};

rac.Segment.prototype.segmentToRelativeAngle = function(
  relativeAngle, distance, clockwise = true)
{
  var angle = clockwise
    ? this.reverseAngle().add(relativeAngle)
    : this.reverseAngle().add(relativeAngle.negative());
  return this.end.segmentToAngle(angle, distance);
};

rac.Segment.prototype.oppositeWithHyp = function(hypotenuse, clockwise = true) {
  // cos = ady / hyp
  // acos can error if hypotenuse is smaller that length
  var radians = Math.acos(this.length() / hypotenuse);
  var angle = rac.Angle.fromRadians(radians);

  var hypSegment = this.reverse()
    .segmentToRelativeAngle(angle, hypotenuse, !clockwise);
  return this.end.segmentToPoint(hypSegment.end);
};

rac.Segment.prototype.bisector = function(length, clockwise = true) {
  let angle = clockwise
    ? this.angle().add(rac.Angle.square)
    : this.angle().add(rac.Angle.square.negative());
  return this.middle().segmentToAngle(angle, length);
};

rac.Segment.prototype.bezierCentralAnchor = function(distance, clockwise = true) {
  let bisector = this.bisector(distance, clockwise);
  return new rac.Bezier(
    this.start, bisector.end,
    bisector.end, this.end);
};


rac.Arc = function(
  center, radius,
  start = rac.Angle.zero,
  end = start,
  clockwise = true)
{
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

rac.Arc.prototype.arcLength = function() {
  return this.start.distance(this.end, this.clockwise);
};

rac.Arc.prototype.startPoint = function() {
  return this.center.segmentToAngle(this.start, this.radius).end;
};

rac.Arc.prototype.endPoint = function() {
  return this.center.segmentToAngle(this.end, this.radius).end;
};

rac.Arc.prototype.startSegment = function() {
  return new rac.Segment(this.center, this.startPoint());
};

rac.Arc.prototype.endSegment = function() {
  return new rac.Segment(this.endPoint(), this.center);
};

rac.Arc.prototype.divideToSegments = function(segmentCount) {
  let arcLength = this.arcLength();
  let partTurn = arcLength.turn == 0
    ? 1 / segmentCount
    : arcLength.turn / segmentCount;

  let partAngle = new rac.Angle(partTurn);
  if (!this.clockwise) {
    partAngle = partAngle.negative();
  }

  let lastRay = this.startSegment();
  let segments = [];
  for (var count = 1; count <= segmentCount; count++) {
    let currentAngle = lastRay.angle().add(partAngle);
    let currentRay = this.center.segmentToAngle(currentAngle, this.radius);
    segments.push(new rac.Segment(lastRay.end, currentRay.end));
    lastRay = currentRay;
  }

  return segments;
}


rac.Bezier = function(start, startAnchor, endAnchor, end) {
  this.start = start;
  this.startAnchor = startAnchor;
  this.endAnchor = endAnchor;
  this.end = end;
};

rac.Bezier.prototype.draw = function(stroke = undefined) {
  push();
  if (stroke !== undefined) {
    stroke.apply();
  }
  bezier(
    this.start.x, this.start.y,
    this.startAnchor.x, this.startAnchor.y,
    this.endAnchor.x, this.endAnchor.y,
    this.end.x, this.end.y);
  pop();
};



function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
  noFill();
}


function draw() {
  // Color schemes
  let colors = {
    light: {
      background: new rac.Color(0.9, 0.9, 0.9), // whiteish
      stroke:     new rac.Color(0.7, 0.3, 0.3, 0.5), // rose pink,
      highlight:  new rac.Color(1.0, 0.0, 1.0, 0.8), // magenta
      bezier:     new rac.Color(1.0, 0.0, 1.0, 0.4) // magenta
    },
    dark: {
      background: new rac.Color(0.1, 0.1, 0.1), // blackish
      stroke:     new rac.Color(0.9, 0.2, 0.2, 0.5), // red,
      highlight:  new rac.Color(0.0, 1.0, 1.0, 0.8),// cyan
      bezier:     new rac.Color(0.7, 0.3, 0.3, 0.3) // rose pink
    }
  };

  let colorScheme = colors.dark;
  colorScheme.background.applyBackground();

  var mainStroke = new rac.Stroke(colorScheme.stroke, 2);
  mainStroke.apply();

  // Testing highlight
  var highlight = new rac.Stroke(colorScheme.highlight, 5);


  // Center of the tear circle
  var center = new rac.Point(windowWidth/2, windowHeight/2);
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
  center.segmentToAngle(rac.Angle.up, radius)
    .end.arc(radius*2).draw();
  center.segmentToAngle(rac.Angle.up, radius*2).draw()
    .end.arc(radius).draw();

  // Slope centers left column
  var columnCenterLeft = center.addX(-radius*2);
  center.segmentToPoint(columnCenterLeft).draw()
    .segmentExtending(radius/5).draw();
  columnCenterLeft.arc(radius).draw();

  // Slope centers right column
  var columnCenterRight = center.addX(radius*2);
  center.segmentToPoint(columnCenterRight).draw()
    .segmentExtending(radius/5).draw();
  columnCenterRight.arc(radius).draw();

  // Ray to slope center left
  var columnLeft = center.segmentToPoint(columnCenterLeft)
    .oppositeWithHyp(radius*3, false).draw();
  var slopeCenterLeft = columnLeft.end;
  columnLeft.segmentExtending(radius/5).draw();
  center.segmentToPoint(slopeCenterLeft).draw()
    .segmentExtending(radius/5).draw();

  // Ray to slope center right
  var columnRight = center.segmentToPoint(columnCenterRight)
    .oppositeWithHyp(radius*3, true).draw();
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


  // Bezier formation centers
  let bezierStroke = new rac.Stroke(colorScheme.bezier, 7);
  let totalBezierTests = 4;
  let bezierCenters = [];
  for (let index = 0; index < totalBezierTests; index++) {
    let spacing = radius/2;
    let bezierTestsWidth = (radius + spacing)*totalBezierTests - spacing;
    bezierCenters.push(center
      .addX(-bezierTestsWidth/2 + (radius+spacing) * index)
      .addY(radius*2));
  }

  // Manual bezier
  // Tangent for 4 point
  let fourPointTangent = radius * (4/3) * Math.tan(PI/(4*2));
  let manualBezierCenter = bezierCenters[0];
  let manualBezierArcSegment = manualBezierCenter
    .segmentToAngle(rac.Angle.e, radius).draw();
  manualBezierArcSegment.arc(rac.Angle.s, radius).draw();

  let manualBezierStart = manualBezierArcSegment.end;
  let manualBezierStartAnchor = manualBezierStart
    .segmentToAngle(rac.Angle.s, fourPointTangent).draw()
    .end;
  let manualBezierEnd = manualBezierCenter
    .segmentToAngle(rac.Angle.s, radius).draw()
    .end;
  let manualBezierEndAnchor = manualBezierEnd
    .segmentToAngle(rac.Angle.e, fourPointTangent).draw()
    .end;

  push();
  bezierStroke.apply();
  beginShape();
    manualBezierCenter.vertex();
    manualBezierStart.vertex();
    bezierVertex(
      manualBezierStartAnchor.x, manualBezierStartAnchor.y,
      manualBezierEndAnchor.x, manualBezierEndAnchor.y,
      manualBezierEnd.x, manualBezierEnd.y);
    manualBezierEnd.segmentToPoint(manualBezierCenter)
      .middle().vertex();
  endShape();
  pop();


  // Angle distances
  let distanceCenter = bezierCenters[1];
  let distanceOriginAngle = rac.Angle.ese;
  let distanceOriginSegment = distanceCenter
    .segmentToAngle(distanceOriginAngle, radius).draw();

  let distanceTargetAngle = new rac.Angle(1/8+1/32);
  distanceOriginSegment.arc(distanceTargetAngle, radius, true).draw()
    .endSegment().segmentToMiddle().draw();

  distanceOriginSegment.segmentToMiddle()
    .relativeArc(distanceOriginAngle.distance(distanceTargetAngle), false)
    .draw().draw(bezierStroke)
    .endSegment().segmentToMiddle().draw();

  distanceOriginSegment.segmentToRatio(2/3)
    .relativeArc(distanceOriginAngle.distance(distanceTargetAngle).mult(2))
    .draw().draw(bezierStroke)
    .endSegment().segmentToMiddle().draw();


  // Arc of segments
  let segmentArcsCenter = bezierCenters[2];
  segmentArcsCenter
    .segmentToAngle(rac.Angle.s, radius).draw()
    .arc(rac.Angle.e, false).draw()
    .divideToSegments(4).forEach(function(item) {
      item.draw(bezierStroke);
    });

  segmentArcsCenter
    .segmentToAngle(rac.Angle.e, radius*(2/3)).draw()
    .arc(rac.Angle.sse).draw()
    .divideToSegments(3).forEach(function(item) {
      item.draw(bezierStroke);
    });

  // MAGIC
  // Arc of segments
  let segmentsArcRadius = bezierCenters[3]
    .segmentToAngle(rac.Angle.e, radius).draw();
  segmentsArcRadius.arc(rac.Angle.s).draw()
    .divideToSegments(3).forEach(function(item) {
      item.draw(bezierStroke);
    });


  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}