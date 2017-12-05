precision mediump float;

varying vec4 u_color;
varying vec3 fragNormal;

struct DirectionalLight
{
    vec3 direction;
	vec3 color;
};

uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;

uniform vec3 cameraDirection;

void main() 
{
    vec3 surfaceNormal = normalize(fragNormal);
    vec3 sunlightDirection = normalize(sun.direction);

    vec3 specularIntensity = vec3(0.01, 0.01, 0.01);

    vec3 vReflection =  sunlightDirection - 
        2.0 * (dot(sunlightDirection, surfaceNormal)) * surfaceNormal;

    vec3 lightIntensity = ambientLightIntensity + 
        sun.color * max(dot(surfaceNormal, sunlightDirection), 0.0);
         //+ specularIntensity * max(dot(vReflection, (-1.0 * cameraDirection)), 0.0);

    gl_FragColor = vec4(u_color.rgb * lightIntensity, u_color.a);
}
