// file="index.html"

precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

//matrices world, view and projection
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
    fragColor = vertColor;
    // position -> world:rotation in 3D space -> view:camera -> projection:nice points
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0); 
}