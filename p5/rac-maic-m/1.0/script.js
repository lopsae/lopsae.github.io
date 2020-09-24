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

let initialMeasure = 120;

let angleControl = new rac.ArcControl(1/4, 1/2);
angleControl.setLimitsWithRatioInsets(0.05, 0.05);
angleControl.addMarkerAtCurrentValue();
rac.Control.controls.push(angleControl);

let firstStrokeWidthControl = new rac.SegmentControl(0, 250);
firstStrokeWidthControl.setValueWithLength(initialMeasure);
firstStrokeWidthControl.addMarkerAtCurrentValue();
firstStrokeWidthControl.setLimitsWithLengthInsets(10, 0);
rac.Control.controls.push(firstStrokeWidthControl);

let secondStrokeWidthControl = new rac.SegmentControl(0, 250);
secondStrokeWidthControl.setValueWithLength(Math.sqrt(2)*initialMeasure/2 + initialMeasure/2);
secondStrokeWidthControl.addMarkerAtCurrentValue();
rac.Control.controls.push(secondStrokeWidthControl);

let thinControl = new rac.SegmentControl(0, 150);
thinControl.setValueWithLength(initialMeasure/5);
thinControl.addMarkerAtCurrentValue();
rac.Control.controls.push(thinControl);

let firstOpeningControl = new rac.SegmentControl(0, 250);
firstOpeningControl.setValueWithLength(initialMeasure);
firstOpeningControl.addMarkerAtCurrentValue();
rac.Control.controls.push(firstOpeningControl);

let secondOpeningControl = new rac.SegmentControl(0, 300);
secondOpeningControl.setValueWithLength(Math.sqrt(2)*initialMeasure);
secondOpeningControl.addMarkerAtCurrentValue();
rac.Control.controls.push(secondOpeningControl);



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


  // Start point of M
  let start = new rac.Point(width * 1/4, height * 2/3);

  // Values for drawing
  let angle = angleControl.distance().negative();
  let firstStrokeWidth = firstStrokeWidthControl.distance();
  let secondStrokeWidth = secondStrokeWidthControl.distance();
  let thin = thinControl.distance();

  let firstOpening = firstOpeningControl.distance();
  let secondOpening = secondOpeningControl.distance();


  // Angle control
  angleControl.anchor = start
    .segmentToAngle(rac.Angle.w, rac.Control.radius * 6)
    .arcWithEnd(1/4, false);

  angleControl.center()
    .segmentToPoint(start)
    .draw(secondaryStroke);
  angleControl.anchor.startSegment()
    .reverse()
    .segmentToBisector()
    .draw(secondaryStroke);


  // First stroke width control
  firstStrokeWidthControl.anchor = start
    .segmentToAngle(rac.Angle.s, rac.Control.radius * 3)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.e, 100);

  firstStrokeWidthControl.center()
    .segmentToAngle(rac.Angle.n, rac.Control.radius * 2)
    .draw(secondaryStroke);


  // Baseline
  let baseline = start.segmentToAngle(rac.Angle.e, firstStrokeWidth)
    .draw()
    .attachToShape();

  // First stroke bottom
  let firstStrokeEndBottom = baseline
    .nextSegmentToAngle(angle, firstOpening)
    .draw()
    .attachToShape()
    .end;

  // First stroke top guide
  let firstStrokeTopGuide = baseline.start
    .segmentToAngle(angle, 100);

  // First opening control
  firstOpeningControl.anchor = baseline.end
    .segmentToAngleToIntersectionWithSegment(angle.perpendicular(false), firstStrokeTopGuide)
    .withEndExtended(rac.Control.radius*2)
    .draw(secondaryStroke)
    .nextSegmentToAngle(angle, 100);

  firstOpeningControl.center()
    .segmentToAngle(angle.perpendicular(), rac.Control.radius*1.5)
    .draw(secondaryStroke);

  // First opening control reticule
  firstStrokeEndBottom
    .segmentToAngleToIntersectionWithSegment(angle.perpendicular(false), firstStrokeTopGuide)
    .draw(secondaryStroke);

  // Middle descender
  let middleDescender = firstStrokeEndBottom
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, baseline)
    .draw()
    .attachToShape();

  // Second stroke start bottom
  let secondStrokeStartBottom = middleDescender.end;

  // Arc for baseline opening guide
  let baselineAtFirstStrokeBottomGuideS = baseline.reverse()
    .arcWithEnd(angle).draw(secondaryStroke)
    .endPoint().segmentToAngle(rac.Angle.s, 100);
  baselineAtFirstStrokeBottomGuideS.start
    .segmentToPoint(baseline.end).draw(secondaryStroke);
  baselineAtFirstStrokeBottomGuideS
    .segmentToIntersectionWithSegment(baseline).draw(secondaryStroke);

  // Openings base size reticule
  let reticule = 5;
  let baselineAtFirstStrokeWidth = baseline.end
    .pointToAngle(rac.Angle.s, reticule*2)
    .segmentToAngle(rac.Angle.s, reticule).draw()
    .end.segmentToAngleToIntersectionWithSegment(rac.Angle.e, baselineAtFirstStrokeBottomGuideS).draw();
  baselineAtFirstStrokeWidth
    .nextSegmentToAngle(rac.Angle.n, reticule).draw();
  baselineAtFirstStrokeWidth
    .pointAtBisector().segmentToAngle(rac.Angle.s, reticule*4).draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.e, baselineAtFirstStrokeWidth.length()*1.5).draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.n, reticule*2).draw(secondaryStroke)
    .push()
    .nextSegmentToAngle(rac.Angle.e, baselineAtFirstStrokeWidth.length()).draw()
    .nextSegmentToAngle(rac.Angle.n, reticule).draw()
    .pop()
    .nextSegmentToAngle(rac.Angle.w, baselineAtFirstStrokeWidth.length()).draw()
    .nextSegmentToAngle(rac.Angle.n, reticule).draw();


  let endDescenderGuide = secondStrokeStartBottom
    .pointToAngle(rac.Angle.e, secondOpening)
    .segmentToAngle(rac.Angle.n, 100);

  // Second stroke end bottom
  let secondStrokeEndBottom = secondStrokeStartBottom
    .segmentToAngleToIntersectionWithSegment(angle, endDescenderGuide)
    .draw()
    .attachToShape()
    .end;

  // End ascender guide
  let endAscenderGuide = secondStrokeEndBottom
    // End descender
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, baseline).draw()
    .attachToShape()
    // End baseline
    .nextSegmentToAngle(rac.Angle.e, thin).draw()
    .attachToShape()
    // End ascender guide
    .nextSegmentToAngle(rac.Angle.n, 100);

  // Second opening control
  secondOpeningControl.anchor = endAscenderGuide.start
    .segmentToAngle(rac.Angle.e, rac.Control.radius*4.5)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.n, 100);
  secondOpeningControl.center()
    .segmentToAngle(rac.Angle.w, rac.Control.radius*4)
    .draw(secondaryStroke);

  // Second opening control arc reticule
  secondStrokeStartBottom.segmentToAngle(rac.Angle.e, secondOpening)
    .reverse()
    .arcWithEnd(rac.Angle.n)
    .draw(secondaryStroke)
    .endPoint().segmentToAngle(rac.Angle.e, thin)
    .draw(secondaryStroke);

  // Second stroke width control
  secondStrokeWidthControl.anchor = secondStrokeEndBottom
    .segmentToAngleToIntersectionWithSegment(angle, endAscenderGuide)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.e, rac.Control.radius*2)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.n, 100);
  secondStrokeWidthControl.center()
    .segmentToAngle(rac.Angle.w, rac.Control.radius*1.5)
    .draw(secondaryStroke);

  // Second stroke guide
  let secondStrokeGuide = secondStrokeStartBottom
    .pointToAngle(rac.Angle.w, secondStrokeWidth)
    .segmentToAngle(angle, 100);

  // Middle ascender guide
  let middleAscenderGuide = secondStrokeStartBottom
    .segmentToAngle(rac.Angle.e, thin)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.n, 100);

  middleAscenderGuide
    .segmentToIntersectionWithSegment(secondStrokeGuide)
    .draw(secondaryStroke);

  // End ascender
  let endAscender = endAscenderGuide
    .segmentToIntersectionWithSegment(secondStrokeGuide)
    .draw()
    .attachToShape();

  // Thin control
  thinControl.anchor = endAscender.start
    .segmentToAngle(rac.Angle.e, rac.Control.radius*2)
    .draw(secondaryStroke)
    .nextSegmentToAngle(rac.Angle.n, 100);
  thinControl.center()
    .segmentToAngle(rac.Angle.w, rac.Control.radius*1.5)
    .draw(secondaryStroke);

  // Thin control arc reticule
  endAscender.start.segmentToAngle(rac.Angle.w, thin)
    .arcWithEnd(rac.Angle.n)
    .draw(secondaryStroke);

  // Baseline bisector reticule
  baseline.pointAtBisector()
    .segmentToAngleToIntersectionWithSegment(angle, endAscenderGuide)
    .draw(secondaryStroke)
    .nextSegmentToPoint(endAscender.end)
    .draw(secondaryStroke);

  // Second stroke start top
  let secondStrokeStartTop = endAscender.end
    .segmentToAngleToIntersectionWithSegment(angle.inverse(), middleAscenderGuide)
    .draw()
    .attachToShape()
    .end;

  let firstStrokeTop = firstStrokeTopGuide
    .segmentToIntersectionWithSegment(middleAscenderGuide);

  // Middle ascender
  secondStrokeStartTop.segmentToPoint(firstStrokeTop.end)
    .draw()
    .attachToShape();

  // Close shape with first stroke
  firstStrokeTop.reverse()
    .draw()
    .attachToShape();


  rac.popShape().draw(colorScheme.fill.fill());


  // Controls draw on top
  rac.Control.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

