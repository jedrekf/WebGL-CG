precision mediump float;

attribute vec3 vertPosition;

varying vec4 u_color;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
    u_color = vec4(0.0, 0.8, 0.0, 1.0);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}