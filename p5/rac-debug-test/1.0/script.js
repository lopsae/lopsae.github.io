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

    let controlAngle = angleControl.distance();
    let controlDistance = distanceControl.distance();


    // Example 1 - A
    makeExampleContext(center, rac.Angle.nw, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      egCenter.arc(120, rac.Angle.ne, controlAngle.add(1/10)).draw().debug(verbose);
      egCenter
        .addX(-150).debugAngle(controlAngle, verbose)
        .addY(-100).push();
      controlAngle.negative().debug(rac.stack.pop());

      egCenter.addY(-150)
        .segmentToAngle(controlAngle, controlDistance)
        .debug()
        .translatePerpendicular(100)
        .draw()
        .debug(verbose);
    }); // Example 1


    // Example 2 - B
    makeExampleContext(center, rac.Angle.ne, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      egCenter.arc(10).draw().debug();
      movingCenter.arc(1).draw().debug();

      let translatedSegment = egCenter
        .segmentToAngle(controlAngle, controlDistance)
        .draw()
        .translatePerpendicular(100)
        .draw();

      translatedSegment.start
        .arc(10, rac.Angle.w, rac.Angle.n).draw().debug();
      translatedSegment.end
        .arc(1, rac.Angle.w, rac.Angle.n).draw().debug();

    }); // Example 2


    // Example 3 - C
    makeExampleContext(center, rac.Angle.sw, controlAngle, controlDistance,
      (egCenter, movingCenter) => {

      egCenter.arc(100, rac.Angle.se, controlAngle.inverse(), false)
        .draw().debug(verbose);

      let translatedSegment = egCenter
        .segmentToAngle(controlAngle, controlDistance)
        .draw()
        .translatePerpendicular(100, false)
        .draw();

      translatedSegment.start
        .arc(21, rac.Angle.w, rac.Angle.n).draw().debug();
      translatedSegment.end
        .arc(21, rac.Angle.n, rac.Angle.n).draw().debug();
      // translatedSegment.start.arc(22* 2/3, rac.Angle.w, rac.Angle.n).draw().debug();
      // translatedSegment.end.arc(22* 2/3, rac.Angle.n, rac.Angle.n).draw().debug();

    }); // Example 3


    // Example 4 - D
    makeExampleContext(center, rac.Angle.se, controlAngle, controlDistance,
      (egCenter, movingCenter) => {
      egCenter.debug();
      movingCenter.debug(verbose);

    }); // Example 4


    // Controls draw on top
    rac.Control.drawControls();


    // console.log(`👑 ~finis coronat opus ${sketch.frameCount}`);
  } // draw

} // buildSketch







