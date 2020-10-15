"use strict";


function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
  noFill();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function mousePressed(event) {
  rac.Control.pointerPressed(rac.Point.mouse());
  redraw();
}


function mouseDragged(event) {
  rac.Control.pointerDragged(rac.Point.mouse());
  redraw();
}


function mouseReleased(event) {
  rac.Control.pointerReleased(rac.Point.mouse());
  redraw();
}


let distanceControl = new rac.SegmentControl(0, 200)
distanceControl.setValueWithLength(150);
distanceControl.setLimitsWithLengthInsets(10, 0);
rac.Control.controls.push(distanceControl);

let angleControl = new rac.ArcControl(1/4, 1);
angleControl.setValueWithArcLength(1/8);
angleControl.addMarkerAtCurrentValue();
rac.Control.controls.push(angleControl);



function makeExampleContext(center, exampleAngle, arcsAngle, arcsDistance, closure) {
  let distanceToExample = 220;
  let endCenter = center.pointToAngle(exampleAngle, distanceToExample);
  let startCenter = endCenter.pointToAngle(arcsAngle, arcsDistance);

  closure(startCenter, endCenter);
}



function draw() {
  clear();

  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .8), // red,
    secondary:   new rac.Color( .7,  .3,  .3,  .3), // rose pink
    fill:        new rac.Color( .8,  .8,  .8,  .7), // whiteish
    controlFill: new rac.Color( .8,  .8,  .8, 1.0), // whiteish
    pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };
  colorScheme.background.applyBackground();

  let mainStroke = colorScheme.stroke.stroke(2);
  mainStroke.apply();

  let secondaryStroke = colorScheme.secondary.stroke(2);

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  rac.Control.controls.forEach(item => item.style = controlStyle);

  rac.Control.pointerStyle = colorScheme.pointer.stroke(3);


  // General measurements
  let startArcRadius = 30;
  let endArcRadius = 80;

  // Aesthetics
  let overflow = 50;


  // Center pont
  let center = new rac.Point(width/2, height/2);


  // Distance control
  distanceControl.anchor = center
    .segmentToAngle(rac.Angle.w, distanceControl.length/2)
    .reverse();


  let exampleAngle = angleControl.distance();
  let exampleDistance = distanceControl.distance();


  // Arc-tangent segment from point
  makeExampleContext(center, rac.Angle.nw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    // Angle control
    angleControl.anchor = endCenter
      .segmentToAngle(rac.Angle.w, rac.Control.radius * 4)
      .arcWithEnd(1/4);

    angleControl.center()
      .segmentToPoint(angleControl.anchor.center)
      .draw(secondaryStroke);
    angleControl.anchor.startSegment()
      .reverse()
      .segmentToBisector()
      .draw(secondaryStroke);

    // Example
    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw();

    let hyp = distanceSegment.length();
    let ops = angleControl.anchor.radius

    // Sine over 1 is invalid
    let angleSine = ops / hyp;
    angleSine = Math.min(angleSine, 1);

    let angleRadians = Math.asin(angleSine);
    let opsAngle = rac.Angle.fromRadians(angleRadians);

    // Clockwise segments
    let cwAbsOpsAngle = distanceSegment.angle()
      .shift(opsAngle, true);
    let cwAbsAdjAngle = cwAbsOpsAngle.perpendicular(true);
    let cwEnd = angleControl.anchor
      .pointAtAngle(cwAbsAdjAngle);

    if (angleSine < 1) {
      angleControl.anchor.center
        .segmentToPoint(cwEnd)
        .draw()
        .nextSegmentToPoint(startCenter)
        .withStartExtended(overflow)
        .draw();
    } else {
      cwEnd.segmentToAngle(cwAbsOpsAngle, overflow)
        .draw();
    }

    // With implemented function
    let cwArcTangent = startCenter
      .segmentTangentToArc(angleControl.anchor, true)
      ?? cwEnd.segmentToPoint(cwEnd);
    cwArcTangent
      .translate(rac.Point.origin.pointToAngle(cwAbsAdjAngle, 20))
      .draw()
      .nextSegmentToPoint(cwEnd)
      .draw(secondaryStroke);

    // Counter-clockwise segments
    let ccAbsOpsAngle = distanceSegment.angle()
      .shift(opsAngle, false);
    let ccAbsAdjAngle = ccAbsOpsAngle.perpendicular(false);
    let ccEnd = angleControl.anchor
      .pointAtAngle(ccAbsAdjAngle);

    if (angleSine < 1) {
      angleControl.anchor.center
        .segmentToPoint(ccEnd)
        .draw(secondaryStroke)
        .nextSegmentToPoint(startCenter)
        .withStartExtended(overflow)
        .draw(secondaryStroke);
    } else {
      ccEnd.segmentToAngle(ccAbsOpsAngle, overflow)
        .draw(secondaryStroke);
    }

    // With implemented function
    let ccArcTangent = startCenter
      .segmentTangentToArc(angleControl.anchor, false)
      ?? ccEnd.segmentToPoint(ccEnd);
    ccArcTangent
      .translate(rac.Point.origin.pointToAngle(ccAbsAdjAngle, 20))
      .draw(secondaryStroke)
      .nextSegmentToPoint(ccEnd)
      .draw(secondaryStroke);
  });


  // Circle to circle, external
  makeExampleContext(center, rac.Angle.ne, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let startArc = startCenter.arc(startArcRadius)
      .draw();
    let endArc = endCenter.arc(endArcRadius)
      .draw();

    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw();

    let hyp = distanceSegment.length();
    let ops = endArcRadius - startArcRadius;

    // Sine over 1 is invalid
    let angleSine = ops / hyp;
    angleSine = Math.min(angleSine, 1);

    let angleRadians = Math.asin(angleSine);
    let opsAngle = rac.Angle.fromRadians(angleRadians);
    let adj = Math.cos(opsAngle.radians()) * hyp;
    // adjAngle as the angle between hyp and ops, outside the triangle
    let adjAngle = opsAngle.perpendicular(true);
    let rootAngle = distanceSegment.angle();

    // Clock-wise absolute angles
    let cwOpsAngle = rootAngle.shift(opsAngle, true);
    let cwAdjAngle = rootAngle.shift(adjAngle, true);

    // Detached triangle
    let detachedAdjVertex = endCenter
      .segmentToAngle(rootAngle.perpendicular(true), startArcRadius + endArcRadius)
      .end;
    let detachedHypVertex = detachedAdjVertex
      .segmentToAngle(cwAdjAngle, ops)
      .draw()
      .end;
    let detachedOpsVertex = detachedHypVertex
      .segmentToAngle(cwOpsAngle.inverse(), adj)
      .draw()
      .end;
    detachedOpsVertex
      .segmentToPoint(detachedAdjVertex)
      .draw();

    // Detached reticule
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw(secondaryStroke)
    detachedOpsVertex.segmentToPoint(startCenter)
      .draw(secondaryStroke);
    detachedHypVertex
      .segmentToAngle(cwAdjAngle, endArcRadius)
      .draw(secondaryStroke)
      .arcWithEnd(cwAdjAngle.inverse(), false)
      .draw(secondaryStroke);
    detachedAdjVertex
      .segmentToAngle(cwAdjAngle.inverse(), endArcRadius - ops)
      .draw(secondaryStroke)
      .arcWithEnd(cwAdjAngle)
      .draw(secondaryStroke);

    // Ops-adj reticules
    startCenter.segmentToAngle(cwOpsAngle, adj)
      .draw(secondaryStroke);
    startArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw(secondaryStroke);
    endArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw(secondaryStroke);

    // Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, true, true)
      .draw(highlight);

    // TODO: replace with implemented function

    // Counter-clock-wise absolute angles
    let ccOpsAngle = rootAngle.shift(opsAngle, false);
    let ccAdjAngle = rootAngle.shift(adjAngle, false);
    let ccStart = startArc.pointAtAngle(ccAdjAngle);
    let ccEnd = endArc.pointAtAngle(ccAdjAngle);
    startCenter.segmentToPoint(ccStart).draw(secondaryStroke)
      .nextSegmentToPoint(ccEnd).draw(secondaryStroke)
      .nextSegmentToPoint(endCenter).draw(secondaryStroke);
  });


  // Example 3
  makeExampleContext(center, rac.Angle.sw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    endCenter.arc(endArcRadius)
      .draw();

    startCenter.arc(startArcRadius)
      .draw();

    startCenter.segmentToPoint(endCenter)
      .draw();
  });


  // Example 4
  makeExampleContext(center, rac.Angle.se, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    endCenter.arc(endArcRadius)
      .draw();

    startCenter.arc(startArcRadius)
      .draw();

    startCenter.segmentToPoint(endCenter)
      .draw();
  });


  // Controls draw on top
  rac.Control.drawControls();


  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

