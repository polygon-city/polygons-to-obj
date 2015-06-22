var _ = require("lodash");

// Creates an OBJ file from an array of polygon and faces arrays
// Polygons: [[[0,0,1], [2,2,3]], [[...], ...]]]
// Faces: [[[2,3,0],[0,1,2]], [[2,3,0],[0,1,2]]]

// TODO: Work out how to correct normals / orienation when using zUP

var polygons2obj = function(polygons, faces, zUP) {
  // Metadata
  var metaStr = "";
  metaStr += "# Generated using the polygons-to-obj package";

  // Index offset for faces
  var facesOffset = 0;

  // Strings
  var verticesStr = "";
  var facesStr = "";

  var origin;
  var verticalIndex = (zUP) ? 2 : 1;

  // Find vertex with minimum vertical value, for origin
  _.each(polygons, function(polygon) {
    _.each(polygon, function(point) {
      if (!origin) {
        origin = _.clone(point);
        return;
      }

      if (point[verticalIndex] < origin[verticalIndex]) {
        origin = _.clone(point);
        return;
      }
    });
  });

  if (zUP) {
    var oldOrigin = _.clone(origin);

    // Flip axis
    origin[1] = oldOrigin[2];
    origin[2] = oldOrigin[1];
  }

  // Assumes polygons are [[x,y,z,x,y,z,...], [...]]
  _.each(polygons, function(polygon, polygonIndex) {
    var vertexCount = 0;

    _.each(polygon, function(point) {
      verticesStr += "v";

      if (zUP) {
        var oldPoint = _.clone(point);

        // Flip axis
        point[1] = oldPoint[2];
        point[2] = oldPoint[1];
      }

      var realPoint;

      _.each(point, function(value, pointIndex) {
        realPoint = (value - origin[pointIndex]);

        // Flip Z-axis so object isn't mirrored
        // TODO: Is this actually required or as a result of some other mistake?
        if (zUP && pointIndex === 2) {
          realPoint *= -1;
        }

        verticesStr += " " + realPoint;
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

  objStr += metaStr + "\n\n";
  objStr += verticesStr + "\n";
  objStr += facesStr;

  return objStr;
};

module.exports = polygons2obj;
