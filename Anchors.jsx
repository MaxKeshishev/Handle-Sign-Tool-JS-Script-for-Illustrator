// === DEFAULT SETTINGS ===
var DEFAULT_ANCHOR_SIZE = 5;
var DEFAULT_HANDLE_SIZE = 5;
var DEFAULT_STROKE_WIDTH = 0.5;

// === INPUT DIALOG FOR PARAMETERS ===
var dialog = new Window("dialog", "Anchor and Handle Display Settings");

dialog.orientation = "column";
dialog.alignChildren = "left";

dialog.add("statictext", undefined, "Anchor point size:");
var anchorInput = dialog.add("edittext", undefined, DEFAULT_ANCHOR_SIZE);
anchorInput.characters = 5;

dialog.add("statictext", undefined, "Handle size:");
var handleInput = dialog.add("edittext", undefined, DEFAULT_HANDLE_SIZE);
handleInput.characters = 5;

dialog.add("statictext", undefined, "Stroke width:");
var strokeInput = dialog.add("edittext", undefined, DEFAULT_STROKE_WIDTH);
strokeInput.characters = 5;

var buttonGroup = dialog.add("group");
buttonGroup.alignment = "right";
var okButton = buttonGroup.add("button", undefined, "OK");
var cancelButton = buttonGroup.add("button", undefined, "Cancel");

if (dialog.show() !== 1) {
    dialog.close();
    exit();
}

// === PARAMETERS FROM USER INPUT ===
var ANCHOR_MARK_SIZE = parseFloat(anchorInput.text) || DEFAULT_ANCHOR_SIZE;
var HANDLE_RADIUS = parseFloat(handleInput.text) || DEFAULT_HANDLE_SIZE;
var STROKE_WIDTH = parseFloat(strokeInput.text) || DEFAULT_STROKE_WIDTH;

// === START SCRIPT ===
if (app.documents.length === 0) {
    alert("No document is open.");
} else if (app.activeDocument.selection.length === 0) {
    alert("Please select at least one vector object.");
} else {
    var doc = app.activeDocument;
    var sel = doc.selection;
    var processed = 0;

    for (var s = 0; s < sel.length; s++) {
        processItem(sel[s]);
    }

    if (processed === 0) {
        alert("No valid path items were found in the selection.");
    } else {
        alert("Objects processed: " + processed);
    }
}

// === PROCESS SELECTED ITEMS ===
function processItem(item) {
    if (item.typename === "PathItem") {
        processPathItem(item);
    } else if (item.typename === "CompoundPathItem") {
        for (var i = 0; i < item.pathItems.length; i++) {
            processPathItem(item.pathItems[i]);
        }
    } else if (item.typename === "GroupItem") {
        for (var j = 0; j < item.pageItems.length; j++) {
            processItem(item.pageItems[j]);
        }
    }
}

// === PROCESS SINGLE PATH ITEM ===
function processPathItem(item) {
    var pathPoints = item.pathPoints;

    for (var i = 0; i < pathPoints.length; i++) {
        var pt = pathPoints[i];
        var anchorX = pt.anchor[0];
        var anchorY = pt.anchor[1];

        var hasLeft = !pointsEqual(pt.anchor, pt.leftDirection);
        var hasRight = !pointsEqual(pt.anchor, pt.rightDirection);

        // Draw anchor point: circle if both handles exist, square otherwise
        if (hasLeft && hasRight) {
            drawEmptyCircle(anchorX, anchorY, ANCHOR_MARK_SIZE);
        } else {
            drawEmptySquare(anchorX, anchorY, ANCHOR_MARK_SIZE);
        }

        // Draw handles and connecting lines
        if (hasLeft) {
            drawFilledCircle(pt.leftDirection[0], pt.leftDirection[1], HANDLE_RADIUS, getColor());
            drawLine(anchorX, anchorY, pt.leftDirection[0], pt.leftDirection[1]);
        }
        if (hasRight) {
            drawFilledCircle(pt.rightDirection[0], pt.rightDirection[1], HANDLE_RADIUS, getColor());
            drawLine(anchorX, anchorY, pt.rightDirection[0], pt.rightDirection[1]);
        }
    }

    processed++;
}

// === DRAW A HOLLOW SQUARE (ANCHOR WITHOUT BOTH HANDLES) ===
function drawEmptySquare(x, y, size) {
    var square = app.activeDocument.pathItems.rectangle(
        y + size / 2,    // top
        x - size / 2,    // left
        size,            // width
        size             // height
    );
    square.stroked = true;
    square.strokeWidth = STROKE_WIDTH;
    square.strokeColor = getColor();
    square.filled = false;
}

// === DRAW A HOLLOW CIRCLE (ANCHOR WITH TWO HANDLES) ===
function drawEmptyCircle(x, y, diameter) {
    var circle = app.activeDocument.pathItems.ellipse(
        y + diameter / 2, // top
        x - diameter / 2, // left
        diameter,
        diameter
    );
    circle.stroked = true;
    circle.strokeWidth = STROKE_WIDTH;
    circle.strokeColor = getColor();
    circle.filled = false;
}

// === DRAW A FILLED CIRCLE FOR HANDLE POINT ===
function drawFilledCircle(x, y, diameter, color) {
    var circle = app.activeDocument.pathItems.ellipse(
        y + diameter / 2,
        x - diameter / 2,
        diameter,
        diameter
    );
    circle.stroked = false;
    circle.filled = true;
    circle.fillColor = color;
}

// === DRAW A LINE FROM ANCHOR TO HANDLE ===
function drawLine(x1, y1, x2, y2) {
    var line = app.activeDocument.pathItems.add();
    line.setEntirePath([[x1, y1], [x2, y2]]);
    line.stroked = true;
    line.strokeWidth = STROKE_WIDTH;
    line.strokeColor = getColor();
    line.filled = false;
}

// === CHECK IF TWO POINTS ARE THE SAME ===
function pointsEqual(p1, p2) {
    return Math.abs(p1[0] - p2[0]) < 0.01 && Math.abs(p1[1] - p2[1]) < 0.01;
}

// === DEFINE STROKE/FILL COLOR ===
function getColor() {
    var color = new RGBColor();
    color.red = 0;
    color.green = 0;
    color.blue = 255; // Blue color by default
    return color;
}
