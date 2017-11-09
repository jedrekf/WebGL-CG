precision mediump float;

varying vec4 u_color;
varying vec3 fragNormal;

// uniform vec3 ambientLightIntensity;
// uniform vec3 sunlightIntensity;
// uniform vec3 sunlightDirection;

void main(){

    vec3 ambientLightIntensity = vec3(0.6, 0.6, 0.6);
    vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
    vec3 sunlightDirection = normalize(vec3(30.0, 100.00, -15.0));
    vec3 surfaceNormal = normalize(fragNormal);

    vec3 lightIntensity = ambientLightIntensity + 
        sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);

    gl_FragColor = vec4(u_color.rgb * lightIntensity, u_color.a);
}
