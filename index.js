var _ = require("lodash");

// Creates an OBJ file from an array of polygon and faces arrays
// Polygons: [[[0,0,1], [2,2,3]], [[...], ...]]]
// Faces: [[[2,3,0],[0,1,2]], [[2,3,0],[0,1,2]]]

// TODO: Work out how to correct normals / orienation when using zUP

var polygons2obj = function(polygons, faces, origin, verticalOffset, zUP) {
  // Metadata
  var metaStr = "";
  metaStr += "# Generated using the polygons-to-obj package\n";

  // Index offset for faces
  var facesOffset = 0;

  // Strings
  var verticesStr = "";
  var facesStr = "";

  // // Vertical can be either Y (1) or Z (2)
  var verticalIndex = (zUP) ? 2 : 1;

  // Horizontal can be either X (0) or Y (1)
  var horizontalIndex = (zUP) ? 0 : 1;

  // REMOVED: Origin logic is now part of citygml-to-obj
  //
  // var origin;
  // var vertMin;
  //
  // _.each(polygons, function(polygon) {
  //   // Find minimum on vertical axis
  //   _.each(polygon, function(point) {
  //     if (!vertMin) {
  //       vertMin = point[verticalIndex];
  //       return;
  //     }
  //
  //     if (point[verticalIndex] < vertMin) {
  //       vertMin = point[verticalIndex];
  //       return;
  //     }
  //   });
  // });
  //
  // // Collect points that share minimum vertical values
  // var vertMinPoints = [];
  // _.each(polygons, function(polygon) {
  //   _.each(polygon, function(point) {
  //     vertMinPoints = _.unique(vertMinPoints.concat(_.filter(polygon, function(point) {
  //       return (point[verticalIndex] === vertMin);
  //     })));
  //   });
  // });
  //
  // // Find point with minimum on alternate horizontal axis
  // _.each(vertMinPoints, function(point) {
  //   if (!origin) {
  //     origin = _.clone(point);
  //     return;
  //   }
  //
  //   if (point[horizontalIndex] < origin[horizontalIndex]) {
  //     origin = _.clone(point);
  //     return;
  //   }
  // });

  metaStr += "# Origin: (" + origin[horizontalIndex] + ", " + verticalOffset + ", " + origin[((verticalIndex === 2) ? 1 : 2)] + ")\n";

  // Replace vertical element of origin with vertical offset
  origin[verticalIndex] = verticalOffset;

  // Assumes polygons are [[x,y,z,x,y,z,...], [...]]
  _.each(polygons, function(polygon, polygonIndex) {
    var vertexCount = 0;

    _.each(polygon, function(point) {
      verticesStr += "v";

      var realPoint = pointToOrigin(point, origin);

      if (zUP) {
        // Rotate object around X-axis so Z-axis points up
        rotateX3DPoint(90, realPoint);
      }

      _.each(realPoint, function(value, pointIndex) {
        verticesStr += " " + value;
      });

      verticesStr += "\n";

      vertexCount++;
    });

    // Output faces for this polygon
    // Assumes that there is a faces array for each polygon
    _.each(faces[polygonIndex], function(face) {
      facesStr += "f";

      var faceCopy = _.clone(face);

      _.each(faceCopy, function(faceIndex) {
        // Use vertex count to offset face index
        // Add 1 as OBJ isn't 0-indexed
        facesStr += " " + (facesOffset + (faceIndex + 1));
      });

      facesStr += "\n";
    });

    // Update vertex count
    facesOffset += vertexCount;
  });

  var objStr = "";

  objStr += metaStr + "\n";
  objStr += verticesStr + "\n";
  objStr += facesStr;

  return objStr;
};

// Find relative position of point from origin
var pointToOrigin = function(point, origin) {
  var realPoint = [];
  var realValue;

  _.each(point, function(value, pointIndex) {
    realValue = value - origin[pointIndex];
    realPoint.push(realValue);
  });

  return realPoint;
};

// Rotate object around X axis
// https://www.khanacademy.org/computer-programming/3d-tutorial-3/1645062289
var rotateX3D = function(theta, polygons) {
  var sin_t = Math.sin(theta);
  var cos_t = Math.cos(theta);

  for (var n=0; n<polygons.length; n++) {
    var point = polygons[n];
    var y = point[1];
    var z = point[2];
    point[1] = y * cos_t - z * sin_t;
    point[2] = z * cos_t + y * sin_t;
  }
};

// Rotate point around X axis (in degrees)
var rotateX3DPoint = function(theta, point) {
  // Convert degrees to radians
  theta = theta * Math.PI / 180;

  var sin_t = Math.sin(theta);
  var cos_t = Math.cos(theta);

  var y = point[2];
  var z = point[1];
  point[2] = y * cos_t - z * sin_t;
  point[1] = z * cos_t + y * sin_t;
};

module.exports = polygons2obj;
