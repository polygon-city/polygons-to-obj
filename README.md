# Polygons to OBJ

Takes polygon and face arrays and returns an OBJ string

## Usage

```javascript
var polygons2obj = require("polygons-to-obj");

var polygons = [[[x,y,z], [...]], [[x,y,z], [...]]];
var faces = [[[v1,v2,v3], [...]], [[v1,v2,v3], [...]]];

// Point to use as [0, 0, 0] origin for conversion
var origin = [0, 0, 0];

// Vertical offset to apply to points
var verticalOffset = 0;

// Z-axis is the vertical axis
var zUP = false;

var objStr = polygons2obj(polygons, faces, origin, verticalOffset, zUP);
```
