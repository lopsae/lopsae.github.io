"use strict";


function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
  noFill();
}


function mousePressed(event) {
  let pointerCenter = new rac.Point.mouse();

  let selected = rac.controls.find(item => {
    let controlCenter = item.center();
    if (controlCenter === null) { return false; }
    if (controlCenter.distanceToPoint(pointerCenter) <= rac.Control.radius) {
      return true;
    }
    return false;
  });

  if (selected !== undefined) {
    rac.controlSelection = new rac.ControlSelection(selected);
    selected.isSelected = true;
  }

  redraw();
}


function mouseDragged(event) {
  if (rac.controlSelection !== null) {
    let pointerCenter = new rac.Point.mouse();
    let anchorCopy = rac.controlSelection.anchorCopy;

    let controlShadowCenter = rac.controlSelection.pointerOffset
      .translateToStart(pointerCenter)
      .end;

    let newValue = anchorCopy
      .lengthToProjectedPoint(controlShadowCenter);

    if (newValue < 0) {
      newValue = 0;
    }

    if (newValue > anchorCopy.length()) {
      newValue = anchorCopy.length()
    }

    rac.controlSelection.control.value = newValue;
  }
  redraw();
}


function mouseReleased(event) {
  if (rac.controlSelection !== null) {
    rac.controlSelection.control.isSelected = false;
    rac.controlSelection = null;
  }
  redraw();
}


let radiusControl = new rac.Control();
radiusControl.value = 120;
rac.controls.push(radiusControl);

let slopeControl = new rac.Control();
slopeControl.value = 240;
rac.controls.push(slopeControl);

let concentricControl = new rac.Control();
concentricControl.value = 17;
rac.controls.push(concentricControl);


function draw() {
  clear();

  let colorScheme = {
    background:  new rac.Color( .1,  .1,  .1), // blackish
    stroke:      new rac.Color( .9,  .2,  .2,  .5), // red,
    marker:      new rac.Color( .7,  .3,  .3,  .3), // rose pink
    tear:        new rac.Color( .8,  .8,  .8,  .9), // whiteish
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

  rac.pointerStyle = colorScheme.pointer.stroke(3);


  // Center of the tear circle
  let center = new rac.Point(windowWidth/2, windowHeight/2);
  // Radius of tear main arc
  let radius = radiusControl.value;
  // Width of the concentric circles
  let concentricMin = 3
  let concentricWidth = concentricMin + concentricControl.value;
  // Radius of the main slope arcs
  let slopeRadius = slopeControl.value;

  // Last step is draw if its width would be greater that zero
  let concentricCount = Math.ceil(radius/concentricWidth) -1;
  let smallestRadius = concentricCount > 0
    ? radius - concentricCount * concentricWidth
    : radius;

  // Tear main circle
  center.arc(radius).draw()


  // Radius control
  radiusControl.style = controlStyle;
  radiusControl.anchorSegment = center
    // Tear center to control anchor
    .segmentToAngle(rac.Angle.s, radius + rac.Control.radius * 3)
    .draw()
    // Control anchor
    .end.segmentToAngle(rac.Angle.e, 300);

  radiusControl.center()
    .segmentToPoint(center.pointToAngle(rac.Angle.e, radius))
    .draw();


  // Concentric control
  concentricControl.style = controlStyle
  concentricControl.anchorSegment = center
    // Tear center to control anchor
    .pointToAngle(rac.Angle.s, radius)
    .segmentToAngle(rac.Angle.e, radius + rac.Control.radius * 2)
    .draw()
    .end.segmentToAngle(rac.Angle.n, concentricMin)
    .draw()
    .end.segmentToAngle(rac.Angle.n, 300);

  center.pointToAngle(rac.Angle.s, radius - concentricWidth)
    .segmentToPoint(concentricControl.center())
    .draw();


  // Main concentric arcs
  for(let index = 1; index <= concentricCount; index++) {
    let concentricRadius = radius - concentricWidth * index;
    center.arc(concentricRadius).draw();
  }


  // Slope control
  slopeControl.style = controlStyle;
  slopeControl.anchorSegment = center
    // Tear center to control anchor
    .segmentToAngle(rac.Angle.s, radius + rac.Control.radius * 6)
    .draw()
    // Control anchor
    .end.segmentToAngle(rac.Angle.w, 300);

  slopeControl.center()
    .segmentToPoint(center.pointToAngle(rac.Angle.w, slopeRadius))
    .draw();


  // Slope centers orbit arc
  center.segmentToAngle(rac.Angle.wsw, radius + slopeRadius).draw()
    .arc(rac.Angle.ese).draw();

  // Slope centers left column
  let columnCenterLeft = center.addX(-slopeRadius);
  center.segmentToPoint(columnCenterLeft).draw()
    .segmentExtending(radius/5).draw();
  columnCenterLeft.arc(radius).draw();

  // Slope centers right column
  let columnCenterRight = center.addX(slopeRadius);
  center.segmentToPoint(columnCenterRight).draw()
    .segmentExtending(radius/5).draw();
  columnCenterRight.arc(radius).draw();

  // Ray to slope center left
  let columnLeft = center.segmentToPoint(columnCenterLeft)
    .oppositeWithHyp(radius + slopeRadius, false).draw();
  let slopeCenterLeft = columnLeft.end;
  columnLeft.segmentExtending(radius/5).draw();

  center.segmentToPoint(slopeCenterLeft).draw()
    .segmentExtending(radius/5).draw();

  // Ray to slope center right
  let columnRight = center.segmentToPoint(columnCenterRight)
    .oppositeWithHyp(radius + slopeRadius, true).draw();
  let slopeCenterRight = columnRight.end;
  columnRight.segmentExtending(radius/5).draw();

  center.segmentToPoint(slopeCenterRight).draw()
    .segmentExtending(radius/5).draw();

  // Slope arcs
  let slopeArcLeft = slopeCenterLeft
    .segmentToPoint(center).withLength(slopeRadius)
    .withAngleAdd(1/16)
    .draw()
    .arc(-1/32, false).draw();
  let slopeArcRight = slopeCenterRight
    .segmentToPoint(center).withLength(slopeRadius)
    .withAngleAdd(-1/16)
    .draw()
    .arc(1/2 + 1/32, true).draw();

  // Slope concentric arcs
  for(let index = 1; index <= concentricCount +1; index++) {
    let concentricRadius = slopeRadius + concentricWidth * index;
    let concentricStroke = mainStroke;


    if (index == concentricCount +1) {
      // Color fading for extra concentric arc
      let distancePastCenter = concentricRadius - (slopeRadius + radius);
      let colorRatio = (concentricWidth - distancePastCenter) / concentricWidth;
      concentricStroke = mainStroke.withAlphaRatio(colorRatio);
    }

    slopeArcLeft.withRadius(concentricRadius)
      .draw(concentricStroke);
    slopeArcRight.withRadius(concentricRadius)
      .draw(concentricStroke);
  }

  // Tear shape
  let marker = new rac.Stroke(colorScheme.marker, 3);
  for(let index = 0; index <= concentricCount; index++) {
    let centerConcentricRadius = radius - concentricWidth * index;
    let slopeConcentricRadius = slopeRadius + concentricWidth * index;

    center.arc(centerConcentricRadius,
      center.angleToPoint(slopeCenterLeft),
      center.angleToPoint(slopeCenterRight),
      false)
      .draw(marker);

    let slopeLeft = slopeCenterLeft.arc(slopeConcentricRadius,
      slopeCenterLeft.angleToPoint(center),
      rac.Angle.e,
      false);
    let slopeRight = slopeCenterRight.arc(slopeConcentricRadius,
      slopeCenterRight.angleToPoint(center),
      rac.Angle.w,
      true);
    let slopeIntersection = slopeLeft
      .intersectingPointsWithArc(slopeRight)[0]
      ?? slopeCenterLeft.segmentToPoint(slopeCenterRight).middle();

    slopeLeft.withEndTowardsPoint(slopeIntersection).draw(marker);
    slopeRight.withEndTowardsPoint(slopeIntersection).draw(marker);
  }

  // Filled tear shape
  // for(let index = 0; index <= concentricCount; index++) {
  let shapeStyle = new rac.Style(rac.Stroke.no, colorScheme.tear.fill());
  let tearShape = new rac.Shape();
  for(let index = 0; index <= concentricCount; index++) {
    let centerConcentricRadius = radius - concentricWidth * index;
    let slopeConcentricRadius = slopeRadius + concentricWidth * index;

    let slopeLeft = slopeCenterLeft.arc(slopeConcentricRadius,
      slopeCenterLeft.angleToPoint(center),
      rac.Angle.e,
      false);
    let slopeRight = slopeCenterRight.arc(slopeConcentricRadius,
      slopeCenterRight.angleToPoint(center),
      rac.Angle.w,
      true);
    let slopeIntersection = slopeLeft
      .intersectingPointsWithArc(slopeRight)[0]
      ?? slopeCenterLeft.segmentToPoint(slopeCenterRight).middle();

    let composite = new rac.Composite();

    slopeRight.withEndTowardsPoint(slopeIntersection)
      .reverse()
      .attachTo(composite);

    center.arc(centerConcentricRadius,
      center.angleToPoint(slopeCenterRight),
      center.angleToPoint(slopeCenterLeft),
      true)
      .attachTo(composite);

    slopeLeft.withEndTowardsPoint(slopeIntersection)
      .attachTo(composite);

    if (index % 2 == 0) {
      composite.attachTo(tearShape);

      if (index == concentricCount) {
        tearShape.draw(shapeStyle);
      }
    } else {
      composite.reverse()
        .attachTo(tearShape.contour);
      tearShape.draw(shapeStyle);
      tearShape = new rac.Shape();
    }

  }


  rac.drawControls();

  console.log(`👑 ~finis coronat opus ${Date.now()}`);
}

