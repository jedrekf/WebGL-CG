uniform mat4 projection;
uniform mat4 modelview;
uniform mat4 camLocation;

attribute vec3 coords;
varying vec3 vCoords;

void main() {
vec4 eyeCoords = modelview * camLocation * vec4(coords,1.0);
gl_Position = projection * eyeCoords;
vCoords = coords;//gl_Position.xyz;
}