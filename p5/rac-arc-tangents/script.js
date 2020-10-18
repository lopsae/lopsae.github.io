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
distanceControl.setValueWithLength(140);
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

  // https://coolors.co/011627-fdfffc-2ec4b6-e71d36-ff9f1c-9e22f1
  let palette = {
    richBlack:   rac.Color.fromRgba(1, 22, 39),
    babyPowder:  rac.Color.fromRgba(253, 255, 252),
    tiffanyBlue: rac.Color.fromRgba(46, 196, 182),
    roseMadder:  rac.Color.fromRgba(231, 29, 54),
    orangePeel:  rac.Color.fromRgba(255, 159, 28),
    purpleX11:   rac.Color.fromRgba(158, 34, 241)
  };

  // TODO: remove when replaced
  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .8), // red,
    secondary:   new rac.Color( .7,  .3,  .3,  .3), // rose pink
    fill:        new rac.Color( .8,  .8,  .8,  .7), // whiteish
    controlFill: new rac.Color( .8,  .8,  .8, 1.0), // whiteish
    pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };

  // Root styles
  palette.richBlack.applyBackground();
  palette.babyPowder.stroke(2).apply();

  // Debug style
  rac.defaultDrawer.debugStyle = palette.purpleX11.stroke(5);

  // Styles
  let secondaryStroke = colorScheme.secondary.stroke(2);


  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  rac.Control.controls.forEach(item => item.style = controlStyle);

  rac.Control.pointerStyle = colorScheme.pointer.stroke(3);


  // General measurements
  let startArcRadius = 30;
  let endArcRadius = 80;


  // Center pont
  let center = new rac.Point(width/2, height/2);


  let exampleAngle = angleControl.distance();
  let exampleDistance = distanceControl.distance();


  // Arc-tangent segment from point
  makeExampleContext(center, rac.Angle.nw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let endArc = endCenter
      .segmentToAngle(rac.Angle.w, rac.Control.radius * 4)
      .arc();
    // Angle control
    angleControl.anchor = endArc;

    angleControl.center()
      .segmentToPoint(angleControl.anchor.center)
      .draw(secondaryStroke);
    angleControl.anchor.startSegment()
      .reverse()
      .segmentToBisector()
      .draw(secondaryStroke);

    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw();

    let hyp = distanceSegment.length();
    let ops = endArc.radius

    // Sine over 1 is invalid
    let angleSine = ops / hyp;
    angleSine = Math.min(angleSine, 1);

    let angleRadians = Math.asin(angleSine);
    let opsAngle = rac.Angle.fromRadians(angleRadians);
    let rootAngle = distanceSegment.angle();

    // Clockwise segments
    let cwOpsAngle = rootAngle
      .shift(opsAngle, true);
    let cwAdjAngle = cwOpsAngle.perpendicular(true);
    let cwEnd = endArc.pointAtAngle(cwAdjAngle);

    if (angleSine < 1) {
      endCenter
        .segmentToPoint(cwEnd)
        .draw()
        .nextSegmentToPoint(startCenter)
        .draw();
    }

    // Counter-clockwise segments
    let ccOpsAngle = rootAngle
      .shift(opsAngle, false);
    let ccAdjAngle = ccOpsAngle.perpendicular(false);
    let ccEnd = endArc.pointAtAngle(ccAdjAngle);

    if (angleSine < 1) {
      endCenter
        .segmentToPoint(ccEnd)
        .draw(secondaryStroke)
        .nextSegmentToPoint(startCenter)
        .draw(secondaryStroke);
    }

    // With implemented functions
    let implementedOffset = 20;
    if (angleSine < 1) {
      startCenter
        .segmentTangentToArc(endArc, true)
        .translate(rac.Point.origin.pointToAngle(cwAdjAngle, implementedOffset))
        .draw()
        .nextSegmentToPoint(cwEnd)
        .draw(secondaryStroke);

      startCenter
        .segmentTangentToArc(endArc, false)
        .translate(rac.Point.origin.pointToAngle(ccAdjAngle, implementedOffset))
        .draw(secondaryStroke)
        .nextSegmentToPoint(ccEnd)
        .draw(secondaryStroke);
    } else {
      endArc.radiusSegmentAtAngle(rootAngle.inverse())
        .withEndExtended(implementedOffset)
        .draw(secondaryStroke)
        .end
        .draw();
    }



  });


  // Circle to circle, external
  makeExampleContext(center, rac.Angle.ne, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw();

    // Distance control
    distanceControl.anchor = distanceSegment
      .nextSegmentPerpendicular(true)
      .withLength(endArcRadius + rac.Control.radius * 1.5)
      .draw(secondaryStroke)
      .nextSegmentPerpendicular(true);
    distanceControl.center()
      .segmentToPoint(startCenter)
      .draw(secondaryStroke);

    // Circles
    let startArc = startCenter.arc(startArcRadius)
      .draw();
    let endArc = endCenter.arc(endArcRadius)
      .draw();

    // Calculations
    let hyp = distanceSegment.length();
    let ops = endArcRadius - startArcRadius;

    let angleSine = ops / hyp;
    // Sine over 1 is invalid
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
    let toDetached = rootAngle.perpendicular(true);
    let detachedAdjVertex = endCenter
      .segmentToAngle(toDetached, startArcRadius + endArcRadius)
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

    // Attached to detached reticules
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw(secondaryStroke)
    detachedOpsVertex.segmentToAngle(toDetached.inverse(), startArcRadius + endArcRadius)
      .draw(secondaryStroke);

    // Detached End Circle reticules
    detachedAdjVertex
      .segmentToAngle(toDetached.inverse(), endArcRadius)
      .arcWithEnd(cwAdjAngle, true)
      .draw(secondaryStroke)
      .endSegment()
      .draw(secondaryStroke);

    // Detached Start Circle reticules
    detachedOpsVertex
      .segmentToAngle(rootAngle, startArcRadius)
      .arcWithEnd(cwAdjAngle, false)
      .draw(secondaryStroke)
      .endSegment()
      .draw(secondaryStroke);
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle, startArcRadius)
      .draw(secondaryStroke)
      .nextSegmentToAngle(cwOpsAngle, adj)
      .draw(secondaryStroke);

    // Rest of drawing depends on valid angle
    if (angleSine >= 1) {
      endArc.radiusSegmentTowardsPoint(startCenter)
        .draw(secondaryStroke);
      return;
    }

    // Cw Ops-adj reticules
    startCenter.segmentToAngle(cwOpsAngle, adj)
      .draw(secondaryStroke);
    startArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw(secondaryStroke);
    endArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw(secondaryStroke);

    // Cw Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, true, true)
      .draw();

    // Cc Ops-adj reticules
    let ccOpsAngle = rootAngle.shift(opsAngle, false);
    let ccAdjAngle = rootAngle.shift(adjAngle, false);
    startCenter.segmentToAngle(ccOpsAngle, adj)
      .draw(secondaryStroke);
    startArc.radiusSegmentAtAngle(ccAdjAngle)
      .draw(secondaryStroke);
    endArc.radiusSegmentAtAngle(ccAdjAngle)
      .draw(secondaryStroke);

    // Cc Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, false, false)
      .draw(secondaryStroke);

  });


  // // Circle to circle, cross
  makeExampleContext(center, rac.Angle.sw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw();

    // Circles
    let startArc = startCenter.arc(startArcRadius)
      .draw();
    let endArc = endCenter.arc(endArcRadius)
      .draw();

    // Calculations
    let hyp = distanceSegment.length();
    let ops = endArcRadius + startArcRadius;

    let angleSine = ops / hyp;
    // Sine over 1 is invalid
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
    let toDetached = rootAngle.perpendicular(true);
    let detachedAdjVertex = endCenter
      .segmentToAngle(toDetached, startArcRadius + endArcRadius)
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

    // Attached to detached reticules
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw(secondaryStroke)
    detachedOpsVertex.segmentToAngle(toDetached.inverse(), startArcRadius + endArcRadius)
      .draw(secondaryStroke);

    // Detached End Circle reticules
    detachedAdjVertex
      .segmentToAngle(toDetached.inverse(), endArcRadius)
      .arcWithEnd(cwAdjAngle, true)
      .draw(secondaryStroke)
      .endSegment()
      .draw(secondaryStroke);

    // Detached Start Circle reticules
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle.inverse(), startArcRadius)
      .arcWithEnd(cwOpsAngle, false)
      .draw(secondaryStroke)
      .endSegment()
      .draw(secondaryStroke);
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle.inverse(), startArcRadius)
      .draw(secondaryStroke)
      .nextSegmentToAngle(cwOpsAngle, adj)
      .draw(secondaryStroke);

    // Rest of drawing depends on valid angle
    if (angleSine >= 1) {
      endCenter.segmentToAngle(rootAngle.inverse(), ops)
        .draw(secondaryStroke);
      return;
    }

    // Cw Ops-adj reticules
    startCenter.segmentToAngle(cwOpsAngle, adj)
      .draw(secondaryStroke);
    endCenter.segmentToAngle(cwAdjAngle, ops)
      .draw(secondaryStroke);
    startArc.radiusSegmentAtAngle(cwAdjAngle.inverse())
      .draw(secondaryStroke);

      // Cc Ops-adj reticules
    let ccOpsAngle = rootAngle.shift(opsAngle, false);
    let ccAdjAngle = rootAngle.shift(adjAngle, false);
    startCenter.segmentToAngle(ccOpsAngle, adj)
      .draw(secondaryStroke);
    endCenter.segmentToAngle(ccAdjAngle, ops)
      .draw(secondaryStroke);
    startArc.radiusSegmentAtAngle(ccAdjAngle.inverse())
      .draw(secondaryStroke);

    // Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, false, true)
      .draw();
    startArc.segmentTangentToArc(endArc, true, false)
      .draw(secondaryStroke).debug();

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

