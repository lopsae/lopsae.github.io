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


let noEaseControl = new rac.Control();
noEaseControl.value = 100;
rac.controls.push(noEaseControl);

let distanceControl = new rac.Control();
distanceControl.value = rac.Control.radius * 10;
rac.controls.push(distanceControl);

let appliedLengthControl = new rac.Control();
appliedLengthControl.value = rac.Control.radius * 5;
rac.controls.push(appliedLengthControl);




function draw() {
  clear();

  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .8), // red,
    rosePink:    new rac.Color( .7,  .3,  .3,  .5),
    fill:        new rac.Color( .8,  .8,  .8,  .9), // whiteish
    controlFill: new rac.Color( .1,  .1,  .1), // blackish
    pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };
  colorScheme.background.applyBackground();

  let mainStroke = colorScheme.stroke.stroke(2);
  mainStroke.apply();

  let controlMarker = colorScheme.rosePink.withAlpha(.3).stroke(2);
  let noEaseMarker = colorScheme.rosePink.withAlpha(.5).stroke(2);

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  noEaseControl.style = controlStyle;
  distanceControl.style = controlStyle;
  appliedLengthControl.style = controlStyle;

  rac.pointerStyle = colorScheme.pointer.stroke(3);


  let start  = new rac.Point(100, 100);

  let linesOffset = rac.Control.radius * 2;
  let linesSpacing = 10;
  let linesStep = 10;
  let linesCount = 50;

  let noEaseMarkerOffset = 3;

  let lastLinePos = linesOffset + linesSpacing * (linesCount - 1)
    + noEaseMarkerOffset;

  // NoEase control + marker
  noEaseControl.anchor = start.segmentToAngle(rac.Angle.e, 200);
  noEaseControl.center().segmentToAngle(rac.Angle.s, lastLinePos)
    .draw(controlMarker);

  // Distance control + marker
  distanceControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 3)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 400);
  distanceControl.center().segmentToAngle(rac.Angle.s, lastLinePos)
    .draw(controlMarker);

  // AppliedLength control + marker
  appliedLengthControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 6)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 200);
  appliedLengthControl.center().segmentToAngle(rac.Angle.s, lastLinePos)
    .draw(controlMarker);

  let noEaseDistance = noEaseControl.value;
  let easeDistance = distanceControl.value;
  let appliedLength = appliedLengthControl.value;

  for (let index = 0; index < linesCount; index++) {
    let linePos = linesOffset + linesSpacing * index;
    let lineStart = start.pointToAngle(rac.Angle.s, linePos);

    let lineLength = linesStep * index;

    if (lineLength < noEaseDistance) {
      lineStart.segmentToAngle(rac.Angle.e, lineLength).draw();
    } else {
      // No ease marker
      lineStart.pointToAngle(rac.Angle.s, noEaseMarkerOffset)
        .segmentToAngle(rac.Angle.e, lineLength).draw(noEaseMarker);

      let lengthRatio = (lineLength - noEaseDistance) / easeDistance;
      // https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
      // f(x) = (t^a)/(t^a+(1-t)^a)
      let a = 2;
      let t = lengthRatio;
      let easeRatio = Math.pow(t,a) / (Math.pow(t,a) + Math.pow(1-t,a));
      let newlength = noEaseDistance + (easeRatio * appliedLength);

      lineStart.segmentToAngle(rac.Angle.e, newlength).draw();
    }
  }


  // Controls draw on top
  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

