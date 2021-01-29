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

  // Root styles
  palette.richBlack.applyBackground();
  // Default style mostly used for reticules
  palette.babyPowder.withAlpha(.1).stroke(2).apply();

  // Debug style
  rac.defaultDrawer.debugStyle = palette.purpleX11.stroke(5);

  // Styles
  let tangentStroke =          palette.orangePeel.stroke(4);
  let tangentSecondaryStroke = tangentStroke.withAlpha(.5);
  let triangleTangentStroke =  palette.tiffanyBlue.stroke(3);
  let triangleStroke =         palette.tiffanyBlue.stroke(2).withAlpha(.7);
  let circleStroke =           palette.roseMadder.stroke(2);


  let controlStyle = circleStroke
    .withWeight(3)
    .styleWithFill(palette.babyPowder.fill());

  rac.Control.controls.forEach(item => item.style = controlStyle);
  rac.Control.pointerStyle = palette.babyPowder.withAlpha(.5).stroke(2);


  // General measurements
  let startArcRadius = 30;
  let endArcRadius = 80;


  // Center pont
  let center = new rac.Point(width/2, height/2);


  let exampleAngle = angleControl.distance();
  let exampleDistance = distanceControl.distance();


  // Example 1 - Arc-tangent segment from point
  makeExampleContext(center, rac.Angle.nw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let endArc = endCenter
      .segmentToAngle(rac.Angle.w, endArcRadius)
      .arc();
    // Angle control
    angleControl.anchor = endArc;

    angleControl.center()
      .segmentToPoint(angleControl.anchor.center)
      .draw();
    angleControl.anchor.startSegment()
      .reverse()
      .segmentToBisector()
      .draw();

    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw(triangleStroke);

    let hyp = distanceSegment.length();
    let ops = endArc.radius

    // Sine over 1 is invalid
    let angleSine = ops / hyp;
    angleSine = Math.min(angleSine, 1);

    let angleRadians = Math.asin(angleSine);
    let opsAngle = rac.Angle.fromRadians(angleRadians);
    let rootAngle = distanceSegment.angle();
    let adj = Math.cos(opsAngle.radians()) * hyp;

    // Clockwise segments
    let cwOpsAngle = rootAngle
      .shift(opsAngle, true);
    let cwAdjAngle = cwOpsAngle.perpendicular(true);
    let cwEnd = endArc.pointAtAngle(cwAdjAngle);

    // Counter-clockwise segments
    let ccOpsAngle = rootAngle
      .shift(opsAngle, false);
    let ccAdjAngle = ccOpsAngle.perpendicular(false);
    let ccEnd = endArc.pointAtAngle(ccAdjAngle);

    // Detached triangle
    let toDetached = rootAngle.perpendicular(true);
    let detachedAdjVertex = endCenter
      .segmentToAngle(toDetached, startArcRadius + endArcRadius)
      .end;
    let detachedHypVertex = detachedAdjVertex
      .segmentToAngle(cwAdjAngle, ops)
      .draw(triangleStroke)
      .end;
    let detachedOpsVertex = detachedHypVertex
      .segmentToAngle(cwOpsAngle.inverse(), adj)
      .draw(triangleTangentStroke)
      .end;
    detachedOpsVertex
      .segmentToPoint(detachedAdjVertex)
      .draw(triangleStroke);

    // Attached to detached reticules
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw()
    detachedOpsVertex.segmentToAngle(toDetached.inverse(), startArcRadius + endArcRadius)
      .draw();

    // Detached End Circle reticules
    detachedAdjVertex
      .segmentToAngle(toDetached.inverse(), endArcRadius)
      .arcWithEnd(cwAdjAngle, true)
      .draw();

    // Rest of drawing depends on valid angle
    if (angleSine >= 1) {
      endArc.radiusSegmentAtAngle(rootAngle.inverse())
        .draw();
      return;
    }

    endCenter
      .segmentToPoint(cwEnd)
      .draw();

    endCenter
      .segmentToPoint(ccEnd)
      .draw();

    // With implemented functions
    let cwTangent = startCenter
      .segmentTangentToArc(endArc, true)
      .draw(tangentStroke);
    cwTangent.nextSegmentToPoint(cwEnd)
      .draw();
    cwTangent.start.segmentToPoint(startCenter)
      .draw();

    let ccTangent = startCenter
      .segmentTangentToArc(endArc, false)
      .draw(tangentSecondaryStroke);
    ccTangent.nextSegmentToPoint(ccEnd)
      .draw();
    ccTangent.start.segmentToPoint(startCenter)
      .draw();

  });


  // Example 2 - Circle to circle, external
  makeExampleContext(center, rac.Angle.ne, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw(triangleStroke);

    // Distance control
    distanceControl.anchor = distanceSegment
      .nextSegmentPerpendicular(true)
      .withLength(endArcRadius + rac.Control.radius * 1.5)
      .draw()
      .nextSegmentPerpendicular(true);
    distanceControl.center()
      .segmentToPoint(startCenter)
      .draw();

    // Circles
    let startArc = startCenter.arc(startArcRadius)
      .draw(circleStroke);
    let endArc = endCenter.arc(endArcRadius)
      .draw(circleStroke);

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
      .draw(triangleStroke)
      .end;
    let detachedOpsVertex = detachedHypVertex
      .segmentToAngle(cwOpsAngle.inverse(), adj)
      .draw(triangleTangentStroke)
      .end;
    detachedOpsVertex
      .segmentToPoint(detachedAdjVertex)
      .draw(triangleStroke);

    // Attached to detached reticules
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw()
    detachedOpsVertex.segmentToAngle(toDetached.inverse(), startArcRadius + endArcRadius)
      .draw();

    // Detached End Circle reticules
    detachedAdjVertex
      .segmentToAngle(toDetached.inverse(), endArcRadius)
      .arcWithEnd(cwAdjAngle, true)
      .draw()
      .endSegment()
      .draw();

    // Detached Start Circle reticules
    detachedOpsVertex
      .segmentToAngle(rootAngle, startArcRadius)
      .arcWithEnd(cwAdjAngle, false)
      .draw()
      .endSegment()
      .draw();
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle, startArcRadius)
      .draw()
      .nextSegmentToAngle(cwOpsAngle, adj)
      .draw();

    // Rest of drawing depends on valid angle
    if (angleSine >= 1) {
      endArc.radiusSegmentTowardsPoint(startCenter)
        .draw();
      return;
    }

    // Cw Ops-adj reticules
    startCenter.segmentToAngle(cwOpsAngle, adj)
      .draw();
    startArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw();
    endArc.radiusSegmentAtAngle(cwAdjAngle)
      .draw();

    // Cc Ops-adj reticules
    let ccOpsAngle = rootAngle.shift(opsAngle, false);
    let ccAdjAngle = rootAngle.shift(adjAngle, false);
    startCenter.segmentToAngle(ccOpsAngle, adj)
      .draw();
    startArc.radiusSegmentAtAngle(ccAdjAngle)
      .draw();
    endArc.radiusSegmentAtAngle(ccAdjAngle)
      .draw();

    // Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, true, true)
      .draw(tangentStroke);
    startArc.segmentTangentToArc(endArc, false, false)
      .draw(tangentSecondaryStroke);

  });


  // Example 3 - Circle to circle, cross
  makeExampleContext(center, rac.Angle.sw, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    let distanceSegment = startCenter.segmentToPoint(endCenter)
      .draw(triangleStroke);

    // Circles
    let startArc = startCenter.arc(startArcRadius)
      .draw(circleStroke);
    let endArc = endCenter.arc(endArcRadius)
      .draw(circleStroke);

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
      .draw(triangleStroke)
      .end;
    let detachedOpsVertex = detachedHypVertex
      .segmentToAngle(cwOpsAngle.inverse(), adj)
      .draw(triangleTangentStroke)
      .end;
    detachedOpsVertex
      .segmentToPoint(detachedAdjVertex)
      .draw(triangleStroke);

    // Attached to detached reticules
    detachedAdjVertex.segmentToPoint(endCenter)
      .draw()
    detachedOpsVertex.segmentToAngle(toDetached.inverse(), startArcRadius + endArcRadius)
      .draw();

    // Detached End Circle reticules
    detachedAdjVertex
      .segmentToAngle(toDetached.inverse(), endArcRadius)
      .arcWithEnd(cwAdjAngle, true)
      .draw()
      .endSegment()
      .draw();

    // Detached Start Circle reticules
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle.inverse(), startArcRadius)
      .arcWithEnd(cwOpsAngle, false)
      .draw()
      .endSegment()
      .draw();
    detachedOpsVertex
      .segmentToAngle(cwAdjAngle.inverse(), startArcRadius)
      .draw()
      .nextSegmentToAngle(cwOpsAngle, adj)
      .draw();

    // Rest of drawing depends on valid angle
    if (angleSine >= 1) {
      endCenter.segmentToAngle(rootAngle.inverse(), ops)
        .draw();
      return;
    }

    // Cw Ops-adj reticules
    startCenter.segmentToAngle(cwOpsAngle, adj)
      .draw();
    endCenter.segmentToAngle(cwAdjAngle, ops)
      .draw();
    startArc.radiusSegmentAtAngle(cwAdjAngle.inverse())
      .draw();

      // Cc Ops-adj reticules
    let ccOpsAngle = rootAngle.shift(opsAngle, false);
    let ccAdjAngle = rootAngle.shift(adjAngle, false);
    startCenter.segmentToAngle(ccOpsAngle, adj)
      .draw();
    endCenter.segmentToAngle(ccAdjAngle, ops)
      .draw();
    startArc.radiusSegmentAtAngle(ccAdjAngle.inverse())
      .draw();

    // Implemented tangent funcition
    startArc.segmentTangentToArc(endArc, false, true)
      .draw(tangentStroke);
    startArc.segmentTangentToArc(endArc, true, false)
      .draw(tangentSecondaryStroke);

  });


  // Example 4 - Construction
  makeExampleContext(center, rac.Angle.se, exampleAngle, exampleDistance,
    (startCenter, endCenter) => {
    // Arcs and reticules
    let sourceRadius = 40;
    let baseSourceArc = endCenter.arc(sourceRadius).withClockwise(false)
      .draw();
    let firstRadius = 40;
    let baseFirstArc = startCenter.arc(firstRadius).withClockwise(false)
      .draw();
    let secondRadius = 80;
    let baseSecondArc = endCenter.arc(secondRadius).withClockwise(false)
      .draw();
    startCenter.segmentToPoint(endCenter)
      .draw();

    let delta = 10;
    let steps = 4;

    for (let index = 0; index < steps; index++) {
      let totalDelta = delta * index;
      let sourceArc = baseSourceArc.withRadius(sourceRadius - totalDelta);
      let firstArc = baseFirstArc.withRadius(firstRadius - totalDelta);
      let secondArc = baseSecondArc.withRadius(secondRadius - totalDelta)
      let endArc = baseFirstArc.withRadius(firstRadius + totalDelta)

      let startTangent = sourceArc
        .segmentTangentToArc(firstArc, true, true);
      let middleTangent = firstArc
        .segmentTangentToArc(secondArc, true, true);
      let endTangent = secondArc
        .segmentTangentToArc(endArc, true, false);
      let cutoffTangent = baseSourceArc
        .segmentTangentToArc(baseFirstArc, true, true);
      // cutoffTangent = cutoffTangent
        // .translateToStart(cutoffTangent.start.pointToAngle(cutoffTangent.angle().perpendicular(), 8));

      // Drawing!
      sourceArc.withStartEndTowardsPoint(startCenter, startTangent.start)
        .draw(tangentStroke);
      startTangent.draw(tangentStroke);

      if (middleTangent !== null) {
        firstArc
          .withStartEndTowardsPoint(startTangent.end, middleTangent.start)
          .draw(tangentStroke);

        middleTangent.draw(tangentStroke);
      }

      if (endTangent === null) {
        if (middleTangent !== null) {
          let chord = secondArc.intersectionChordWithSegment(cutoffTangent);
          secondArc
            .withStartEndTowardsPoint(middleTangent.end, chord.end)
            .draw(tangentStroke);
        }
      } else {
        secondArc = secondArc
          .withStartEndTowardsPoint(middleTangent.end, endTangent.start);

        let chord = secondArc.intersectionChordWithSegment(cutoffTangent);
        if (secondArc.containsProjectedPoint(chord.end)) {
          // cut the arc
          secondArc.withEndTowardsPoint(chord.end)
            .draw(tangentStroke);
        } else {
          secondArc.draw(tangentStroke);
          // cut the tangent
          endTangent.segmentToIntersectionWithSegment(cutoffTangent)
            .draw(tangentStroke);
        }

      }
    }

  });


  // Controls draw on top
  rac.Control.drawControls();


  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}
