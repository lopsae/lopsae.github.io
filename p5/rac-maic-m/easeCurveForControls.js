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




function draw() {
  clear();

  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .8), // red,
    marker:      new rac.Color( .7,  .3,  .3,  .5), // rose pink
    fill:        new rac.Color( .8,  .8,  .8,  .9), // whiteish
    controlFill: new rac.Color( .8,  .8,  .8, 1.0), // whiteish
    pointer:     new rac.Color( .9,  .9,  .9,  .6), // whiteish
    highlight:   new rac.Color(  0, 1.0, 1.0,  .8)// cyan
  };
  colorScheme.background.applyBackground();

  let mainStroke = colorScheme.stroke.stroke(2);
  mainStroke.apply();

  let marker = colorScheme.marker.stroke(2);

  // Testing highlight
  let highlight = colorScheme.highlight.stroke(5);

  let controlStyle = colorScheme.stroke.stroke(3)
    .styleWithFill(colorScheme.controlFill.fill());

  noEaseControl.style = controlStyle;

  rac.pointerStyle = colorScheme.pointer.stroke(3);


  let start  = new rac.Point(100, 100);

  noEaseControl.anchor = start.segmentToAngle(rac.Angle.e, 200);

  let linesOffset = rac.Control.radius * 2;
  let linesSpacing = 10;
  let linesStep = 10;
  let linesCount = 40;

  let lastLinePos = linesOffset + linesSpacing * (linesCount - 1);

  // NoEase marker
  noEaseControl.center().segmentToAngle(rac.Angle.s, lastLinePos).draw(marker);

  let noEaseDistance = noEaseControl.value;
  let easeDistance = rac.Control.radius * 10;
  let easedLength = rac.Control.radius * 5;

  // EaseDistance marker
  start.pointToAngle(rac.Angle.e, noEaseDistance + easeDistance)
    .segmentToAngle(rac.Angle.s, lastLinePos).draw(marker);

  // EaseLength marker
  start.pointToAngle(rac.Angle.e, noEaseDistance + easedLength)
    .segmentToAngle(rac.Angle.s, lastLinePos).draw(marker);

  for (let index = 0; index < linesCount; index++) {
    let linePos = linesOffset + linesSpacing * index;
    let lineStart = start.pointToAngle(rac.Angle.s, linePos);

    let lineLength = linesStep * index;

    if (lineLength < noEaseDistance) {
      lineStart.segmentToAngle(rac.Angle.e, lineLength).draw();
    } else {
      lineStart.pointToAngle(rac.Angle.s, 3)
        .segmentToAngle(rac.Angle.e, lineLength).draw(marker);

      let lengthRatio = (lineLength - noEaseDistance) / easeDistance;
      // https://math.stackexchange.com/questions/121720/ease-in-out-function/121755#121755
      // f(x) = (t^a)/(t^a+(1-t)^a)
      let a = 2;
      let t = lengthRatio;
      let easeRatio = Math.pow(t,a) / (Math.pow(t,a) + Math.pow(1-t,a));
      let newlength = noEaseDistance + (easeRatio * easedLength);

      lineStart.segmentToAngle(rac.Angle.e, newlength).draw();
    }
  }


  // Controls draw on top
  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

