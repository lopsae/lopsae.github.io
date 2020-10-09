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


let angleControl = new rac.ArcControl(1/4, 1);
angleControl.setValueWithArcLength(1/8);
angleControl.addMarkerAtCurrentValue();
rac.Control.controls.push(angleControl);



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
  let distanceToExample = 220;
  let startArcRadius = 30;
  let endArcRadius = 80;
  let distanceBetweenArcs = 150;


  // Center pont
  let center = new rac.Point(width/2, height/2);


  // Angle control
  angleControl.anchor = center
    .pointToAngle(rac.Angle.nw, distanceToExample)
    .segmentToAngle(rac.Angle.e, rac.Control.radius * 4)
    .arcWithEnd(1/4);

  angleControl.center()
    .segmentToPoint(angleControl.anchor.center)
    .draw(secondaryStroke);
  angleControl.anchor.startSegment()
    .reverse()
    .segmentToBisector()
    .draw(secondaryStroke);


  // Arc-tangent segment from point
  let interArc = (new rac.Point(500, 200)).arc(100);
  interArc.draw();

  let interPoint = interArc.center.pointToAngle(angleControl.distance(), 300);

  interPoint.segmentToArcTangent(interArc, true)
    .draw(highlight);

  let interSegment = interPoint.segmentToPoint(interArc.center)
    .draw();

  let distance = interSegment.length();

  let angleSine = interArc.radius / distance;
  let angleRadians = Math.asin(angleSine);
  let angle = rac.Angle.fromRadians(angleRadians);
  let absCwAngle = interSegment.angle().shift(angle, true);
  let absCcAngle = interSegment.angle().shift(angle, false);

  interPoint.segmentToAngle(absCwAngle, distance+100).draw();
  interPoint.segmentToAngle(absCcAngle, distance+100).draw();

  // TODO: function to draw a radiusSegment?
  interArc.center.segmentToAngle(absCwAngle.perpendicular(true), interArc.radius)
    .draw(highlight);

  interArc.center.segmentToAngle(absCcAngle.perpendicular(false), interArc.radius)
    .draw();





  let interArcEnd = center
    .pointToAngle(rac.Angle.ne, distanceToExample)
    .arc(endArcRadius)
    .draw();

  let interArcStart = interArcEnd.center
    .pointToAngle(angleControl.distance(), distanceBetweenArcs)
    .arc(startArcRadius)
    .draw();

  interArcStart.center.segmentToPoint(interArcEnd.center)
    .draw();


  // Controls draw on top
  rac.Control.drawControls();


  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

