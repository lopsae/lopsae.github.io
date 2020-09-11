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
  rac.pointerReleased(rac.Point.mouse());
  redraw();
}

// TODO: static control function to create and push
let noEaseControl = new rac.Control();
noEaseControl.value = 100;
rac.Control.controls.push(noEaseControl);

let distanceControl = new rac.Control();
distanceControl.value = 250;
rac.Control.controls.push(distanceControl);

let appliedLengthControl = new rac.Control();
appliedLengthControl.value = 100;
rac.Control.controls.push(appliedLengthControl);

let ratioOffsetControl = new rac.Control();
ratioOffsetControl.value = 100;
rac.Control.controls.push(ratioOffsetControl);

let ratioFactorControl = new rac.Control();
ratioFactorControl.value = 125;
rac.Control.controls.push(ratioFactorControl);

let easeOffsetControl = new rac.Control();
easeOffsetControl.value = 100;
rac.Control.controls.push(easeOffsetControl);

let easeFactorControl = new rac.Control();
easeFactorControl.value = 125;
rac.Control.controls.push(easeFactorControl);




function draw() {
  clear();

  let colorScheme = {
    main:       rac.Color.fromRgba(249, 65, 68), // bright red
    util:       rac.Color.fromRgba(243, 114, 44), // orange
    continuous: rac.Color.fromRgba(248, 150, 30), // bright orange
    // 249, 199, 79 // yellow
    // 144, 190, 109 // greenish
    control:    rac.Color.fromRgba(67, 170, 139), // cyanish
    background: rac.Color.fromRgba(22, 31, 39),
    rosePink:   new rac.Color( .7,  .3,  .3),
    brightRose: new rac.Color( .9,  .4,  .4),
    fill:       new rac.Color( .8,  .8,  .8,  .9), // whiteish
    pointer:    new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:  new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };

  // Default root styles
  colorScheme.background.applyBackground();
  colorScheme.main.stroke(2).apply();

  // Text style
  colorScheme.background.withAlpha(.6).stroke(3)
    .styleWithFill(colorScheme.brightRose.fill())
    .applyToClass(rac.Text);

  let rangesMarker = colorScheme.util.withAlpha(.5).stroke(2);
  let continuousMarker = colorScheme.continuous.withAlpha(.5).stroke(2);
  let controlMarker = colorScheme.control.withAlpha(.5).stroke(2);
  let noEaseMarker = colorScheme.util.withAlpha(.3).stroke(2);

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.main.stroke(3)
    .styleWithFill(colorScheme.background.fill());

  rac.Control.controls.forEach(item => item.style = controlStyle);

  rac.Control.pointerStyle = colorScheme.pointer.stroke(3);


  let start  = new rac.Point(100, 100);

  let linesOffset = rac.Control.radius * 2;
  let linesStep = 12;
  let linesCount = 45;

  let controlMarkerOffset = 3;
  let continuousMarkerOffset = 6
  let noEaseMarkerOffset = 9;

  let lastMarkerOffset = noEaseMarkerOffset;

  let lastLineDistance = linesOffset + linesStep * (linesCount - 1)
    + lastMarkerOffset;
  let lastLineGuide = start.pointToAngle(rac.Angle.s, lastLineDistance)
    .segmentToAngle(rac.Angle.e, 100);

  // NoEase control + marker
  noEaseControl.anchor = start.segmentToAngle(rac.Angle.e, 300);
  noEaseControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .draw(rangesMarker);

  // Distance control + marker
  distanceControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 3)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 400);
  distanceControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .draw(rangesMarker);

  // AppliedLength control + marker
  appliedLengthControl.anchor = start.pointToAngle(rac.Angle.s, rac.Control.radius * 6)
    .pointToAngle(rac.Angle.e, noEaseControl.value)
    .segmentToAngle(rac.Angle.e, 200);
  appliedLengthControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .draw(rangesMarker);

  // Ratio Offset control
  ratioOffsetControl.anchor = noEaseControl.center()
    .pointToAngle(rac.Angle.s, noEaseControl.value + linesOffset)
    .segmentToAngle(rac.Angle.e, appliedLengthControl.anchor.length() + rac.Control.radius * 2)
    .draw(rangesMarker)
    .nextSegmentToAngle(rac.Angle.s, 200)
    .reverse();

  // Ratio Factor control
  ratioFactorControl.anchor = ratioOffsetControl.anchor.end
    .pointToAngle(rac.Angle.e, rac.Control.radius * 3)
    .segmentToAngle(rac.Angle.s, 200)
    .reverse();

  // Ease Offset control
  easeOffsetControl.anchor = noEaseControl.center()
    .segmentToAngleToIntersectionWithSegment(rac.Angle.s, lastLineGuide)
    .end.pointToAngle(rac.Angle.s, rac.Control.radius * 2)
    .pointToAngle(rac.Angle.w, 100)
    .segmentToAngle(rac.Angle.e, 200);

  // Ease Factor control
  easeFactorControl.anchor = easeOffsetControl.anchor.end
    .pointToAngle(rac.Angle.e, rac.Control.radius * 2)
    .segmentToAngle(rac.Angle.e, 200);



  // Control value mapping
  let noEaseDistance = noEaseControl.value;
  let easeDistance = distanceControl.value;
  let appliedLength = appliedLengthControl.value;
  let ratioOffset = (ratioOffsetControl.value - 100) / 50;
  let ratioFactor = ((ratioFactorControl.value -100) / 25);
  let easeOffset = (easeOffsetControl.value - 100) / 50;
  let easeFactor = ((easeFactorControl.value -100) / 25);

  for (let index = 0; index < linesCount; index++) {
    let linePos = linesOffset + linesStep * index;
    let lineStart = start.pointToAngle(rac.Angle.s, linePos);

    let lineLength = linesStep * index;

    // Utility ease setup
    let utilEase = new rac.EaseFunction();
    utilEase.prefix = noEaseDistance;
    utilEase.inRange = easeDistance;
    utilEase.outRange = appliedLength;

    utilEase.ratioOffset = ratioOffset;
    utilEase.ratioFactor = ratioFactor;

    utilEase.easeOffset = easeOffset;
    utilEase.easeFactor = easeFactor;

    utilEase.preBehavior = rac.EaseFunction.Behavior.pass;
    utilEase.postBehavior = rac.EaseFunction.Behavior.pass;

    utilEase.preFactor = 1;
    utilEase.postFactor = 1;

    // Utility line
    let utilLength = utilEase.easeRange(lineLength);
    lineStart.segmentToAngle(rac.Angle.e, utilLength).draw();

    // Continious line
    utilEase.preBehavior = rac.EaseFunction.Behavior.continue;
    utilEase.postBehavior = rac.EaseFunction.Behavior.continue;
    let continuousLength = utilEase.easeRange(lineLength);
    lineStart.pointToAngle(rac.Angle.s, continuousMarkerOffset)
      .segmentToAngle(rac.Angle.e, continuousLength).draw(continuousMarker);

    // Control ease setup
    let controlEase = new rac.EaseFunction();
    controlEase.prefix = noEaseDistance;
    controlEase.inRange = easeDistance;
    controlEase.outRange = appliedLength;

    controlEase.preBehavior = rac.EaseFunction.Behavior.continue;
    controlEase.postBehavior = rac.EaseFunction.Behavior.continue;

    // Control line
    let controlLength = controlEase.easeRange(lineLength);
    lineStart.pointToAngle(rac.Angle.s, controlMarkerOffset)
      .segmentToAngle(rac.Angle.e, controlLength).draw(controlMarker);

    // No ease line
    lineStart.pointToAngle(rac.Angle.s, noEaseMarkerOffset)
      .segmentToAngle(rac.Angle.e, lineLength).draw(noEaseMarker);
  }


  // Controls draw on top
  rac.drawControls();

  // Control labels get draw on top
  let ratioTextFormat = new rac.Text.Format(
    rac.Text.Format.horizontal.left,
    rac.Text.Format.vertical.center,
    "Spot Mono",
    rac.Angle.e, 4);
  ratioOffsetControl.anchor.end.text(ratioOffset.toFixed(2), ratioTextFormat).draw();
  ratioFactorControl.anchor.end.text(ratioFactor.toFixed(2), ratioTextFormat).draw();

  let easeTextFormat = new rac.Text.Format(
    rac.Text.Format.horizontal.right,
    rac.Text.Format.vertical.baseline,
    "Spot Mono",
    rac.Angle.n, 4);
  easeOffsetControl.anchor.end.text(easeOffset.toFixed(2), easeTextFormat).draw();
  easeFactorControl.anchor.end.text(easeFactor.toFixed(2), easeTextFormat).draw();

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


