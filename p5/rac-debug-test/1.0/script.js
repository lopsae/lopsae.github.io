"use strict";

console.log(`❎ Running`);

let makeRac = null;

let racLocation = 'http://localhost:9001/rac.js';
// let racLocation = 'https://cdn.jsdelivr.net/gh/lopsae/rac@develop/src/rac.js';

if (typeof requirejs === "function") {
  requirejs([racLocation], makeRacFunc => {
    console.log(`📚 Loaded RAC:${makeRacFunc.version}`);
    makeRac = makeRacFunc;
    requirejs(['https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.min.js'], p5Func => {
      console.log(`📚 Loaded p5:${typeof p5Func}`);
      new p5Func(buildSketch);
    });
  });
}


// d3.require("p5@1.0.0").then(p5 => {
//   console.log(`loaded p5`);
//   d3.require("./rac-0.9.9.x.js").then(rac => {
//     window.rac = rac;
//     console.log(`loaded rac`);
//   });
// });


function buildSketch(sketch) {

  let rac = null;

  let distanceControl = null;
  let angleControl = null;

  sketch.setup = function() {
    rac = makeRac();
    rac.setupDrawer(sketch);

    distanceControl = new rac.SegmentControl(0, 300);
    distanceControl.setValueWithLength(140);
    distanceControl.setLimitsWithLengthInsets(0.1, 0);
    rac.Control.controls.push(distanceControl);

    angleControl = new rac.ArcControl(1/4, 1);
    angleControl.setValueWithAngleDistance(1/4);
    angleControl.addMarkerAtCurrentValue();
    rac.Control.controls.push(angleControl);

    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.noLoop();
    sketch.noStroke();
    sketch.noFill();
  };


  sketch.windowResized = function() {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };


  sketch.mousePressed = function(event) {
    rac.Control.pointerPressed(rac.Point.pointer());
    sketch.redraw();
  }


  let lapses = [];
  sketch.mouseDragged = function(event) {
    rac.Control.pointerDragged(rac.Point.pointer());


    let start = performance.now();
    sketch.redraw();
    let elapsed = performance.now() - start;
    if (lapses.length > 40) {
      lapses.shift();
    }

    lapses.push(elapsed*1000);
    let sum = lapses.reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    });
    console.log(`⏰ mouseDragged count: ${lapses.length} avg-elapsed:${sum/lapses.length}`);
  }


  sketch.mouseReleased = function(event) {
    rac.Control.pointerReleased(rac.Point.pointer());
    sketch.redraw();
  }


  function makeExampleContext(center, exampleAngle, arcsAngle, arcsDistance, closure) {
    let distanceToExample = 250;
    let egCenter = center.pointToAngle(exampleAngle, distanceToExample);
    let movingCenter = egCenter.pointToAngle(arcsAngle, arcsDistance);

    closure(egCenter, movingCenter);
  }


  let verbose = true;

  sketch.draw = function() {
    sketch.clear();

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

    // Text style
    palette.richBlack.withAlpha(.6).stroke(3)
      .styleWithFill(palette.tiffanyBlue)
      .applyToClass(rac.Text);

    // debug style
    rac.drawer.debugStyle = palette.purpleX11.stroke(2);
    rac.drawer.debugTextStyle = palette
      .richBlack.withAlpha(0.5).stroke(2)
      .styleWithFill(palette.purpleX11);

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


    // Center point
    let center = new rac.Point.canvasCenter();


    // Controls
    angleControl.anchor = center
      .segmentToAngle(rac.Angle.w, endArcRadius)
      .arc();
    angleControl.center()
      .segmentToPoint(angleControl.anchor.center)
      .draw();
    angleControl.anchor.startSegment()
      .reverse()
      .segmentToBisector()
      .draw();

    distanceControl.anchor = center
      .segmentToAngle(angleControl.distance(), 100);

    let exampleAngle = angleControl.distance();
    let exampleDistance = distanceControl.distance();


    // Example 1 - Arc-tangent segment from point
    makeExampleContext(center, rac.Angle.nw, exampleAngle, exampleDistance,
      (endCenter, startCenter) => {
      let endArc = endCenter
        .segmentToAngle(rac.Angle.w, endArcRadius)
        .arc();

      endArc.center.arc(120, rac.Angle.ne, exampleAngle.add(1/10)).draw().debug(verbose);
      endArc.center.addX(-200).debugAngle(exampleAngle, verbose);
      exampleAngle.negative().debug(
        angleControl.anchor.center.addY(-200));

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
        .draw(triangleStroke)
        .debug()
        .translatePerpendicular(100)
        .draw()
        .debug(verbose);

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

      let angleTextFormat = new rac.Text.Format(
        rac.Text.Format.horizontal.left,
        rac.Text.Format.vertical.center,
        "Spot Mono",
        rac.Angle.e);
      endCenter
        .pointToAngle(rac.Angle.e, 4)
        .text(`${angleControl.value.toFixed(3)}`, angleTextFormat)
        .draw();

      startCenter.draw().debug().addX(100).debug(verbose);

    }); // Example 1


    // Example 2 - Circle to circle, external
    makeExampleContext(center, rac.Angle.ne, exampleAngle, exampleDistance,
      (endCenter, startCenter) => {
      let distanceSegment = startCenter.segmentToPoint(endCenter)
        .draw(triangleStroke);

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

      endCenter.arc(10).draw().debug();
      startCenter.arc(1).draw().debug();

      detachedAdjVertex.arc(10, rac.Angle.w, rac.Angle.n).draw().debug();
      detachedOpsVertex.arc(1, rac.Angle.w, rac.Angle.n).draw().debug();

    }); // Example 2


    // Example 3 - Circle to circle, cross
    makeExampleContext(center, rac.Angle.sw, exampleAngle, exampleDistance,
      (endCenter, startCenter) => {
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

      endCenter.arc(100, rac.Angle.se, exampleAngle.inverse(), false).draw().debug(verbose);

      detachedAdjVertex.arc(21, rac.Angle.w, rac.Angle.n).draw().debug();
      detachedOpsVertex.arc(21, rac.Angle.n, rac.Angle.n).draw().debug();
      // detachedAdjVertex.arc(22* 2/3, rac.Angle.w, rac.Angle.n).draw().debug();
      // detachedOpsVertex.arc(22* 2/3, rac.Angle.n, rac.Angle.n).draw().debug();

    }); // Example 3


    // Example 4
    makeExampleContext(center, rac.Angle.se, exampleAngle, exampleDistance,
      (egCenter, movingCenter) => {
      egCenter.debug();
      movingCenter.debug(verbose);

    }); // Example 4


    // Controls draw on top
    rac.Control.drawControls();


    // console.log(`👑 ~finis coronat opus ${sketch.frameCount}`);
  } // draw

} // buildSketch







