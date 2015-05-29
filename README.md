# Polygons to OBJ

Takes polygon and face arrays and returns an OBJ string

## Usage

```javascript
var polygons2obj = require("polygons-to-obj");

var polygons = [[[x,y,z], [...]], [[x,y,z], [...]]];
var faces = [[[v1,v2,v3], [...]], [[v1,v2,v3], [...]]];

var objStr = polygons2obj(polygons, faces);
```
