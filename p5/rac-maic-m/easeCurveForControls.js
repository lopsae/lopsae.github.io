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

  let lastLineDistance = linesOffset + linesSpacing * (linesCount - 1)
    + noEaseMarkerOffset;
  let lastLineGuide = start.pointToAngle(rac.Angle.s, lastLineDistance)
    .segmentToAngle(rac.Angle.e, 100);

  // NoEase control + marker
  noEaseControl.anchor = start.segmentToAngle(rac.Angle.e, 200);
  noEaseControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .draw(controlMarker);

  // Distance control + marker
  distanceControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 3)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 400);
  distanceControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .draw(controlMarker);

  // AppliedLength control + marker
  appliedLengthControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 6)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 200);
  appliedLengthControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
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

      let rangedEasing = new rac.EasingFunction();
      rangedEasing.prefix = noEaseDistance;
      rangedEasing.inRange = easeDistance;
      rangedEasing.outRange = appliedLength;

      let newlength = rangedEasing.easeRange(lineLength);

      // let lengthRatio = (lineLength - noEaseDistance) / easeDistance;

      // let easing = new rac.EasingFunction();
      // let easedRatio = easing.easeRatio(lengthRatio);
      // let newlength = noEaseDistance + (easedRatio * appliedLength);

      lineStart.segmentToAngle(rac.Angle.e, newlength).draw();
    }
  }


  // Controls draw on top
  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

// Source:
// https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
// f(x) = (t^a)/(t^a+(1-t)^a)

// Ploted:
// https://www.wolframalpha.com/input/?i=%28t%5E2%29%2F%28t%5E2%2B%281-t%29%5E2%29+from+t%3D-1+to+2

// Derivate with max: max slope is 2, at t=1/2 baby!
// https://www.wolframalpha.com/input/?i=derivate+%28t%5E2%29%2F%28t%5E2%2B%281-t%29%5E2%29+max+from+t%3D-1+to+2

// When t is split in half t = (0.5 + t/2), slope becomes 1 at t=1!
// which is a/2
// https://www.wolframalpha.com/input/?i=derivate+%28%280.5+%2B+t%2F2%29%5E2%29%2F%28%280.5+%2B+t%2F2%29%5E2%2B%281-%280.5+%2B+t%2F2%29%29%5E2%29+max+from+t%3D-1+to+2

// a controls the slope at 1/2
// https://www.wolframalpha.com/input/?i=derivate+%28t%5E3%29%2F%28t%5E3%2B%281-t%29%5E3%29+max+from+t%3D-1+to+2

// Comparision of ease function vs t^a
// https://www.wolframalpha.com/input/?i=2%28%28t%2F2%29%5E2%29%2F%28%28t%2F2%29%5E2%2B%281-%28t%2F2%29%29%5E2%29+vs+t%5E2+from+t%3D-1+to+2


