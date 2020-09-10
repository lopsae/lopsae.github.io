"use strict";


// Ruler and Compass - 0.8.x
let rac;
rac = rac ?? {};

// Container for prototype functions
rac.protoFunctions = {};


// Draws using p5js canvas
rac.Drawer = class RacDrawer {

  static Routine = class RacDrawerRoutine {
    constructor (classObj, drawElement) {
      this.classObj = classObj;
      this.drawElement = drawElement
      this.style = null;

      // Options
      this.requiresPushPop = false;
    }
  }

  constructor() {
    this.routines = [];
    this.enabled = true;
  }

  // Adds a routine for the given class. The `drawElement` function will be
  // called passing the element to be drawn as `this`.
  setDrawFunction(classObj, drawElement) {
    let index = this.routines
      .findIndex(routine => routine.classObj === classObj);

    let routine;
    if (index === -1) {
      routine = new rac.Drawer.Routine(classObj, drawElement);
    } else {
      routine = this.routines[index];
      routine.drawElement = drawElement;
      // Delete routine
      this.routine.splice(index, 1);
    }

    this.routines.push(routine);
  }

  setDrawOptions(classObj, options) {
    let routine = this.routines
      .find(routine => routine.classObj === classObj);
    if (routine === undefined) {
      console.log(`Cannot find routine for class - className:${classObj.name}`);
      throw rac.Error.invalidObjectConfiguration
    }

    if (options.requiresPushPop !== undefined) {
      routine.requiresPushPop = options.requiresPushPop;
    }
  }

  setClassStyle(classObj, style) {
    let routine = this.routines
      .find(routine => routine.classObj === classObj);
    if (routine === undefined) {
      console.log(`Cannot find routine for class - className:${classObj.name}`);
      throw rac.Error.invalidObjectConfiguration
    }

    routine.style = style;
  }

  drawElement(element, style = null) {
    let routine = this.routines
      .find(routine => element instanceof routine.classObj);
    if (routine === undefined) {
      console.trace(`Cannot draw element - constructorName:${element.constructor.name}`);
      throw rac.Error.invalidObjectToDraw;
    }

    if (routine.requiresPushPop === true
      || style !== null
      || routine.style !== null)
    {
      push();
      if (routine.style !== null) {
        routine.style.apply();
      }
      if (style !== null) {
        style.apply();
      }
      routine.drawElement.call(element);
      pop();
    } else {
      // No push-pull
      routine.drawElement.call(element);
    }
  }

}

rac.defaultDrawer = new rac.Drawer();


rac.protoFunctions.draw = function(style = null){
  rac.defaultDrawer.drawElement(this, style);
  return this;
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

rac.popShape = function() {
  let shape = rac.currentShape;
  rac.currentShape = null;
  return shape;
}

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
  return rac.popShape();
}

rac.protoFunctions.popShapeToComposite = function() {
  let shape = rac.popShape();
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
  classObj.prototype.draw                = rac.protoFunctions.draw;
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
  invalidObjectConfiguration: "Invalid object configuration",
  invalidObjectToConvert: "Invalid object to convert",
  invalidObjectToDraw: "Invalid object to draw"
};


rac.Color = class RacColor {
  constructor(r, g, b, alpha = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.alpha = alpha;
  }

  copy() {
    return new rac.Color(this.r, this.g, this.b, this.alpha);
  }

  fill() {
  return new rac.Fill(this);
  }

  stroke(weight = 1) {
    return new rac.Stroke(this, weight);
  }

  applyBackground() {
    background(this.r * 255, this.g * 255, this.b * 255);
  }

  applyFill = function() {
    fill(this.r * 255, this.g * 255, this.b * 255, this.alpha * 255);
  }

  withAlpha(alpha) {
    let copy = this.copy();
    copy.alpha = alpha;
    return copy;
  }

  withAlphaRatio(ratio) {
    let copy = this.copy();
    copy.alpha = this.color.alpha * ratio;
    return copy;
  }

}

rac.Color.black   = new rac.Color(0, 0, 0);
rac.Color.red     = new rac.Color(1, 0, 0);
rac.Color.green   = new rac.Color(0, 1, 0);
rac.Color.blue    = new rac.Color(0, 0, 1);
rac.Color.yellow  = new rac.Color(1, 1, 0);
rac.Color.magenta = new rac.Color(1, 0, 1);
rac.Color.cyan    = new rac.Color(0, 1, 1);
rac.Color.white   = new rac.Color(1, 1, 1);


rac.Stroke = class RacStroke {

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

rac.Stroke.none = new rac.Stroke(null);


rac.Fill = class RacFill {

  constructor(color = null) {
    this.color = color;
  }

  apply() {
    if (this.color === null) {
      noFill();
      return;
    }

    this.color.applyFill();
  }

  styleWithStroke(stroke) {
    return new rac.Style(stroke, this);
  }

}

rac.Fill.none = new rac.Fill(null);


rac.Style = class RacStyle {

  constructor(stroke = null, fill = null) {
    this.stroke = stroke;
    this.fill = fill;
  }

  apply() {
    if (this.stroke !== null) {
      this.stroke.apply();
    }
    if (this.fill !== null) {
      this.fill.apply();
    }
  }

  withStroke(stroke) {
    return new rac.Style(stroke, this.fill);
  }

  withFill(fill) {
    return new rac.Style(this.stroke, fill);
  }

}


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

rac.Angle.prototype.add = function(someAngle) {
  let other = rac.Angle.from(someAngle);
  return new rac.Angle(this.turn + other.turn);
};

rac.Angle.prototype.substract = function(someAngle) {
  let other = rac.Angle.from(someAngle);
  return new rac.Angle(this.turn - other.turn);
};

rac.Angle.prototype.sub = function(someAngle) {
  return this.substract(someAngle);
};

// Returns the equivalent to `someAngle` when `this` is considered the
// origin, in the `clockwise` orientation.
rac.Angle.prototype.shift = function(someAngle, clockwise = true) {
  let angle = rac.Angle.from(someAngle);
  return clockwise
    ? this.add(angle)
    : this.sub(angle);
};

// Returns the equivalent of `self` when `someOrigin` is considered the
// origin, in the `clockwise` orientation.
rac.Angle.prototype.shiftToOrigin = function(someOrigin, clockwise) {
  let origin = rac.Angle.from(someOrigin);
  return origin.shift(this, clockwise);
};

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
  return this.shift(rac.Angle.square, clockwise);
};

// Returns an Angle that represents the distance from `this` to `someAngle`
// traveling in the `clockwise` orientation.
rac.Angle.prototype.distance = function(someAngle, clockwise = true) {
  let other = rac.Angle.from(someAngle);
  let distance = other.substract(this);
  return clockwise
    ? distance
    : distance.negative();
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


rac.Point = class RacPoint{

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  vertex() {
    vertex(this.x, this.y);
    return this;
  }

  text(string, format) {
    return new rac.Text(string, format, this);
  }

}


rac.defaultDrawer.setDrawFunction(rac.Point, function() {
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

rac.Point.prototype.segmentToAngleToIntersectionWithSegment = function(someAngle, segment) {
  let unit = this.segmentToAngle(someAngle, 1);
  return unit.segmentToIntersectionWithSegment(segment);
}

rac.Point.prototype.segmentPerpendicularToSegment = function(segment) {
  let projectedPoint = segment.projectedPoint(this);
  return this.segmentToPoint(projectedPoint);
};

rac.Point.prototype.arc = function(radius, start = rac.Angle.zero, end = start, clockwise = true) {
  return new rac.Arc(this, radius, start, end, clockwise);
};


// TODO: could be internal class to text
rac.TextFormat = class RacTextFormat {

  static defaultSize = 15;

  static horizontal = {
    left: "left",
    center: "horizontalCenter",
    right: "right"
  };

  static vertical = {
    top: "top",
    bottom: "bottom",
    center: "verticalCenter",
    baseline: "baseline"
  };

  constructor(horizontal, vertical, angle = rac.Angle.zero, distance = 0, size = rac.TextFormat.defaultSize) {
    this.horizontal = horizontal;
    this.vertical = vertical;
    this.angle = angle;
    this.distance = distance;
    this.size = size;
  }

  apply() {
    let hAlign;
    let hOptions = rac.TextFormat.horizontal;
    switch (this.horizontal) {
      case hOptions.left:   hAlign = LEFT;   break;
      case hOptions.center: hAlign = CENTER; break;
      case hOptions.right:  hAlign = RIGHT;  break;
      default:
        console.trace(`Invalid horizontal configuration - horizontal:${this.horizontal}`);
        throw rac.Error.invalidObjectConfiguration;
    }

    let vAlign;
    let vOptions = rac.TextFormat.vertical;
    switch (this.vertical) {
      case vOptions.top:      vAlign = TOP;      break;
      case vOptions.bottom:   vAlign = BOTTOM;   break;
      case vOptions.center:   vAlign = CENTER;   break;
      case vOptions.baseline: vAlign = BASELINE; break;
      default:
        console.trace(`Invalid vertical configuration - vertical:${this.vertical}`);
        throw rac.Error.invalidObjectConfiguration;
    }

    textAlign(hAlign, vAlign);
    textSize(this.size);
  }

}


rac.Text = class RacText {

  constructor(string, format, point) {
    this.string = string;
    this.point = point;
    this.format = format;
  }

}

rac.defaultDrawer.setDrawFunction(rac.Text, function() {
  let point = this.point;
  if (this.format.distance > 0) {
    point = point.pointToAngle(this.format.angle, this.format.distance);
  }
  this.format.apply();
  text(this.string, point.x, point.y);
});
rac.defaultDrawer.setDrawOptions(rac.Text, {requiresPushPop: true});

rac.setupProtoFunctions(rac.Text);


rac.Segment = class RacSegment {

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

  // Returns `value` clamped to zero and the length of the segment. If
  // `minClamp` or `maxClamp` are provided, these are added to zero or
  // substracted from the length value for the clamp.
  // If the `min/maxClamp` values result in a contradictory range, the
  // returned value will comply with `minClamp`.
  clampToLength(value, minClamp = 0, maxClamp = 0) {
    let clamped = value;
    clamped = Math.min(clamped, this.length() - maxClamp);
    // Comply at least with minClamp
    clamped = Math.max(clamped, minClamp);
    return clamped;
  }

  projectedPoint(point) {
    let perpendicular = this.angle().perpendicular();
    return point.segmentToAngle(perpendicular, this.length())
      .pointAtIntersectionWithSegment(this);
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

  withStartExtended(length) {
    let newStart = this.reverse().nextSegmentWithLength(length).end;
    return new rac.Segment(newStart, this.end);
  }

  withEndExtended(length) {
    let newEnd = this.nextSegmentWithLength(length).end;
    return new rac.Segment(this.start, newEnd);
  }

}

rac.defaultDrawer.setDrawFunction(rac.Segment, function() {
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

rac.Segment.prototype.pointAtBisector = function() {
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


rac.Segment.prototype.pointAtX = function(x) {
  let slope = this.slope();
  if (slope === null) {
    return null;
  }

  let y = slope*x + this.yIntercept();
  return new rac.Point(x, y);
}

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
rac.Segment.prototype.pointAtIntersectionWithSegment = function(other) {
  // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
  let a = this.slope();
  let b = other.slope();
  if (a === b) {
    // Parallel lines, no intersection
    return null;
  }

  let c = this.yIntercept();
  let d = other.yIntercept();

  if (a === null) { return other.pointAtX(this.start.x); }
  if (b === null) { return this.pointAtX(other.start.x); }

  let x = (d - c) / (a - b);
  let y = a * x + c;
  return new rac.Point(x, y);
};

rac.Segment.prototype.pointAtLength = function(length) {
  return this.start.pointToAngle(this.angle(), length);
};

// Returns a new segment from `start` to `pointAtBisector`.
rac.Segment.prototype.segmentToBisector = function() {
  return new rac.Segment(this.start, this.pointAtBisector());
};

// Returns a new segment from `start` to a length determined by
// `ratio*length`.
rac.Segment.prototype.segmentWithRatioOfLength = function(ratio) {
  return this.start.segmentToAngle(this.angle(), this.length() * ratio);
};

// Returns a new segment from `end` with the given `length` with the same
// angle as `self`.
rac.Segment.prototype.nextSegmentWithLength = function(length) {
  return this.end.segmentToAngle(this.angle(), length);
};

// Returns a new segment from `end` to the given `nextEnd`.
rac.Segment.prototype.nextSegmentToPoint = function(nextEnd) {
  return new rac.Segment(this.end, nextEnd);
}

// Returns a new segment from `end` to the given `someAngle` and `distance`.
rac.Segment.prototype.nextSegmentToAngle = function(someAngle, distance) {
  return this.end.segmentToAngle(someAngle, distance);
}

rac.Segment.prototype.segmentPerpendicular = function(clockwise = true) {
  let offset = this.start.add(this.end.negative());
  let newEnd = this.end.add(offset.pointPerpendicular(clockwise));
  return this.end.segmentToPoint(newEnd);
};

// Returns an Arc using this segment `start` as center, `length()` as
// radius, starting from the `angle()` to the given angle and orientation.
rac.Segment.prototype.arcWithEnd = function(
  someAngleEnd = this.angle(),
  clockwise = true)
{
  let arcEnd = rac.Angle.from(someAngleEnd);
  let arcStart = rac.Angle.fromSegment(this);
  return new rac.Arc(
    this.start, this.length(),
    arcStart, arcEnd,
    clockwise);
};

// Returns an Arc using this segment `start` as center, `length()` as
// radius, starting from the `angle()` to the arc distance of the given
// angle and orientation.
rac.Segment.prototype.arcWithArcLength = function(someAngleArcLength, clockwise = true) {
  let arcLength = rac.Angle.from(someAngleArcLength);
  let arcStart = this.angle();
  let arcEnd = arcStart.shift(arcLength, clockwise);

  return new rac.Arc(
    this.start, this.length(),
    arcStart, arcEnd,
    clockwise);
};

// Returns a segment from `this.start` to the intersection between `this`
// and `other`.
rac.Segment.prototype.segmentToIntersectionWithSegment = function(other) {
  let end = this.pointAtIntersectionWithSegment(other);
  if (end === null) {
    return null;
  }
  return new rac.Segment(this.start, end);
};

// TODO: odd name, maybe should be nextSegment? reevaluate "relative" vs shift
rac.Segment.prototype.segmentToRelativeAngle = function(
  relativeAngle, distance, clockwise = true)
{
  let angle = this.reverseAngle().shift(relativeAngle, clockwise);
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

// Returns a new segment that starts from `pointAtBisector` in the given
// `clockwise` orientation.
rac.Segment.prototype.segmentFromBisector = function(length, clockwise = true) {
  let angle = clockwise
    ? this.angle().add(rac.Angle.square)
    : this.angle().add(rac.Angle.square.negative());
  return this.pointAtBisector().segmentToAngle(angle, length);
};

rac.Segment.prototype.bezierCentralAnchor = function(distance, clockwise = true) {
  let bisector = this.segmentFromBisector(distance, clockwise);
  return new rac.Bezier(
    this.start, bisector.end,
    bisector.end, this.end);
};


rac.Arc = class RacArc {

  constructor(
    center, radius,
    start = rac.Angle.zero,
    end = start,
    clockwise = true)
  {
    this.center = center;
    this.radius = radius;
    // Start angle of the arc. Arc will draw from this angle towards `end`
    // in the `clockwise` orientaton.
    this.start = start;
    // End angle of the arc. Arc will draw from `start` to this angle in
    // the `clockwise` orientaton.
    this.end = end;
    // Orientation of the arc
    this.clockwise = clockwise;
  }

  copy() {
    return new rac.Arc(
      this.center,
      this.radius,
      this.start,
      this.end,
      this.clockwise);
  }

  vertex() {
    let arcLength = this.arcLength();
    let beziersPerTurn = 5;
    let divisions = arcLength.turn == 0
      ? beziersPerTurn
      : Math.ceil(arcLength.turn * beziersPerTurn);

    this.divideToBeziers(divisions).vertex();
    return this;
  }

  reverse() {
    return new rac.Arc(
      this.center, this.radius,
      this.end, this.start,
      !this.clockwise);
  }

  withCenter(newCenter) {
    return new rac.Arc(
      newCenter, this.radius,
      this.start, this.end,
      this.clockwise);
  }

  withRadius(newRadius) {
    return new rac.Arc(
      this.center, newRadius,
      this.start, this.end,
      this.clockwise);
  }

  withEndTowardsPoint(point) {
    let newEnd = this.center.angleToPoint(point);
    return new rac.Arc(
      this.center, this.radius,
      this.start, newEnd,
      this.clockwise);
  }

  // Returns `true` if this arc is a complete circle.
  isCircle() {
    let distance = Math.abs(this.end.turn - this.start.turn);
    return distance <= rac.equalityThreshold;
  }

  // Returns `someAngle` clamped to `this.start` and `this.end`, whichever
  // is closest in distance if `someAngle` is outside the arc.
  // Returns `someAngle` as an angle if the arc is a complete circle,
  // unless if `min/maxClamp` are provided.
  // If `minClamp` or `maxClamp` are provided, these are added to `start`,
  // or substracted from `end` in the orientation of the arc, including in
  // complete circle arcs.
  // If the `min/maxClamp` values result in a contradictory range, the
  // returned value will comply with `minClamp + this.start`.
  clampToArcLength(someAngle, someAngleMinClamp = rac.Angle.zero, someAngleMaxClamp = rac.Angle.zero) {
    let angle = rac.Angle.from(someAngle);
    let minClamp = rac.Angle.from(someAngleMinClamp);
    let maxClamp = rac.Angle.from(someAngleMaxClamp);

    if (this.isCircle() && minClamp.turn == 0 && maxClamp.turn == 0) {
      // Complete circle
      return angle;
    }

    // Angle in arc, with arc as origin
    // All comparisons are made in a clockwise orientation
    let shiftedAngle = this.distanceFromStart(angle);
    let shiftedMin = minClamp;
    let shiftedMax = this.arcLength().substract(maxClamp);

    if (shiftedAngle.turn >= shiftedMin.turn && shiftedAngle.turn <= shiftedMax.turn) {
      // Inside clamp range
      return angle;
    }

    // Outside range, figure out closest limit
    let distanceToMin = shiftedMin.distance(shiftedAngle, false);
    let distanceToMax = shiftedMax.distance(shiftedAngle);
    if (distanceToMin.turn <= distanceToMax.turn) {
      return this.shiftAngle(minClamp);
    } else {
      return this.reverse().shiftAngle(maxClamp);
    }
  }

}


rac.defaultDrawer.setDrawFunction(rac.Arc, function() {
  if (this.isCircle()) {
    let startRad = this.start.radians();
    arc(this.center.x, this.center.y,
      this.radius * 2, this.radius * 2,
      startRad, startRad);
    return;
  }

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


// Returns `true` if the given angle is positioned between `start` and
// `end` in the `clockwise` orientation. For complete circle arcs `true` is
// always returned.
rac.Arc.prototype.containsAngle = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  if (this.isCircle()) { return true; }

  if (this.clockwise) {
    let offset = angle.sub(this.start);
    let endOffset = this.end.sub(this.start);
    return offset.turn <= endOffset.turn;
  } else {
    let offset = angle.sub(this.end);
    let startOffset = this.start.sub(this.end);
    return offset.turn <= startOffset.turn;
  }
};

// Returns a segment for the chord formed by the intersection of `self` and
// `other`, or `null` if there is no intersection.
// Both arcs are considered complete circles for the calculation of the
// chord, thus the endpoints of the returned segment may not lay inside the
// actual arcs.
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
    .segmentWithRatioOfLength(2);
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

// Returns an Angle that represents the distance between `this.start` and
// `this.end`, in the orientation of the arc.
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

// Returns the equivalent to `someAngle` shifted to have `this.start` as
// origin, in the orientation of the arc.
// Useful to determine an angle inside the arc, where the arc is considered
// the origin coordinate system.
// For a clockwise arc starting at `0.5`, a `shiftAngle(0.1)` is `0.6`.
// For a clockwise orientation, equivalent to `this.start + someAngle`.
rac.Arc.prototype.shiftAngle = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  return this.start.shift(angle, this.clockwise);
}

// Returns an Angle that represents the distance from `this.start` to
// `someAngle` traveling in the `clockwise` orientation.
// Useful to determine for a given angle, where it sits inside the arc if
// the arc was the origin coordinate system.
// For a clockwise arc starting at `0.1`, a `distanceFromStart(0.5)` is `0.4`.
// For a clockwise orientation, equivalent to `someAngle - this.start`.
rac.Arc.prototype.distanceFromStart = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  return this.start.distance(angle, this.clockwise);
}

// Returns the point in the arc at the given angle shifted by `this.start`
// in the arc orientation. The arc is considered a complete circle.
rac.Arc.prototype.pointAtArcLength = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  let shiftedAngle = this.shiftAngle(angle);
  return this.pointAtAngle(shiftedAngle);
};

// Returns the point in the arc at the given angle. The arc is considered
// a complete circle.
rac.Arc.prototype.pointAtAngle = function(someAngle) {
  let angle = rac.Angle.from(someAngle);
  return this.center.segmentToAngle(angle, this.radius).end;
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

rac.defaultDrawer.setDrawFunction(rac.Bezier, function() {
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

rac.defaultDrawer.setDrawFunction(rac.Composite, function() {
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

rac.defaultDrawer.setDrawFunction(rac.Shape, function () {
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


rac.EaseFunction = class RacEaseFunction {

  // Behaviors for the `easeRange` function when `range` falls before the
  // `prefix` and after the ease transformation.
  static Behavior = {
    // The `range` value is returned without any easing transformation and
    // applying `preFactor` or `postFactor`.
    pass: "pass",
    // Clamps the returned value to `prefix` or `prefix+outRange`;
    clamp: "clamp",
    // The `range` is applied the easing transformation before `prefix`
    // and after `outRange`.
    continue: "continue"
  };

  constructor() {
    this.a = 2;

    this.easeOffset = 0
    this.easeFactor = 1;

    this.prefix = 0;
    this.inRange = 1;
    this.outRange = 1;

    this.preBehavior = rac.EaseFunction.Behavior.pass;
    this.postBehavior = rac.EaseFunction.Behavior.pass;

    this.preFactor = 1;
    this.postFactor = 1;
  }

  // Returns the corresponding eased value for `ratio`. Both the given
  // `ratio` and the returned value are in the [0,1] range. If `ratio` is
  // outside the [0,1] the returned value follows the curve of the easing
  // function, with which some values of `a` becomes invalid.
  easeRatio(ratio) {
    // Source:
    // https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
    // f(t) = (t^a)/(t^a+(1-t)^a)
    let ra = Math.pow(ratio, this.a);
    let ira = Math.pow(1-ratio, this.a);
    return ra / (ra + ira);
  }

  // TODO: better name?
  // easeRatioParametrized
  // easeRatioOffsetFactor
  // other could be easeRatioUnit or just easeUnit!
  easeRatioComplex(ratio) {
    let complexRatio = (ratio + this.easeOffset) * this.easeFactor
    return this.easeRatio(complexRatio);
  }

  easeRange(range) {
    let behavior = rac.EaseFunction.Behavior;

    let shiftedRange = range - this.prefix;
    let ratio = shiftedRange / this.inRange;

    // Before prefix
    if (range < this.prefix) {
      if (this.preBehavior === behavior.pass) {
        let distancetoPrefix = range - this.prefix;
        // With a preFactor of 1 this is equivalent to `return range`
        return this.prefix + (distancetoPrefix * this.preFactor);
      }
      if (this.preBehavior === behavior.clamp) {
        return this.prefix;
      }
      if (this.preBehavior === behavior.continue) {
        let easedRatio = this.easeRatioComplex(ratio);
        return this.prefix + easedRatio * this.outRange;
      }

      console.trace(`Invalid preBehavior configuration - preBehavior:${this.postBehavior}`);
      throw rac.Error.invalidObjectConfiguration;
    }

    // After prefix
    if (ratio <= 1 || this.postBehavior === behavior.continue) {
      let easedRatio = this.easeRatioComplex(ratio);
      return this.prefix + easedRatio * this.outRange;
    }
    if (this.postBehavior === behavior.pass) {
      // Shifted to have inRange as origin
      let shiftedPost = shiftedRange - this.inRange;
      return this.prefix + this.outRange + shiftedPost * this.postFactor;
    }
    if (this.postBehavior === behavior.clamp) {
      return this.prefix + this.outRange;
    }

    console.trace(`Invalid postBehavior configuration - postBehavior:${this.postBehavior}`);
    throw rac.Error.invalidObjectConfiguration;
  }

}


// TODO: all these could be rac.Control properties?

// Collection of all controls that are drawn with `drawControls`
// and evaluated for selection with the `pointer...` functions.
rac.controls = [];


// Last Point of the pointer position when it was pressed, or last Control
// interacted with. Set to `null` when there has been no interaction yet
// and while there is a selected control.
rac.lastPointer = null;

// Style used for visual elements related to selection and pointer interaction.
rac.pointerStyle = null;


// Call to signal the pointer being pressed. If the ponter hits a control
// it will be considered selected. When a control is selected a copy of its
// anchor is stored as to allow interaction with a fixed anchor.
rac.pointerPressed = function(pointerCenter) {
  rac.lastPointer = null;

  let selected = rac.controls.find(item => {
    let controlCenter = item.center();
    if (controlCenter === null) { return false; }
    if (controlCenter.distanceToPoint(pointerCenter) <= rac.Control.radius) {
      return true;
    }
    return false;
  });

  if (selected === undefined) {
    return;
  }

  rac.Control.selection = new rac.Control.Selection(selected, pointerCenter);
}


// Call to signal the pointer being dragged. As the pointer moves the value
// of the selected control is updated.
rac.pointerDragged = function(pointerCenter){
  if (rac.Control.selection === null) {
    return;
  }

  let control = rac.Control.selection.control;
  let anchorCopy = rac.Control.selection.anchorCopy;

  // Center of dragged control in the pointer current position
  let currentPointerControlCenter = rac.Control.selection.pointerOffset
    .translateToStart(pointerCenter)
    .end;

  let newValue = control.value;

  // Segment anchor
  if (anchorCopy instanceof rac.Segment) {
    // New value from the current pointer position, relative to anchorCopy
    newValue = anchorCopy
      .lengthToProjectedPoint(currentPointerControlCenter);

    // Clamping value (javascript has no Math.clamp)
    newValue = anchorCopy.clampToLength(newValue,
      control.minLimit, control.maxLimit);
  }

  // Arc anchor
  if (anchorCopy instanceof rac.Arc) {
    let minLimitAngle = rac.Angle.from(control.minLimit);
    let maxLimitAngle = rac.Angle.from(control.maxLimit);
    let selectionAngle = anchorCopy.center
      .angleToPoint(currentPointerControlCenter);


    selectionAngle = anchorCopy.clampToArcLength(selectionAngle,
      minLimitAngle, maxLimitAngle);
    newValue = anchorCopy.distanceFromStart(selectionAngle);
  }

  // Update control with new value
  control.value = newValue;
};


// Call to signal the pointer being released. Upon release the selected
// control is cleared.
rac.pointerReleased = function(pointerCenter) {
  if (rac.Control.selection === null) {
    rac.lastPointer = pointerCenter;
    return;
  }

  rac.lastPointer = rac.Control.selection.control;
  rac.Control.selection = null;
}


// Draws controls and the visuals of pointer and control selection. Usually
// called at the end of `draw` so that controls sits on top of the drawing.
rac.drawControls = function() {
  // Last pointer or control
  if (rac.lastPointer instanceof rac.Point) {
    rac.lastPointer.arc(12).draw(rac.pointerStyle);
  }
  if (rac.lastPointer instanceof rac.Control) {
    // TODO: last selected control state
  }

  // Pointer pressed
  let pointerCenter = rac.Point.mouse();
  if (mouseIsPressed) {
    if (rac.Control.selection === null) {
      pointerCenter.arc(10).draw(rac.pointerStyle);
    } else {
      pointerCenter.arc(5).draw(rac.pointerStyle);
    }
  }

  // All controls in display
  rac.controls.forEach(item => item.draw());

  // Rest is Control selection visuals
  if (rac.Control.selection === null) {
    return;
  }

  // Pointer to anchor elements
  // Copied anchor segment
  let anchorCopy = rac.Control.selection.anchorCopy;
  anchorCopy.draw(rac.pointerStyle);

  let minLimit = rac.Control.selection.control.minLimit;
  let maxLimit = rac.Control.selection.control.maxLimit;

  // Markers for segment limits
  if (anchorCopy instanceof rac.Segment) {
    if (minLimit > 0) {
      let minPoint = anchorCopy.pointAtLength(minLimit);
      rac.Control.makeLimitMarkerSegment(minPoint, anchorCopy.angle())
        .draw(rac.pointerStyle);
    }
    if (maxLimit > 0) {
      let maxPoint = anchorCopy.reverse().pointAtLength(maxLimit);
      rac.Control.makeLimitMarkerSegment(maxPoint, anchorCopy.angle().inverse())
        .draw(rac.pointerStyle);
    }
  }

  // Markers for arc limits
  if (anchorCopy instanceof rac.Arc) {
    minLimit = rac.Angle.from(minLimit);
    maxLimit = rac.Angle.from(maxLimit);
    if (minLimit.turn > 0) {
      let minPoint = anchorCopy.pointAtArcLength(minLimit);
      let markerAngle = anchorCopy.center.angleToPoint(minPoint)
        .perpendicular(anchorCopy.clockwise)
      rac.Control.makeLimitMarkerSegment(minPoint, markerAngle)
        .draw(rac.pointerStyle);
    }
    if (maxLimit.turn > 0) {
      let maxPoint = anchorCopy.reverse().pointAtArcLength(minLimit);
      let markerAngle = anchorCopy.center.angleToPoint(maxPoint)
        .perpendicular(!anchorCopy.clockwise)
      rac.Control.makeLimitMarkerSegment(maxPoint, markerAngle)
        .draw(rac.pointerStyle);
    }
  }

  // Ray from pointer to control shadow center
  let draggedShadowCenter = rac.Control.selection.pointerOffset
    .translateToStart(pointerCenter)
    .end;

  // Control shadow center, attached to pointer
  draggedShadowCenter.arc(2)
    .draw(rac.pointerStyle);

  // Segment anchor
  if (anchorCopy instanceof rac.Segment) {
    let constrainedLength = anchorCopy
      .lengthToProjectedPoint(draggedShadowCenter);
    // Clamp to limits
    constrainedLength = anchorCopy.clampToLength(constrainedLength,
      minLimit, maxLimit);

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
      .segmentWithRatioOfLength(2/3)
      .draw(rac.pointerStyle);

    let hightlight = rac.Color.cyan.stroke(3);
    let noEaseDistance = rac.Control.radius * 2;
    let easeDistance = rac.Control.radius * 6;
    let easedLength = rac.Control.radius * 3;
    let segmentToDraggedCenter = constrainedShadowCenter
      .segmentToPoint(draggedShadowCenter);
    if (segmentToDraggedCenter.length() < noEaseDistance) {
      segmentToDraggedCenter.draw(hightlight);
    } else {
    	// TODO: dummy code!
      let lengthRatio = (segmentToDraggedCenter.length() - noEaseDistance) / easeDistance;
      // https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
      // f(x) = (t^a)/(t^a+(1-t)^a)
      let a = 2;
      let t = 1 - lengthRatio;
      let easeRatio = Math.pow(t,a) / (Math.pow(t,a) + Math.pow(1-t,a));
      easeRatio = 1 - easeRatio;
      let newlength = noEaseDistance + (easeRatio * easedLength);
      segmentToDraggedCenter.withLength(newlength).draw(hightlight);
    }
  }

  // Arc anchor
  if (anchorCopy instanceof rac.Arc) {
    // TODO: implement!
  }
};


// Creates a new Control instance with `value` and limits` of zero.
// A control may have a Segment or Arc as the `anchor` shape.
// For a Segment anchor the `value` and limits can be integers.
// For an Arch achor the limits can be an integer or an Angle. `value`
// can be set as a integer or Angle, but will be updated with an Angle
// instance when the control is used.
rac.Control = class RacControl {

  // Radius of the cicle drawn for controls.
  static radius = 22;

  constructor() {
    this.style = null;
    this.value = 0;
    this.minLimit = 0;
    this.maxLimit = 0;
    this.anchor = null;
  }


  // Selection information for the currently selected control, or `null` if
  // there is no selection.
  static selection = null;

  static Selection = class RacControlSelection{
    constructor(control) {
      // Selected control instance.
      this.control = control;
      // Copy of the control anchor, so that the control can move tied to
      // the drawing, while the interaction range remains fixed.
      this.anchorCopy = control.anchor.copy();
      // Segment from the captured pointer position to the contro center,
      // used to attach the control to the point where interaction started.
      // Starts at pointer and ends at control center.
      this.pointerOffset = rac.Point.mouse().segmentToPoint(control.center());
    }
  }

}


rac.Control.prototype.center = function() {
  if (this.anchor === null) {
    return null;
  }

  if (this.anchor instanceof rac.Segment) {
    return this.anchor.withLength(this.value).end;
  }
  if (this.anchor instanceof rac.Arc) {
    let angleValue = rac.Angle.from(this.value);
    return this.anchor.startSegment()
      .arcWithArcLength(angleValue, this.anchor.clockwise)
      .endPoint();
  }

  console.trace(`Cannot produce control center - constructorName:${this.anchor.constructor.name}`);
  throw rac.Error.invalidObjectToConvert;
};

rac.Control.prototype.isSelected = function() {
  if (rac.Control.selection === null) {
    return false;
  }
  return rac.Control.selection.control === this;
}

rac.Control.prototype.draw = function() {
  if (this.anchor instanceof rac.Segment) {
    rac.Control.drawSegmentControl(this);
    return;
  }
  if (this.anchor instanceof rac.Arc) {
    rac.Control.drawArcControl(this);
    return;
  }
};

rac.Control.drawSegmentControl = function(control) {
  let anchor = control.anchor;
  anchor.draw(control.style);

  // Control button
  let center = control.center();
  center.arc(rac.Control.radius)
    .attachToShape()
    .popShapeToComposite();

  // Negative arrow
  if (control.value >= control.minLimit + rac.equalityThreshold) {
    rac.Control.makeArrowShape(center, anchor.angle().inverse())
      .attachToComposite();
  }

  // Positive arrow
  if (control.value <= anchor.length() - control.maxLimit - rac.equalityThreshold) {
    rac.Control.makeArrowShape(center, anchor.angle())
      .attachToComposite();
  }

  rac.popComposite().draw(control.style);

  // Selection
  if (control.isSelected()) {
    center.arc(rac.Control.radius * 1.5).draw(rac.pointerStyle);
  }
};

rac.Control.drawArcControl = function(control) {
  let anchor = control.anchor;
  anchor.draw(control.style.withFill(rac.Fill.none));

  // Control button
  let center = control.center();
  center.arc(rac.Control.radius)
    .attachToShape()
    .popShapeToComposite();

  let angleValue = rac.Angle.from(control.value);
  // Angle of the current value relative to the arc anchor
  let relativeAngleValue = anchor.shiftAngle(angleValue);

  // Negative arrow
  let minLimitAngle = rac.Angle.from(control.minLimit);
  if (angleValue.turn >= minLimitAngle.turn + rac.equalityThreshold) {
    let negAngle = relativeAngleValue.perpendicular(anchor.clockwise).inverse();
    rac.Control.makeArrowShape(center, negAngle)
      .attachToComposite();
  }

  // Positive arrow
  let maxLimitAngle = rac.Angle.from(control.maxLimit);
  // TODO: what happens here with a limit that goes around the turn value?
  if (angleValue.turn <= anchor.arcLength().turn - maxLimitAngle.turn - rac.equalityThreshold) {
    let posAngle = relativeAngleValue.perpendicular(anchor.clockwise);
    rac.Control.makeArrowShape(center, posAngle)
      .attachToComposite();
  }

  rac.popComposite().draw(control.style);

  // Selection
  if (control.isSelected()) {
    center.arc(rac.Control.radius * 1.5).draw(rac.pointerStyle);
  }
};

rac.Control.makeArrowShape = function(center, angle) {
  // Arc
  let arcLength = rac.Angle.from(1/22);
  let arc = center.arc(rac.Control.radius * 1.5,
    angle.sub(arcLength), angle.add(arcLength));

  // Arrow walls
  let pointAngle = rac.Angle.from(1/8);
  let rightWall = arc.startPoint().segmentToAngle(angle.add(pointAngle), 100);
  let leftWall = arc.endPoint().segmentToAngle(angle.sub(pointAngle), 100);

  // Arrow point
  let point = rightWall.pointAtIntersectionWithSegment(leftWall);

  // Shape
  let arrow = new rac.Shape();
  point.segmentToPoint(arc.startPoint())
    .attachTo(arrow);
  arc.attachTo(arrow)
    .endPoint().segmentToPoint(point)
    .attachTo(arrow);

    return arrow;
};

rac.Control.makeLimitMarkerSegment = function(point, someAngle) {
  let angle = rac.Angle.from(someAngle);
  return point.segmentToAngle(angle.perpendicular(false), 7)
    .withStartExtended(3);
};



