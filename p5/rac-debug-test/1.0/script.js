"use strict";

console.log(`❎ Running`);

let Rac = null;

const racLocation = window.location.hostname == 'localhost'
  ? 'http://localhost:9001/rac.js'
  : 'https://cdn.jsdelivr.net/gh/lopsae/rac@instanceMode/dist/rac.js';

if (typeof requirejs === "function") {
  console.log(`📚 Requesting rac from: ${racLocation}`);
  requirejs([racLocation], racConstructor => {
    console.log(`📚 Loaded RAC:${racConstructor.version}`);
    Rac = racConstructor;
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
    rac = new Rac();
    console.log(`📚 New RAC:${rac.version}`);
    rac.setupDrawer(sketch);

    distanceControl = new Rac.SegmentControl(rac, 0, 300);
    distanceControl.setValueWithLength(140);
    Rac.Control.controls.push(distanceControl);

    angleControl = new Rac.ArcControl(rac, 0, 1);
    angleControl.setValueWithAngleDistance(1/4);
    angleControl.addMarkerAtCurrentValue();
    Rac.Control.controls.push(angleControl);

    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.noLoop();
    sketch.noStroke();
    sketch.noFill();
  };


  sketch.windowResized = function() {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };


  sketch.mousePressed = function(event) {
    Rac.Control.pointerPressed(rac, rac.Point.pointer());
    sketch.redraw();
  }


  let lapses = [];
  sketch.mouseDragged = function(event) {
    Rac.Control.pointerDragged(rac, rac.Point.pointer());


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
    Rac.Control.pointerReleased(rac, rac.Point.pointer());
    sketch.redraw();
  }


  function makeExampleContext(center, exampleAngle, arcsAngle, arcsDistance, closure) {
    let distanceToExample = 250;
    let egCenter = center.pointToAngle(exampleAngle, distanceToExample);
    let movingCenter = egCenter.pointToAngle(arcsAngle, arcsDistance);

    closure(egCenter, movingCenter);
  }


  // Debug verbose
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
    palette.babyPowder.withAlpha(.5).stroke(2).apply();

    // Text style
    palette.richBlack.withAlpha(.6).stroke(3)
      .styleWithFill(palette.tiffanyBlue)
      .applyToClass(Rac.Text);

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

    Rac.Control.controls.forEach(item => item.style = controlStyle);
    Rac.Control.pointerStyle = palette.babyPowder.withAlpha(.5).stroke(2);


    // General measurements
    let startArcRadius = 30;
    let endArcRadius = 80;


    // Center point
    let center = rac.Point.canvasCenter();


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

    let controlAngle = angleControl.distance();
    let controlDistance = distanceControl.distance();


    rac.Segment.canvasTop().draw(tangentStroke);
    rac.Segment.canvasLeft().draw(tangentStroke);
    rac.Segment.canvasBottom().draw(tangentStroke);
    rac.Segment.canvasRight().draw(tangentStroke);

    rac.Ray(center.x, 200, controlAngle.add(rac.Angle.se)).draw(tangentStroke);
    rac.Ray(center.x, 200, controlAngle.add(rac.Angle.ses)).draw();
    rac.Ray(center.x, 200, controlAngle.add(rac.Angle.see)).draw(tangentSecondaryStroke);

    // Example 1 - A
    makeExampleContext(center, rac.Angle.nw, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      // Variable radius arc, clockwise
      egCenter.arc(controlDistance, rac.Angle.sw, controlAngle)
        .draw().debug(verbose);

    }); // Example 1


    // Example 2 - B
    makeExampleContext(center, rac.Angle.ne, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      egCenter.segmentToPoint(movingCenter, controlAngle)
        // Segment
        .draw().debug()
        // Segment verbose
        .translatePerpendicular(70, true)
        .draw().debug(verbose);

      egCenter
        // Angle through point
        .addX(100).debugAngle(controlAngle, verbose)
        .addY(-100).push();
      // Angle through angle
      controlAngle.negative().debug(Rac.stack.pop());

    }); // Example 2


    // Example 3 - C
    makeExampleContext(center, rac.Angle.sw, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      // Variable radius arc, counter-clockwise
      egCenter.arc(controlDistance, rac.Angle.sw, controlAngle, false)
        .draw().debug(verbose);

    }); // Example 3


    // Example 4 - D
    makeExampleContext(center, rac.Angle.se, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      // Point
      egCenter.debug();
      // Point verbose
      movingCenter.debug(verbose);

      let translatedSegment = egCenter
        .segmentToPoint(movingCenter, controlAngle)
        .translatePerpendicular(100, true)
        .draw();

      // Small complete-circle arc
      translatedSegment.startPoint()
        .arc(10).draw().debug();
      // Tiny complete-circle arc
      translatedSegment.endPoint()
        .arc(1, rac.Angle.w, rac.Angle.w, false).draw().debug();

      translatedSegment = egCenter
        .segmentToPoint(movingCenter, controlAngle)
        .translatePerpendicular(100, false)
        .draw();

      // Small arc
      translatedSegment.startPoint()
        .arc(10, rac.Angle.w, rac.Angle.n).draw().debug();
      // Tiny arc
      translatedSegment.endPoint()
        .arc(1, rac.Angle.w, rac.Angle.n, false).draw().debug();

    }); // Example 4


    // Controls draw on top
    Rac.Control.drawControls(rac);


    // console.log(`👑 ~finis coronat opus ${sketch.frameCount}`);
  } // draw

} // buildSketch

