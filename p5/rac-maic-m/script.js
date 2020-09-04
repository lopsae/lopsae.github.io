"use strict";


function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
  noFill();
}


function mousePressed(event) {
  rac.pointerPressed(rac.Point.mouse());
  redraw();
}


function mouseDragged(event) {
  rac.pointerDragged(rac.Point.mouse());
  redraw();
}


function mouseReleased(event) {
  rac.pointerReleased();
  redraw();
}


let wideControl = new rac.Control();
wideControl.value = 120;
wideControl.minValue = 10;
rac.controls.push(wideControl);

let thinControl = new rac.Control();
thinControl.value = 10;
rac.controls.push(thinControl);

let angleControl = new rac.Control();
angleControl.value = rac.Angle.from(1/8);
rac.controls.push(angleControl);




function draw() {
  clear();

  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .8), // red,
    marker:      new rac.Color( .7,  .3,  .3,  .3), // rose pink
    fill:        new rac.Color( .8,  .8,  .8,  .9), // whiteish
    controlFill: new rac.Color( .8,  .8,  .8, 1.0), // whiteish
    pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };
  colorScheme.background.applyBackground();

  let mainStroke = colorScheme.stroke.stroke(2);
  mainStroke.apply();

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  wideControl.style = controlStyle;
  thinControl.style = controlStyle;
  angleControl.style = controlStyle;

  rac.pointerStyle = colorScheme.pointer.stroke(3);


  // Start point of M
  let start = new rac.Point(width * 1/4, height * 2/3);

  // Widths for drawing
  let wide = wideControl.value;
  let thin = thinControl.value;


  // Wide control
  wideControl.anchor = start
    .segmentToAngle(rac.Angle.s, rac.Control.radius * 2)
    .draw()
    // TODO: range of control could be a control property?
    .nextSegmentToAngle(rac.Angle.e, 250);

  wideControl.center()
    .segmentToAngle(rac.Angle.n, rac.Control.radius * 2)
    .draw();


  // Angle control
  angleControl.anchor = start
    .segmentToAngle(rac.Angle.w, rac.Control.radius * 5).draw()
    .arc(1/4, false);

  angleControl.center()
    .segmentToPoint(start)
    .draw();


  // Baseline
  let baseline = start.segmentToAngle(rac.Angle.e, wide)
    .draw()
    .attachToShape();

  // First stroke bottom
  let firstStrokeEndBottom = baseline.end
    .segmentToAngle(rac.Angle.ne, wide).draw()
    .attachToShape()
    .end;

  // Second stroke start bottom
  let secondStrokeStartBottom = firstStrokeEndBottom
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, baseline).draw()
    .attachToShape()
    .end;

  // Second stroke end bottom
  let secondStrokeEndBottom = secondStrokeStartBottom
    .segmentToAngle(rac.Angle.ne, wide*2).draw()
    .attachToShape()
    .end;

  let endAscenderGuide = secondStrokeEndBottom
    // End descender
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, baseline).draw()
    .attachToShape()
    // End baseline
    .nextSegmentToAngle(rac.Angle.e, thin).draw()
    .attachToShape()
    // End ascender guide
    .nextSegmentToAngle(rac.Angle.n, wide*3.5).draw();

  // Thin control
  thinControl.anchor = endAscenderGuide.start
    .pointToAngle(rac.Angle.w, thin)
    .segmentToAngle(rac.Angle.s, rac.Control.radius*4)
    .draw()
    .nextSegmentToAngle(rac.Angle.e, 200);

  thinControl.center()
    .segmentToAngle(rac.Angle.n, rac.Control.radius*4)
    .draw();

  // Middle ascender guide
  let middleAscenderGuide = secondStrokeStartBottom
    .segmentToAngle(rac.Angle.e, thin).draw()
    .nextSegmentToAngle(rac.Angle.n, wide*2.5).draw();

  let secondStrokeGuide = baseline.pointAtBisector()
    .segmentToAngle(rac.Angle.ne, wide*4).draw();

  let secondStrokeStartTop = endAscenderGuide
    // End ascender
    .segmentToIntersectionWithSegment(secondStrokeGuide)
    .attachToShape()
    // Second stroke top
    .end.segmentToAngleToIntersectionWithSegment(rac.Angle.sw, middleAscenderGuide)
    .attachToShape()
    .end;

  let firstStrokeTop = baseline.start
    .segmentToAngleToIntersectionWithSegment(rac.Angle.ne, middleAscenderGuide)
    .draw()

  // Middle ascender
  secondStrokeStartTop.segmentToPoint(firstStrokeTop.end)
    .attachToShape();

  // Close shape with first stroke
  firstStrokeTop.reverse()
    .attachToShape();


  rac.popShape().draw(colorScheme.fill.fill());


  // Controls draw on top
  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

