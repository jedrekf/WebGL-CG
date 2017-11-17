precision mediump float;

varying vec4 u_color;
varying vec3 fragNormal;

//uniform vec3 ambientLightIntensity;
//uniform vec3 sunlightIntensity;
//uniform vec3 sunlightDirection;

uniform vec3 cameraDirection;

void main() {
    vec3 ambientLightIntensity = vec3(0.5, 0.5, 0.5);
    vec3 sunlightIntensity = vec3(0.7, 0.7, 0.7);
    vec3 sunlightDirection = normalize(vec3(100.0, 100.00, -15.0));
    vec3 surfaceNormal = normalize(fragNormal);

    vec3 specularIntensity = vec3(0.01, 0.01, 0.01);

    vec3 vReflection =  sunlightDirection - 
        2.0 * (dot(sunlightDirection, surfaceNormal)) * surfaceNormal;

    vec3 lightIntensity = ambientLightIntensity + 
        sunlightIntensity * max(dot(surfaceNormal, sunlightDirection), 0.0);
         //+        specularIntensity * max(dot(vReflection, (-1.0 * cameraDirection)), 0.0);

    gl_FragColor = vec4(u_color.rgb * lightIntensity, u_color.a);
}
