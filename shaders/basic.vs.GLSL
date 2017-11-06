precision mediump float;

attribute vec3 vertPosition;

varying vec4 u_color;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec3 vColor;

void main(){
    u_color = vec4(vColor, 1.0);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}