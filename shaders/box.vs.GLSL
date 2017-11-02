precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;

//matrices world, view and projection
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
    fragTexCoord = vertTexCoord;
    // position -> world:rotation in 3D space -> view:camera -> projection:nice points
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0); 
}