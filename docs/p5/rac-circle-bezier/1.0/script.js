"use strict";

console.log(`❎ Running circle-bezier`);

let Rac = null;

const racLocation = window.location.hostname == 'localhost'
  ? 'http://localhost:9001/rac.dev.js'
  // ? 'http://localhost:9001/rac.js'
  // ? 'http://localhost:9001/rac.min.js'
  // ? 'https://cdn.jsdelivr.net/gh/lopsae/rac/dist/rac.js'
  : 'https://cdn.jsdelivr.net/gh/lopsae/rac/dist/rac.js'

if (typeof requirejs === "function") {
  console.log(`📚 Requesting rac from: ${racLocation}`);
  requirejs([racLocation], racConstructor => {
    console.log('📚 Loaded RAC');
    console.log(`🗃 Rac.version: ${racConstructor.version} ${racConstructor.build}`);
    Rac = racConstructor;
    requirejs(['https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.min.js'], p5Func => {
      console.log(`📚 Loaded p5:${typeof p5Func}`);
      new p5Func(buildSketch);
    });
  });
}


function buildSketch(sketch) {

  let rac = null;

  let angleAControl = null;
  let angleBControl = null;

  sketch.setup = function() {
    rac = new Rac();
    console.log('📚 New RAC constructed');
    rac.setupDrawer(sketch);

    angleAControl = new Rac.ArcControl(rac, 0, rac.Angle(1));
    angleAControl.setValueWithAngleDistance(0/4);
    angleAControl.addMarkerAtCurrentValue();

    angleBControl = new Rac.ArcControl(rac, 0, rac.Angle(1));
    angleBControl.setValueWithAngleDistance(1/4);
    angleBControl.addMarkerAtCurrentValue();

    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.noLoop();
    sketch.noStroke();
    sketch.noFill();
  };


  sketch.windowResized = function() {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };


  sketch.mousePressed = function(event) {
    rac.controller.pointerPressed(rac.Point.pointer());
    sketch.redraw();
  }


  sketch.mouseDragged = function(event) {
    rac.controller.pointerDragged(rac.Point.pointer());
    sketch.redraw();
  }


  sketch.mouseReleased = function(event) {
    rac.controller.pointerReleased(rac.Point.pointer());
    sketch.redraw();
  }


  sketch.draw = function() {
    sketch.clear();

    // https://coolors.co/011627-fdfffc-2ec4b6-e71d36-ff9f1c-9e22f1
    let palette = {
      richBlack:   rac.Color.fromHex('011627'),
      babyPowder:  rac.Color.fromHex('fdfffc'),
      tiffanyBlue: rac.Color.fromHex('2ec4b6'),
      roseMadder:  rac.Color.fromHex('e71d36'),
      orangePeel:  rac.Color.fromHex('ff9f1c'),
      purpleX11:   rac.Color.fromHex('9e22f1')
    };

    // Root styles
    palette.richBlack.applyBackground();
    // Default style mostly used for reticules
    palette.babyPowder.withAlpha(.5).stroke(2).apply();

    // Text style
    palette.richBlack.withAlpha(.6).stroke(3)
      .appendFill(palette.tiffanyBlue)
      .applyToClass(Rac.Text);

    // debug style
    rac.drawer.debugStyle = palette.purpleX11.stroke(2);
    rac.drawer.debugTextStyle = palette
      .richBlack.withAlpha(0.5).stroke(2)
      .appendFill(palette.purpleX11);

    // Styles
    let tangentStroke =          palette.orangePeel.stroke(4);
    let tangentSecondaryStroke = tangentStroke.withAlpha(.5);
    let triangleTangentStroke =  palette.tiffanyBlue.stroke(3);
    let triangleStroke =         palette.tiffanyBlue.stroke(2).withAlpha(.7);
    let circleStroke =           palette.roseMadder.stroke(2);


    rac.controller.pointerStyle = palette.babyPowder.withAlpha(.5).stroke(2);
    rac.controller.controlStyle = circleStroke.withWeight(3)
      .appendFill(palette.babyPowder.fill());


    // Center point
    let center = rac.Point.canvasCenter();


    // General measurements
    let lengthA = 200;
    let lengthB = 200;


    // Controls
    angleAControl.anchor = center
      .segmentToAngle(rac.Angle.half, 70)
      .arc();
    angleAControl.knob()
      .segmentToPoint(center)
      .draw();

    angleBControl.anchor = center
      .segmentToAngle(rac.Angle.half, 120)
      .arc();
    angleBControl.knob()
      .segmentToPoint(center)
      .draw();

    let angleA = angleAControl.distance();
    let angleB = angleBControl.distance();


    // Angle dividers
    let quarterAngle = angleA.distance(angleB).mult(1/4);
    center.ray(angleA.shift(quarterAngle.mult(1))).draw();
    center.ray(angleA.shift(quarterAngle.mult(2))).draw();
    center.ray(angleA.shift(quarterAngle.mult(3))).draw();


    // Radius A
    let rayA = center
      .segmentToAngle(angleA, lengthA).draw()
      .endPoint().ray(angleA.perpendicular()).draw(tangentSecondaryStroke);

    rayA.segment(quarterAngle.tan() * lengthA * 4/3).draw(tangentStroke);



    // Radius B
    let rayB = center
      .segmentToAngle(angleB, lengthB).draw()
      .endPoint().ray(angleB.perpendicular(false)).draw(tangentSecondaryStroke);

    rayB.segment(quarterAngle.tan() * lengthB * 4/3).draw(tangentStroke);


    // Ray intersection
    let rayIntersection = rayA.pointAtIntersection(rayB);
    if (rayIntersection !== null) {
      rayIntersection.debug();
    }



    // let fiveCurveOne = new Rac.Bezier(rac,
    //   fiveAscenderBottom,
    //   fiveCurveOneControlSegmentOne.pointAtLengthRatio(0.552284749831).debug(),
    //   fiveCurveOneControlSegmentTwo.pointAtLengthRatio(0.552284749831).debug(),
    //   fiveCurveAnchorOne);
    // fiveCurveOne.draw();


    // Controls draw on top
    rac.controller.drawControls();


    console.log(`👑 ~finis coronat opus ${sketch.frameCount}`);
  } // draw

} // buildSketch

