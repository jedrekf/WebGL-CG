precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;

varying vec4 u_color;
varying vec3 fragNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec3 vColor;

void main(){
    fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
    u_color = vec4(vColor, 1.0);
    
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}