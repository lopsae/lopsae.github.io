"use strict";

let animScale = 2;

// Ruler and Compass
let rac;
rac = rac ?? {};

// Container for prototype functions
rac.protoFunctions = {};


// Draws using p5js canvas
rac.Drawer = function RacDrawer() {
  this.enabled = true;
};

rac.defaultDrawer = new rac.Drawer();

rac.Drawer.Routine = function RacDrawerRoutine(classObj, drawElement) {
  this.classObj = classObj;
  this.drawElement = drawElement
};

rac.Drawer.routines = [];

rac.protoFunctions.draw = function(style = null){
  rac.defaultDrawer.drawElement(this, style);
  return this;
};

// Adds a routine for the given class. The `drawElement` function will be
// called passing the element to be drawn as `this`.
rac.Drawer.setupDrawFunction = function(classObj, drawElement) {
  let routine = new rac.Drawer.Routine(classObj, drawElement);
  rac.Drawer.routines.push(routine);
  classObj.prototype.draw = rac.protoFunctions.draw;
};

rac.Drawer.prototype.drawElement = function(element, style = null) {
  let routine = rac.Drawer.routines
    .find(routine => element instanceof routine.classObj);
  if (routine === undefined) {
    console.trace(`Cannot draw element - constructorName:${element.constructor.name}`);
    throw rac.Error.invalidObjectToDraw;
  }

  if (style === null) {
    routine.drawElement.call(element);
  } else {
    push();
    style.apply();
    routine.drawElement.call(element);
    pop();
  }
};


rac.stack = [];

rac.stack.peek = function() {
  return rac.stack[rac.stack.length - 1];
}

rac.protoFunctions.push = function() {
  rac.stack.push(this);
  return this;
}

rac.protoFunctions.pop = function() {
  return rac.stack.pop();
}

rac.protoFunctions.peek = function() {
  return rac.stack.peek();
}

rac.currentShape = null;
rac.currentComposite = null;

rac.popComposite = function() {
  let composite = rac.currentComposite;
  rac.currentComposite = null;
  return composite;
}

rac.protoFunctions.attachToShape = function() {
  if (rac.currentShape === null) {
    rac.currentShape = new rac.Shape();
  }

  this.attachTo(rac.currentShape);
  return this;
}

rac.protoFunctions.popShape = function() {
  let shape = rac.currentShape;
  rac.currentShape = null;
  return shape;
}

rac.protoFunctions.popShapeToComposite = function() {
  let shape = this.popShape();
  shape.attachToComposite();
  return this;
}

rac.protoFunctions.attachToComposite = function() {
  if (rac.currentComposite === null) {
    rac.currentComposite = new rac.Composite();
  }

  this.attachTo(rac.currentComposite);
  return this;
}

rac.protoFunctions.popComposite = function() {
  return rac.popComposite();
}

rac.protoFunctions.attachTo = function(someComposite) {
  if (someComposite instanceof rac.Composite) {
    someComposite.add(this);
    return this;
  }

  if (someComposite instanceof rac.Shape) {
    someComposite.addOutline(this);
    return this;
  }

  console.trace(`Cannot attachTo composite - constructorName:${someComposite.constructor.name}`);
  throw rac.Error.invalidObjectToConvert;
};

rac.setupProtoFunctions = function(classObj) {
  classObj.prototype.push                = rac.protoFunctions.push;
  classObj.prototype.pop                 = rac.protoFunctions.pop;
  classObj.prototype.peek                = rac.protoFunctions.peek;
  classObj.prototype.attachTo            = rac.protoFunctions.attachTo;
  classObj.prototype.attachToShape       = rac.protoFunctions.attachToShape;
  classObj.prototype.popShape            = rac.protoFunctions.popShape;
  classObj.prototype.popShapeToComposite = rac.protoFunctions.popShapeToComposite;
  classObj.prototype.attachToComposite   = rac.protoFunctions.attachToComposite;
  classObj.prototype.popComposite        = rac.protoFunctions.popComposite;
}


// Used to determine equality between measures for some operations, like
// calculating the slope of a segment. Calues too close can result in odd
// calculations. When checking for equality:
// x is not equal to x+equalityThreshold
// x is equal to x+equalityThreshold/2
rac.equalityThreshold = 0.001;


rac.Error = {
  invalidParameterCombination: "Invalid parameter combination",
  invalidObjectToConvert: "Invalid object to convert",
  invalidObjectToDraw: "Invalid object to draw"
};


rac.Color = function RacColor(r, g, b, alpha = 1) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
};

rac.Color.prototype.copy = function () {
  return new rac.Color(this.r, this.g, this.b, this.alpha);
};

rac.Color.prototype.fill = function() {
  return new rac.Fill(this);
};

rac.Color.prototype.stroke = function(weight = 1) {
  return new rac.Stroke(this, weight);
};

rac.Color.prototype.applyBackground = function() {
  background(this.r * 255, this.g * 255, this.b * 255);
};

rac.Color.prototype.applyFill = function() {
  fill(this.r * 255, this.g * 255, this.b * 255, this.alpha * 255);
};

rac.Color.black   = new rac.Color(0, 0, 0);
rac.Color.red     = new rac.Color(1, 0, 0);
rac.Color.green   = new rac.Color(0, 1, 0);
rac.Color.blue    = new rac.Color(0, 0, 1);
rac.Color.yellow  = new rac.Color(1, 1, 0);
rac.Color.magenta = new rac.Color(1, 0, 1);
rac.Color.cyan    = new rac.Color(0, 1, 1);
rac.Color.white   = new rac.Color(1, 1, 1);


rac.Stroke = class Stroke {

  constructor(color = null, weight = 1) {
    this.color = color;
    this.weight = weight;
  }

  copy() {
    let colorCopy = null;
    if (this.color !== null) {
      colorCopy = this.color.copy();
    }
    return new rac.Stroke(colorCopy, this.weight);
  }

  withAlpha(alpha) {
    let copy = this.copy();
    copy.color.alpha = alpha;
    return copy;
  }

  withAlphaRatio(ratio) {
    let copy = this.copy();
    copy.color.alpha = this.color.alpha * ratio;
    return copy;
  }

  withWeight(weight) {
    let copy = this.copy();
    copy.weight = weight;
    return copy;
  }

  apply() {
    if (this.color === null) {
      noStroke();
      return;
    }

    stroke(
      this.color.r * 255,
      this.color.g * 255,
      this.color.b * 255,
      this.color.alpha * 255);
    strokeWeight(this.weight);
  }

  styleWithFill(fill) {
    return new rac.Style(this, fill);
  }

}

rac.Stroke.no = new rac.Stroke(null);


rac.Fill = function RacFill(color = null) {
  this.color = color;
}

rac.Fill.prototype.apply = function() {
  if (this.color === null) {
    noFill();
    return;
  }

  this.color.applyFill();
};


rac.Style = function RacStyle(stroke = null, fill = null) {
  this.stroke = stroke;
  this.fill = fill;
}

rac.Style.prototype.apply = function() {
  if (this.stroke !== null) {
    this.stroke.apply();
  }
  if (this.fill !== null) {
    this.fill.apply();
  }
};


rac.Angle = function RacAngle(turn) {
  this.set(turn);
};

rac.Angle.from = function(something) {
  if (something instanceof rac.Angle) {
    return something;
  }
  if (typeof something === "number") {
    return new rac.Angle(something);
  }
  if (something instanceof rac.Segment) {
    return something.angle();
  }

  console.trace(`Cannot convert to rac.Angle - constructorName:${something.constructor.name}`);
  throw rac.Error.invalidObjectToConvert;
}

rac.Angle.fromRadians = function(radians) {
  return new rac.Angle(radians / TWO_PI);
};

rac.Angle.fromPoint = function(point) {
  return rac.Angle.fromRadians(Math.atan2(point.y, point.x));
};

rac.Angle.fromSegment = function(segment) {
  return segment.start.angleToPoint(segment.end);
};

rac.Angle.prototype.set = function(turn) {
  this.turn = turn % 1;
  if (this.turn < 0) {
    this.turn = (this.turn + 1) % 1;
  }
  return this;
};

rac.Angle.prototype.add = function(other) {
  if (other instanceof rac.Angle) {
    return new rac.Angle(this.turn + other.turn);
  }

  return new rac.Angle(this.turn + other);
};

rac.Angle.prototype.substract = function(other) {
  if (other instanceof rac.Angle) {
    return new rac.Angle(this.turn - other.turn);
  }

  return new rac.Angle(this.turn - other);
}

rac.Angle.prototype.mult = function(factor) {
  return new rac.Angle(this.turn * factor);
};

rac.Angle.prototype.inverse = function() {
  return this.add(rac.Angle.inverse);
};

rac.Angle.prototype.negative = function() {
  return new rac.Angle(-this.turn);
};

rac.Angle.prototype.perpendicular = function(clockwise = true) {
  return clockwise
    ? this.add(rac.Angle.quarter)
    : this.add(rac.Angle.quarter.negative())

};

rac.Angle.prototype.distance = function(other, clockwise = true) {
  let offset = other.add(this.negative());
  return clockwise
    ? offset
    : offset.negative();
};

rac.Angle.prototype.radians = function() {
  return this.turn * TWO_PI;
};

rac.Angle.zero =    new rac.Angle(0.0);
rac.Angle.square =  new rac.Angle(1/4);
rac.Angle.inverse = new rac.Angle(1/2);

rac.Angle.half =    new rac.Angle(1/2);
rac.Angle.quarter = new rac.Angle(1/4);
rac.Angle.eighth =  new rac.Angle(1/8);

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


rac.Point = class Point{

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  vertex() {
    vertex(this.x, this.y);
    return this;
  }

}

rac.Drawer.setupDrawFunction(rac.Point, function() {
  point(this.x, this.y);
});

rac.setupProtoFunctions(rac.Point);

rac.Point.mouse = function() {
  return new rac.Point(mouseX, mouseY);
}

rac.Point.prototype.withX = function(newX) {
  return new rac.Point(newX, this.y);
};

rac.Point.prototype.withY = function(newY) {
  return new rac.Point(this.x, newY);
};

rac.Point.prototype.add = function(other, y = undefined) {
  if (other instanceof rac.Point && y === undefined) {
    return new rac.Point(
    this.x + other.x,
    this.y + other.y);
  }

  if (typeof other === "number" && typeof y === "number") {
    return new rac.Point(
      this.x + other,
      this.y + y);
  }

  throw rac.Error.invalidParameterCombination;
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

rac.Point.prototype.angleToPoint = function(other) {
  let offset = other.add(this.negative());
  return rac.Angle.fromPoint(offset);
};

rac.Point.prototype.distanceToPoint = function(other) {
  let x = Math.pow((other.x - this.x), 2);
  let y = Math.pow((other.y - this.y), 2);
  return Math.sqrt(x+y);
};

rac.Point.prototype.pointPerpendicular = function(clockwise = true) {
  return clockwise
    ? new rac.Point(-this.y, this.x)
    : new rac.Point(this.y, -this.x);
};

rac.Point.prototype.pointToAngle = function(someAngle, distance) {
  let angle = rac.Angle.from(someAngle);
  let distanceX = distance * Math.cos(angle.radians());
  let distanceY = distance * Math.sin(angle.radians());
  return new rac.Point(this.x + distanceX, this.y + distanceY);
};

rac.Point.prototype.segmentToPoint = function(point) {
  return new rac.Segment(this, point);
};

rac.Point.prototype.segmentToAngle = function(someAngle, distance) {
  let end = this.pointToAngle(someAngle, distance);
  return new rac.Segment(this, end);
};

rac.Point.prototype.segmentPerpendicularToSegment = function(segment) {
  let projectedPoint = segment.projectedPoint(this);
  return this.segmentToPoint(projectedPoint);
};

rac.Point.prototype.arc = function(radius, start = rac.Angle.zero, end = start, clockwise = true) {
  return new rac.Arc(this, radius, start, end, clockwise);
};


rac.Segment = class Segment {

  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  copy() {
    return new rac.Segment(this.start, this.end);
  }

  vertex() {
    this.start.vertex();
    this.end.vertex();
    return this;
  }

  withAngleAdd(someAngle) {
    let newAngle = this.angle().add(someAngle);
    let newEnd = this.start.pointToAngle(newAngle, this.length());
    return new rac.Segment(this.start, newEnd);
  }

  projectedPoint(point) {
    let perpendicular = this.angle().perpendicular();
    return point.segmentToAngle(perpendicular, this.length())
      .intersectingPointWithSegment(this);
  }

  // Returns the length of a segment from `start` to `point` being
  // projected in the segment. The returned length may be negative if the
  // projected point falls behind `start`.
  lengthToProjectedPoint(point) {
    let projected = this.projectedPoint(point);
    let segment = this.start.segmentToPoint(projected);

    if (segment.length() < rac.equalityThreshold) {
      return 0;
    }

    let angleDiff = this.angle().substract(segment.angle());
    if (angleDiff.turn <= 1/4 || angleDiff.turn > 3/4) {
      return segment.length();
    } else {
      return - segment.length();
    }
  }

}

rac.Drawer.setupDrawFunction(rac.Segment, function() {
  line(this.start.x, this.start.y,
       this.end.x,   this.end.y);
});

rac.setupProtoFunctions(rac.Segment);

rac.Segment.prototype.withStart = function(newStart) {
  return new rac.Segment(newStart, this.end);
};

rac.Segment.prototype.withEnd = function(newEnd) {
  return new rac.Segment(this.start, newEnd);
};

rac.Segment.prototype.withLength = function(newLength) {
  let newEnd = this.start.pointToAngle(this.angle(), newLength);
  return new rac.Segment(this.start, newEnd);
};

rac.Segment.prototype.middle = function() {
  return new rac.Point(
    this.start.x + (this.end.x - this.start.x) /2,
    this.start.y + (this.end.y - this.start.y) /2);
};

rac.Segment.prototype.length = function() {
  return this.start.distanceToPoint(this.end);
};

rac.Segment.prototype.angle = function() {
  return rac.Angle.fromSegment(this);
};

// Returns the slope of the segment, or `null` if the segment is part of a
// vertical line.
rac.Segment.prototype.slope = function() {
  let dx = this.end.x - this.start.x;
  if (Math.abs(dx) < rac.equalityThreshold) {
    return null;
  }

  let dy = this.end.y - this.start.y;
  return dy / dx;
};

// Returns the y-intercept, or `null` if the segment is part of a
// vertical line.
rac.Segment.prototype.yIntercept = function() {
  let slope = this.slope();
  if (slope === null) {
    return null;
  }
  // y = mx + b
  // y - mx = b
  return this.start.y - slope * this.start.x;
};

rac.Segment.prototype.reverseAngle = function() {
  return rac.Angle.fromSegment(this).inverse();
};

rac.Segment.prototype.reverse = function() {
  return new rac.Segment(this.end, this.start);
};

rac.Segment.prototype.translateToStart = function(newStart) {
  let offset = newStart.add(this.start.negative());
  return new rac.Segment(this.start.add(offset), this.end.add(offset));
};

// Returns the intersecting point of `this` and `other`. Both segments are
// considered lines without endpoints.
rac.Segment.prototype.intersectingPointWithSegment = function(other) {
  // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
  let a = this.slope();
  let b = other.slope();
  if (a === b) {
    // Parallel lines, no intersection
    return null;
  }

  let c = this.yIntercept();
  let d = other.yIntercept();

  if (a === null) { return this.start.withY(d); }
  if (b === null) { return other.start.withY(c); }

  let x = (d - c) / (a - b);
  let y = a * x + c;
  return new rac.Point(x, y);
};

rac.Segment.prototype.arc = function(
  someAngleEnd = this.angle(),
  clockwise = true)
{
  let end = rac.Angle.from(someAngleEnd);
  return new rac.Arc(
    this.start, this.length(),
    rac.Angle.fromSegment(this), end,
    clockwise);
};

rac.Segment.prototype.pointAtLength = function(length) {
  return this.start.pointToAngle(this.angle(), length);
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

rac.Segment.prototype.segmentPerpendicular = function(clockwise = true) {
  let offset = this.start.add(this.end.negative());
  let newEnd = this.end.add(offset.pointPerpendicular(clockwise));
  return this.end.segmentToPoint(newEnd);
};

rac.Segment.prototype.relativeArc = function(someAngle, clockwise = true) {
  let angle = rac.Angle.from(someAngle);
  let arcStart = this.angle();
  let arcEnd;
  if (clockwise) {
    arcEnd = arcStart.add(angle);
  } else {
    arcEnd = arcStart.add(angle.negative());
  }
  return new rac.Arc(
    this.start, this.length(),
    arcStart, arcEnd,
    clockwise);
};

rac.Segment.prototype.segmentToRelativeAngle = function(
  relativeAngle, distance, clockwise = true)
{
  let angle = clockwise
    ? this.reverseAngle().add(relativeAngle)
    : this.reverseAngle().add(relativeAngle.negative());
  return this.end.segmentToAngle(angle, distance);
};

rac.Segment.prototype.oppositeWithHyp = function(hypotenuse, clockwise = true) {
  // cos = ady / hyp
  // acos can error if hypotenuse is smaller that length
  let radians = Math.acos(this.length() / hypotenuse);
  let angle = rac.Angle.fromRadians(radians);

  let hypSegment = this.reverse()
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


rac.Arc = function RacArc(
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

rac.Drawer.setupDrawFunction(rac.Arc, function() {
  let start = this.start;
  let end = this.end;
  if (!this.clockwise) {
    start = this.end;
    end = this.start;
  }

  arc(this.center.x, this.center.y,
      this.radius * 2, this.radius * 2,
      start.radians(), end.radians());
});

rac.setupProtoFunctions(rac.Arc);

rac.Arc.prototype.vertex = function() {
  let arcLength = this.arcLength();
  let beziersPerTurn = 5;
  let divisions = arcLength.turn == 0
    ? beziersPerTurn
    : Math.ceil(arcLength.turn * beziersPerTurn);

  this.divideToBeziers(divisions).vertex();
  return this;
};

rac.Arc.prototype.reverse = function() {
  return new rac.Arc(
    this.center, this.radius,
    this.end, this.start,
    !this.clockwise);
};

rac.Arc.prototype.withCenter = function(newCenter) {
  let copy = this.copy();
  copy.center = newCenter;
  return copy;
}

rac.Arc.prototype.withRadius = function(newRadius) {
  let copy = this.copy();
  copy.radius = newRadius;
  return copy;
}

rac.Arc.prototype.withEndTowardsPoint = function(point) {
  let copy = this.copy();
  copy.end = this.center.angleToPoint(point);
  return copy;
};

rac.Arc.prototype.containsAngle = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  if (this.start.turn == this.end.turn) {
    return true;
  }

  if (this.clockwise) {
    let offset = angle.add(this.start.negative());
    let endOffset = this.end.add(this.start.negative());
    return offset.turn <= endOffset.turn;
  } else {
    let offset = angle.add(this.end.negative());
    let startOffset = this.start.add(this.end.negative());
    return offset.turn <= startOffset.turn;
  }
};

// Returns chord regardless of actual intersection. Both arcs are
// considered complete circle arcs.
rac.Arc.prototype.intersectionChord = function(other) {
  // https://mathworld.wolfram.com/Circle-CircleIntersection.html
  // R=this, r=other

  let distance = this.center.distanceToPoint(other.center);
  if (distance == 0) { return null; }

  // distanceToChord = (d^2 - r^2 + R^2) / (d*2)
  let distanceToChord = (
      Math.pow(distance, 2)
    - Math.pow(other.radius, 2)
    + Math.pow(this.radius, 2)
    ) / (distance * 2);

  // a = 1/d sqrt|(-d+r-R)(-d-r+R)(-d+r+R)(d+r+R)
  let chordLength = (1 / distance) * Math.sqrt(
      (-distance + other.radius - this.radius)
    * (-distance - other.radius + this.radius)
    * (-distance + other.radius + this.radius)
    * (distance + other.radius + this.radius));

  let rayToChord = this.center.segmentToPoint(other.center)
    .withLength(distanceToChord);
  return rayToChord.segmentPerpendicular(this.clockwise)
    .withLength(chordLength/2)
    .reverse()
    .segmentToRatio(2);
};

// Returns the section of `this` that is inside `other`.
// `other` is aways considered as a complete circle.
rac.Arc.prototype.intersectionArc = function(other) {
  let chord = this.intersectionChord(other);
  if (chord === null) { return null; }

  let startAngle = this.center.angleToPoint(chord.start);
  let endAngle = this.center.angleToPoint(chord.end);

  if (!this.containsAngle(startAngle)) {
    startAngle = this.start;
  }
  if (!this.containsAngle(endAngle)) {
    endAngle = this.end;
  }

  return new rac.Arc(
    this.center, this.radius,
    startAngle,
    endAngle,
    this.clockwise);
};

// Returns only intersecting points.
rac.Arc.prototype.intersectingPointsWithArc = function(other) {
  let chord = this.intersectionChord(other);
  if (chord === null) { return []; }

  let intersections = [chord.start, chord.end].filter(function(item) {
    return this.containsAngle(this.center.segmentToPoint(item))
      && other.containsAngle(other.center.segmentToPoint(item));
  }, this);

  return intersections;
};

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
  for (let count = 1; count <= segmentCount; count++) {
    let currentAngle = lastRay.angle().add(partAngle);
    let currentRay = this.center.segmentToAngle(currentAngle, this.radius);
    segments.push(new rac.Segment(lastRay.end, currentRay.end));
    lastRay = currentRay;
  }

  return segments;
}

rac.Arc.prototype.divideToBeziers = function(bezierCount) {
  let arcLength = this.arcLength();
  let partTurn = arcLength.turn == 0
    ? 1 / bezierCount
    : arcLength.turn / bezierCount;

  // length of tangent:
  // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
  let parsPerTurn = 1 / partTurn;
  let tangent = this.radius * (4/3) * Math.tan(PI/(parsPerTurn*2));

  let beziers = [];
  let segments = this.divideToSegments(bezierCount);
  segments.forEach(function(item) {
    let startRay = new rac.Segment(this.center, item.start);
    let endRay = new rac.Segment(this.center, item.end);

    let startAnchor = startRay
      .segmentToRelativeAngle(rac.Angle.square, tangent, !this.clockwise)
      .end;
    let endAnchor = endRay
      .segmentToRelativeAngle(rac.Angle.square, tangent, this.clockwise)
      .end;

    beziers.push(new rac.Bezier(
      startRay.end, startAnchor,
      endAnchor, endRay.end));
  }, this);

  return new rac.Composite(beziers);
};


rac.Bezier = function RacBezier(start, startAnchor, endAnchor, end) {
  this.start = start;
  this.startAnchor = startAnchor;
  this.endAnchor = endAnchor;
  this.end = end;
};

rac.Drawer.setupDrawFunction(rac.Bezier, function() {
  bezier(
    this.start.x, this.start.y,
    this.startAnchor.x, this.startAnchor.y,
    this.endAnchor.x, this.endAnchor.y,
    this.end.x, this.end.y);
});

rac.setupProtoFunctions(rac.Bezier);

rac.Bezier.prototype.drawAnchors = function(style = undefined) {
  push();
  if (style !== undefined) {
    style.apply();
  }
  this.start.segmentToPoint(this.startAnchor).draw();
  this.end.segmentToPoint(this.endAnchor).draw();
  pop();
};

rac.Bezier.prototype.vertex = function() {
  this.start.vertex()
  bezierVertex(
    this.startAnchor.x, this.startAnchor.y,
    this.endAnchor.x, this.endAnchor.y,
    this.end.x, this.end.y);
};

rac.Bezier.prototype.reverse = function() {
  return new rac.Bezier(
    this.end, this.endAnchor,
    this.startAnchor, this.start);
};


// Contains a sequence of shapes which can be drawn or vertex together
rac.Composite = function RacComposite(sequence = []) {
  this.sequence = sequence;
};

rac.Drawer.setupDrawFunction(rac.Composite, function() {
  this.sequence.forEach(item => item.draw());
});

rac.setupProtoFunctions(rac.Composite);

rac.Composite.prototype.vertex = function() {
  this.sequence.forEach(item => item.vertex());
};

rac.Composite.prototype.isNotEmpty = function() {
  return this.sequence.length != 0;
};

rac.Composite.prototype.add = function(element) {
  if (element instanceof Array) {
    element.forEach(item => this.sequence.push(item));
    return
  }
  this.sequence.push(element);
};

rac.Composite.prototype.reverse = function() {
  let reversed = this.sequence.map(item => item.reverse())
    .reverse();
  return new rac.Composite(reversed);
};


rac.Shape = function RacShape() {
  this.outline = new rac.Composite();
  this.contour = new rac.Composite();
}

rac.Drawer.setupDrawFunction(rac.Shape, function () {
  beginShape();
  this.outline.vertex();

  if (this.contour.isNotEmpty()) {
    beginContour();
    this.contour.vertex();
    endContour();
  }
  endShape();
});

rac.setupProtoFunctions(rac.Shape);

rac.Shape.prototype.vertex = function() {
  this.outline.vertex();
  this.contour.vertex();
};

rac.Shape.prototype.addOutline = function(element) {
  this.outline.add(element);
};

rac.Shape.prototype.addContour = function(element) {
  this.contour.add(element);
};


rac.ControlSelection = class ControlSelection{
  constructor(control) {
    this.control = control;
    // Copy of the control anchor, so that the control can move tied to
    // the drawing, while the interaction range remains fixed.
    this.anchorCopy = control.anchorSegment.copy();
    // Segment from the captured pointer position to the contro center,
    // used to attach the control to the point where interaction started.
    this.pointerOffset = rac.Point.mouse().segmentToPoint(control.center());
  }
}

rac.controls = [];
rac.controlSelection = null;
rac.pointerStyle = null;

// Draws controls and the visuals of control selection
rac.drawControls = function() {
  // Pointer position
  let pointerCenter = rac.Point.mouse();
  let pointerRadius = 12;
  if (mouseIsPressed) {
    if (rac.controlSelection !== null) {
      pointerRadius = 5;
    } else {
      pointerRadius = 10;
    }
  }

  if (mouseIsPressed) {
    pointerCenter.arc(pointerRadius).draw(rac.pointerStyle);
  }

  rac.controls.forEach(item => item.draw());
  // Pointer to anchor elements
  if (rac.controlSelection !== null && mouseIsPressed) {
    // Copied anchor segment
    let anchorCopy = rac.controlSelection.anchorCopy;
    anchorCopy.draw(rac.pointerStyle);

    // Ray from pointer to control shadow center
    let draggedShadowCenter = rac.controlSelection.pointerOffset
      .translateToStart(pointerCenter)
      .end;

    // Control shadow center, attached to pointer
    draggedShadowCenter.arc(2)
      .draw(rac.pointerStyle);

    let constrainedLength = anchorCopy
      .lengthToProjectedPoint(draggedShadowCenter);
    if (constrainedLength < 0) {
      constrainedLength = 0;
    }
    if (constrainedLength > anchorCopy.length()) {
      constrainedLength = anchorCopy.length()
    }

    let constrainedAnchorCenter = anchorCopy
      .withLength(constrainedLength)
      .end;

    // Control shadow at anchor
    constrainedAnchorCenter.arc(rac.Control.radius)
      .draw(rac.pointerStyle);

    let constrainedShadowCenter = draggedShadowCenter
      .segmentPerpendicularToSegment(anchorCopy)
      // reverse and translated to constraint to anchor
      .reverse()
      .translateToStart(constrainedAnchorCenter)
      // anchor to control shadow center
      .draw(rac.pointerStyle)
      .end;

    // Control shadow, dragged and constrained to anchor
    constrainedShadowCenter.arc(rac.Control.radius / 2)
      .draw(rac.pointerStyle);

    // Segment to dragged shadow center
    constrainedShadowCenter.segmentToPoint(draggedShadowCenter)
      .segmentToRatio(2/3)
      .draw(rac.pointerStyle);

  }

}


rac.Control = function RacControl() {
  this.style = null;
  this.value = 0;
  this.anchorSegment = null;
  this.isSelected = false;
}

rac.Control.radius = 22/animScale;


rac.Control.prototype.center = function() {
  if (this.anchorSegment === null) {
    return null;
  }

  return this.anchorSegment.withLength(this.value).end;
};

rac.Control.prototype.draw = function() {
  let radius = rac.Control.radius;

  let angle = this.anchorSegment.angle();
  let center = this.center();

  this.anchorSegment.draw(this.style);

  center.arc(radius)
    .attachToShape()
    .popShapeToComposite();

  // Positive arrow
  if (this.value <= this.anchorSegment.length() - rac.equalityThreshold) {
    let posArc = center.arc(radius * 1.5, angle.add(-1/16), angle.add(1/16));
  let posPoint = posArc.startPoint()
    .segmentToAngle(angle.add(1/8), radius)
    .intersectingPointWithSegment(
      posArc.endPoint().segmentToAngle(angle.add(-1/8), radius));

  posPoint.segmentToPoint(posArc.startPoint())
    .attachToShape();

  posArc.attachToShape()
    .endPoint().segmentToPoint(posPoint)
    .attachToShape()
    .popShapeToComposite();
  }

  // Negative arrow
  if (this.value >= rac.equalityThreshold) {
    let negArc = center.arc(radius * 1.5, angle.inverse().add(-1/16), angle.inverse().add(1/16));
  let negPoint = negArc.startPoint()
    .segmentToAngle(angle.add(1/8), radius)
    .intersectingPointWithSegment(
      negArc.endPoint().segmentToAngle(angle.add(-1/8), radius));

  negPoint.segmentToPoint(negArc.startPoint())
    .attachToShape();

  negArc.attachToShape()
    .endPoint().segmentToPoint(negPoint)
    .attachToShape()
    .popShapeToComposite();
  }

  rac.popComposite().draw(this.style);

  // Selection
  if (this.isSelected) {
    center.arc(radius * 1.5).draw(rac.pointerStyle);
  }
};


rac.Animator = class RacAnimator {

  constructor() {
    this.steps = [];
    this.stepIndex = null;
    this.startValue = null;
    this.startTime = null;
    this.isLoop = false;
  }

  totalDuration() {
    let duration = 0;
    this.steps.forEach(item => duration += item.duration);
    return duration;
  }

  // Animate with the current time. Time is expected in milliseconds.
  // Returns `true` if there is still animations to perform, otherwise
  // returns `false`.
  animate(currentTime) {
    // TODO: delete logs
    if (this.stepIndex === null) {
      // first animate is no-op, time is recorded
      this.stepIndex = 0;
      this.startTime = currentTime;
      let currentStep = this.steps[this.stepIndex];
      this.startValue = currentStep.currentValue();
      return true;
    }

    if (this.stepIndex >= this.steps.length) {
      // All steps have been animated
      return false;
    }

    let currentStep = this.steps[this.stepIndex];
    let timeDelta = currentTime - this.startTime;

    while (true) {
      // Apply animations for current time
      this.applyStep(currentStep, timeDelta, this.startValue);

      if (timeDelta < currentStep.duration) {
        // Still in current step
        return true;
      }

      // Move to next step, loop around
      this.stepIndex += 1;
      if (this.isLoop) {
        this.stepIndex %= this.steps.length;
      }
      if (this.stepIndex >= this.steps.length) {
        // All steps have been animated
        return false;
      }

      // Update start time for next step
      let overTime = timeDelta - currentStep.duration;
      this.startTime = currentTime - overTime;

      // Update start value for next step
      currentStep = this.steps[this.stepIndex];
      timeDelta = currentTime - this.startTime;
      this.startValue = currentStep.currentValue();
    }
  }

  // step - current step being animated
  // timeDelta - time elapsed since start of step
  // startValue - initial value for the control in the step
  applyStep(step, timeDelta, startValue) {
    if (step.control === null) {
      return;
    }

    // Over duration only applies end value
    if (timeDelta >= step.duration) {
      step.control.value = step.endValue;
      return;
    }

    let durationRatio = timeDelta / step.duration;
    let valueTotalDelta = step.endValue - this.startValue;
    // https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
    // f(x) = (t^a)/(t^a+(1-t)^a)
    let a = 2;
    let t = durationRatio;
    let easeRatio = Math.pow(t,a) / (Math.pow(t,a) + Math.pow(1-t,a));
    let newValue = startValue + (easeRatio * valueTotalDelta);
    step.control.value = newValue;
  }

  addControlStep(duration, control, value) {
    let newStep = new rac.AnimatorStep(duration, control, value);
    this.steps.push(newStep);
  }

  addPauseStep(duration) {
    let newStep = new rac.AnimatorStep(duration);
    this.steps.push(newStep);
  }

}


rac.AnimatorStep = class RacAnimatorStep {

  constructor(duration, control = null, endValue = null) {
    this.duration = duration;
    this.control = control;
    this.endValue = endValue;
  }


  currentValue() {
    if (this.control === null) {
      return null;
    }
    return this.control.value;
  }

}



//=========================================================================
//=========================================================================
//=========================================================================


function mousePressed(event) {
  let pointerCenter = new rac.Point.mouse();

  let selected = rac.controls.find(function(item) {
    let controlCenter = item.center();
    if (controlCenter === null) { return false; }
    if (controlCenter.distanceToPoint(pointerCenter) <= rac.Control.radius) {
      return true;
    }
    return false;
  });

  if (selected !== undefined) {
    rac.controlSelection = new rac.ControlSelection(selected);
    selected.isSelected = true;
  }

  redraw();
}

function mouseDragged(event) {
  if (rac.controlSelection !== null) {
    let pointerCenter = new rac.Point.mouse();
    let anchorCopy = rac.controlSelection.anchorCopy;

    let controlShadowCenter = rac.controlSelection.pointerOffset
      .translateToStart(pointerCenter)
      .end;

    let newValue = anchorCopy
      .lengthToProjectedPoint(controlShadowCenter);

    if (newValue < 0) {
      newValue = 0;
    }

    if (newValue > anchorCopy.length()) {
      newValue = anchorCopy.length()
    }

    rac.controlSelection.control.value = newValue;
  }
  redraw();
}

function mouseReleased(event) {
  if (rac.controlSelection !== null) {
    rac.controlSelection.control.isSelected = false;
    rac.controlSelection = null;
  }
  redraw();
  // TODO: to stop animations
  noLoop();
}

let radiusStart = 120/animScale;
let slopeStart = 240/animScale;
let concentricStart = 17/animScale;

let radiusControl = new rac.Control();
radiusControl.value = radiusStart;
radiusControl.segmentLength = 300/animScale;
rac.controls.push(radiusControl);

let slopeControl = new rac.Control();
slopeControl.value = slopeStart;
slopeControl.segmentLength = 300/animScale;
rac.controls.push(slopeControl);

let concentricControl = new rac.Control();
concentricControl.value = concentricStart;
concentricControl.segmentLength = 300/animScale;
rac.controls.push(concentricControl);


let animator = new rac.Animator();
animator.addControlStep(1500, radiusControl, 60/animScale);
animator.addPauseStep(200);
animator.addControlStep(1500, slopeControl, 80/animScale);
animator.addPauseStep(200);
animator.addControlStep(1500, radiusControl, 180/animScale);
animator.addPauseStep(200);
animator.addControlStep(1500, concentricControl, 67/animScale);
animator.addPauseStep(200);
animator.addControlStep(1500, concentricControl, 7/animScale);
animator.addPauseStep(200);
animator.addControlStep(1500, slopeControl, slopeStart);
animator.addPauseStep(200);
animator.addControlStep(1500, radiusControl, radiusStart);
animator.addPauseStep(200);
animator.addControlStep(1500, concentricControl, concentricStart); // back to original
animator.isLoop = false;

let animFramerate = 20;

function setup() {
  // createCanvas(windowWidth, windowHeight);
  let canvasSide = 800/animScale;
  createCanvas(canvasSide, canvasSide);
  // TODO: looping for animation
  // noLoop();
  frameRate(animFramerate);
  noStroke();
  noFill();
  console.log(`Total animation duration: ${animator.totalDuration()}`);
  createLoop({
    duration: animator.totalDuration()/1000,
    gif:{
      download: true
    }});
}


function draw() {
  clear();

  let millisByFramerate = frameCount*1000/animFramerate;
  console.log(`millisByFramerate:${millisByFramerate}`);
  let hasMoreAnimations = animator.animate(millisByFramerate);
  if (!hasMoreAnimations) {
    console.log(`Animations done!`);
    noLoop();
  }

  // Color schemes
  let colors = {
    light: {
      background:  new rac.Color(0.9, 0.9, 0.9), // whiteish
      stroke:      new rac.Color(0.7, 0.3, 0.3, 0.5), // rose pink,
      marker:      new rac.Color(0.9, 0.5, 0.5, 0.3), // rose pink
      tear:        new rac.Color( .2,  .2,  .2,  .3), // blackish
      controlFill: new rac.Color( .2,  .2,  .2,  .8), // blackish
      pointer:     new rac.Color( .1,  .1,  .1,  .6), // blackish
      highlight:   new rac.Color(1.0, 0.0, 1.0, 0.8) // magenta
    },
    dark: {
      background:  new rac.Color( .1,  .1,  .1), // blackish
      stroke:      new rac.Color( .5,  .1,  .1,  .5), // red,
      marker:      new rac.Color( .7,  .3,  .3,  .3), // rose pink
      tear:        new rac.Color( .8,  .8,  .8,  .9), // whiteish
      controlFill: new rac.Color( .8,  .8,  .8, 1.0), // whiteish
      pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
      highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
    }
  };

  let colorScheme = colors.dark;
  colorScheme.background.applyBackground();

  let mainStroke = colorScheme.stroke.stroke(2);
  mainStroke.apply();

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  rac.pointerStyle = colorScheme.pointer.stroke(3);


  // Center of the tear circle
  let center = new rac.Point(width/2, height/2);
  // Radius of tear main arc
  let radius = radiusControl.value;
  // Width of the concentric circles
  let concentricMin = 3
  let concentricWidth = concentricMin + concentricControl.value;
  // Radius of the main slope arcs
  let slopeRadius = slopeControl.value;

  // Last step is draw if its width would be greater that zero
  let concentricCount = Math.ceil(radius/concentricWidth) -1;
  let smallestRadius = concentricCount > 0
    ? radius - concentricCount * concentricWidth
    : radius;

  // Tear main circle
  center.arc(radius).draw()


  // Radius control
  radiusControl.style = controlStyle;
  radiusControl.anchorSegment = center
    // Tear center to control anchor
    .segmentToAngle(rac.Angle.s, radius + rac.Control.radius * 3)
    .draw()
    // Control anchor
    .end.segmentToAngle(rac.Angle.e, radiusControl.segmentLength);

  radiusControl.center()
    .segmentToPoint(center.pointToAngle(rac.Angle.e, radius))
    .draw();


  // Concentric control
  concentricControl.style = controlStyle
  concentricControl.anchorSegment = center
    // Tear center to control anchor
    .pointToAngle(rac.Angle.s, radius)
    .segmentToAngle(rac.Angle.e, radius + rac.Control.radius * 2)
    .draw()
    .end.segmentToAngle(rac.Angle.n, concentricMin)
    .draw()
    .end.segmentToAngle(rac.Angle.n, concentricControl.segmentLength);

  center.pointToAngle(rac.Angle.s, radius - concentricWidth)
    .segmentToPoint(concentricControl.center())
    .draw();


  // Main concentric arcs
  for(let index = 1; index <= concentricCount; index++) {
    let concentricRadius = radius - concentricWidth * index;
    center.arc(concentricRadius).draw();
  }


  // Slope control
  slopeControl.style = controlStyle;
  slopeControl.anchorSegment = center
    // Tear center to control anchor
    .segmentToAngle(rac.Angle.s, radius + rac.Control.radius * 6)
    .draw()
    // Control anchor
    .end.segmentToAngle(rac.Angle.w, slopeControl.segmentLength);

  slopeControl.center()
    .segmentToPoint(center.pointToAngle(rac.Angle.w, slopeRadius))
    .draw();


  // Slope centers orbit arc
  center.segmentToAngle(rac.Angle.wsw, radius + slopeRadius).draw()
    .arc(rac.Angle.ese).draw();

  // Slope centers left column
  let columnCenterLeft = center.addX(-slopeRadius);
  center.segmentToPoint(columnCenterLeft).draw()
    .segmentExtending(radius/5).draw();
  columnCenterLeft.arc(radius).draw();

  // Slope centers right column
  let columnCenterRight = center.addX(slopeRadius);
  center.segmentToPoint(columnCenterRight).draw()
    .segmentExtending(radius/5).draw();
  columnCenterRight.arc(radius).draw();

  // Ray to slope center left
  let columnLeft = center.segmentToPoint(columnCenterLeft)
    .oppositeWithHyp(radius + slopeRadius, false).draw();
  let slopeCenterLeft = columnLeft.end;
  columnLeft.segmentExtending(radius/5).draw();

  center.segmentToPoint(slopeCenterLeft).draw()
    .segmentExtending(radius/5).draw();

  // Ray to slope center right
  let columnRight = center.segmentToPoint(columnCenterRight)
    .oppositeWithHyp(radius + slopeRadius, true).draw();
  let slopeCenterRight = columnRight.end;
  columnRight.segmentExtending(radius/5).draw();

  center.segmentToPoint(slopeCenterRight).draw()
    .segmentExtending(radius/5).draw();

  // Slope arcs
  let slopeArcLeft = slopeCenterLeft
    .segmentToPoint(center).withLength(slopeRadius)
    .withAngleAdd(1/16)
    .draw()
    .arc(-1/32, false).draw();
  let slopeArcRight = slopeCenterRight
    .segmentToPoint(center).withLength(slopeRadius)
    .withAngleAdd(-1/16)
    .draw()
    .arc(1/2 + 1/32, true).draw();

  // Slope concentric arcs
  for(let index = 1; index <= concentricCount +1; index++) {
    let concentricRadius = slopeRadius + concentricWidth * index;
    let concentricStroke = mainStroke;


    if (index == concentricCount +1) {
      // Color fading for extra concentric arc
      let distancePastCenter = concentricRadius - (slopeRadius + radius);
      let colorRatio = (concentricWidth - distancePastCenter) / concentricWidth;
      concentricStroke = mainStroke.withAlphaRatio(colorRatio);
    }

    slopeArcLeft.withRadius(concentricRadius)
      .draw(concentricStroke);
    slopeArcRight.withRadius(concentricRadius)
      .draw(concentricStroke);
  }

  // Tear shape
  let marker = new rac.Stroke(colorScheme.marker, 3);
  for(let index = 0; index <= concentricCount; index++) {
    let centerConcentricRadius = radius - concentricWidth * index;
    let slopeConcentricRadius = slopeRadius + concentricWidth * index;

    center.arc(centerConcentricRadius,
      center.angleToPoint(slopeCenterLeft),
      center.angleToPoint(slopeCenterRight),
      false)
      .draw(marker);

    let slopeLeft = slopeCenterLeft.arc(slopeConcentricRadius,
      slopeCenterLeft.angleToPoint(center),
      rac.Angle.e,
      false);
    let slopeRight = slopeCenterRight.arc(slopeConcentricRadius,
      slopeCenterRight.angleToPoint(center),
      rac.Angle.w,
      true);
    let slopeIntersection = slopeLeft
      .intersectingPointsWithArc(slopeRight)[0]
      ?? slopeCenterLeft.segmentToPoint(slopeCenterRight).middle();

    slopeLeft.withEndTowardsPoint(slopeIntersection).draw(marker);
    slopeRight.withEndTowardsPoint(slopeIntersection).draw(marker);
  }

  // Filled tear shape
  // for(let index = 0; index <= concentricCount; index++) {
  let shapeStyle = new rac.Style(rac.Stroke.no, colorScheme.tear.fill());
  let tearShape = new rac.Shape();
  for(let index = 0; index <= concentricCount; index++) {
    let centerConcentricRadius = radius - concentricWidth * index;
    let slopeConcentricRadius = slopeRadius + concentricWidth * index;

    let slopeLeft = slopeCenterLeft.arc(slopeConcentricRadius,
      slopeCenterLeft.angleToPoint(center),
      rac.Angle.e,
      false);
    let slopeRight = slopeCenterRight.arc(slopeConcentricRadius,
      slopeCenterRight.angleToPoint(center),
      rac.Angle.w,
      true);
    let slopeIntersection = slopeLeft
      .intersectingPointsWithArc(slopeRight)[0]
      ?? slopeCenterLeft.segmentToPoint(slopeCenterRight).middle();

    let composite = new rac.Composite();

    slopeRight.withEndTowardsPoint(slopeIntersection)
      .reverse()
      .attachTo(composite);

    center.arc(centerConcentricRadius,
      center.angleToPoint(slopeCenterRight),
      center.angleToPoint(slopeCenterLeft),
      true)
      .attachTo(composite);

    slopeLeft.withEndTowardsPoint(slopeIntersection)
      .attachTo(composite);

    if (index % 2 == 0) {
      composite.attachTo(tearShape);

      if (index == concentricCount) {
        tearShape.draw(shapeStyle);
      }
    } else {
      composite.reverse()
        .attachTo(tearShape.contour);
      tearShape.draw(shapeStyle);
      tearShape = new rac.Shape();
    }

  }


  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${frameCount},${millis()}`);
}