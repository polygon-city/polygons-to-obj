var _ = require("lodash");

// TODO: Work out the right normal for a face (so they're all pointing out)
// TODO: Update normals if needed by reversing vertex order in faces

// Creates an OBJ file from an array of polygon and faces arrays
// Polygons: [[[0,0,1], [2,2,3]], [[...], ...]]]
// Faces: [[[2,3,0],[0,1,2]], [[2,3,0],[0,1,2]]]

var polygons2obj = function(polygons, faces, zUP) {
  // Metadata
  var metaStr = "";
  metaStr += "# Generated using the polygons-to-obj package";

  // Index offset for faces
  var facesOffset = 0;

  // Strings
  var verticesStr = "";
  var facesStr = "";

  // Use first point as origin
  // TODO: Use a better point – the centroid or the minimum for example
  // TODO: Store origin somewhere so building can be placed geographically in future
  var origin = _.clone(polygons[0][0]);

  if (zUP) {
    var oldOrigin = _.clone(origin);

    // Flip axis
    origin[1] = oldOrigin[2];
    origin[2] = oldOrigin[1];
  }

  // Assumes polygons are [[x,y,z,x,y,z,...], [...]]
  _.each(polygons, function(polygon, polygonIndex) {
    var vertexCount = 0;

    var polygonNormal = normalUnit(polygon[0], polygon[1], polygon[2]);

    // I'm not really sure why only flipping this normal axis works and flipping
    // the faceNormal too doesn't. Something is probably going wrong.
    if (zUP) {
      var oldPolygonNormal = _.clone(polygonNormal);
      polygonNormal[1] = oldPolygonNormal[2];
      polygonNormal[2] = oldPolygonNormal[1];
    }

    _.each(polygon, function(point) {
      verticesStr += "v";

      if (zUP) {
        var oldPoint = _.clone(point);

        // Flip axis
        point[1] = oldPoint[2];
        point[2] = oldPoint[1];
      }

      _.each(point, function(value, pointIndex) {
        verticesStr += " " + (value - origin[pointIndex]);
      });

      verticesStr += "\n";

      vertexCount++;
    });

    // Output faces for this polygon
    // Assumes that there is a faces array for each polygon
    _.each(faces[polygonIndex], function(face) {
      facesStr += "f";

      var faceCopy = _.clone(face);
      var faceNormal = normalUnit(polygon[faceCopy[0]], polygon[faceCopy[1]], polygon[faceCopy[2]]);

      // console.log(polygonNormal, faceNormal);

      // Check normals match
      // If so, reverse the vertices
      if (!checkNormals(polygonNormal, faceNormal)) {
        // console.log("Mismatch");
        faceCopy.reverse();
      }

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

// TODO: Double-check that this is returning correct normal (not reversed)
var normalUnit = function(p1, p2, p3) {
  // Clone original points so we don't modify originals
  var cp1 = _.clone(p1);
  var cp2 = _.clone(p2);
  var cp3 = _.clone(p3);

  // http://stackoverflow.com/questions/8135260/normal-vector-to-a-plane
  var nx = (cp2[1] - cp1[1])*(cp3[2] - cp1[2]) - (cp2[2] - cp1[2])*(cp3[1] - cp1[1]);
  var ny = (cp2[2] - cp1[2])*(cp3[0] - cp1[0]) - (cp2[0] - cp1[0])*(cp3[2] - cp1[2]);
  var nz = (cp2[0] - cp1[0])*(cp3[1] - cp1[1]) - (cp2[1] - cp1[1])*(cp3[0] - cp1[0]);

  // Vector length
  // http://www.lighthouse3d.com/opengl/terrain/index.php3?normals
  var length = Math.sqrt(nx*nx + ny*ny + nz*nz);

  // Return normals in unit length
  var normals = [nx/length, ny/length, nz/length];

  return normals;
};

// Based on:
// https://github.com/tudelft3d/CityGML2OBJs/blob/861192ef2e6b84f516a71de864767700fbfbf275/polygon3dmodule.py#L331
var checkNormals = function(n1, n2) {
  // Originally used Number.EPSILON but the variances seem to be much larger
  // TODO: Find a good variance or implement a better way to compare normals
  var variance = 0.01;

  if (Math.abs(n1[0] - n2[0]) > variance) {
    return false;
  }

  if (Math.abs(n1[1] - n2[1]) > variance) {
    return false;
  }

  if (Math.abs(n1[2] - n2[2]) > variance) {
    return false;
  }

  return true;
};

module.exports = polygons2obj;
