"use strict";

console.log(`❎ Running`);

let Rac = null;

const racLocation = window.location.hostname == 'localhost'
  ? 'http://localhost:9001/rac.dev.js'
  // ? 'http://localhost:9001/rac.js'
  : 'https://cdn.jsdelivr.net/gh/lopsae/rac@instanceMode/dist/rac.js';

if (typeof requirejs === "function") {
  console.log(`📚 Requesting rac from: ${racLocation}`);
  requirejs([racLocation], racConstructor => {
    console.log(`📚 Loaded RAC`);
    console.log(`🗃 ${racConstructor.version} ${racConstructor.build}`);
    Rac = racConstructor;
    requirejs(['https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.min.js'], p5Func => {
      console.log(`📚 Loaded p5:${typeof p5Func}`);
      new p5Func(buildSketch);
    });
  });
}


function buildSketch(sketch) {

  let rac = null;

  let angleControl = null;

  sketch.setup = function() {
    rac = new Rac();
    console.log(`📚 New RAC constructed`);
    rac.setupDrawer(sketch);

    angleControl = new Rac.ArcControl(rac, 0, rac.Angle(1));
    angleControl.setValueWithAngleDistance(1/4);
    angleControl.addMarkerAtCurrentValue();

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


    // General measurements
    let startArcRadius = 30;
    let endArcRadius = 80;


    // Center point
    let center = rac.Point.canvasCenter();


    // Controls
    angleControl.anchor = center
      .segmentToAngle(rac.Angle.w, endArcRadius)
      .arc();
    angleControl.knob()
      .segmentToPoint(angleControl.anchor.center)
      .draw();
    angleControl.anchor.startSegment()
      .reverse()
      .segmentToBisector()
      .draw();


    let controledAngle = angleControl.distance();


    center.segmentToAngle(rac.Angle.se, 200).draw();


    // Controls draw on top
    rac.controller.drawControls();


    console.log(`👑 ~finis coronat opus ${sketch.frameCount}`);
  } // draw

} // buildSketch

