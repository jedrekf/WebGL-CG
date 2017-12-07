var gl;
var model;
var canvas;
var mouseDown = false;
var lastMouseX;
var lastMouseY;


var App = function () {
    var programs = [];
    var textures = {};
    var objects = [];
    var skyboxImages = [];
    var skybox;

    var gl_utils = new GlUtils();
    var camera = new Camera();

    var defualtLighting = 
    {
        direction: [4.0, 4.00, -1.0],
        color: [0.9, 0.9, 0.9],
        ambient: [0.4, 0.4, 0.4]
    };


    this.Init = function () {
        var shaderPairsCount = 3;
        var modelsCount = 1;
        var texturesCount = 2;

        var basicshaderText;
        Promise.all([
            loadTextResource('./src/shaders/basic.vs.GLSL'),
            loadTextResource('./src/shaders/basic.fs.GLSL'),
            loadTextResource('./src/shaders/texture.vs.GLSL'),
            loadTextResource('./src/shaders/texture.fs.GLSL'),
            loadTextResource('./src/shaders/skybox.vs.GLSL'),
            loadTextResource('./src/shaders/skybox.fs.GLSL'),
            loadObjResource('./models/palm_tree.obj'),
            loadImage('./textures/crate_side.svg'),
            loadImage('./textures/diffus.png')
        ]).
        then(function (data) {
            var s = shaderPairsCount * 2;
            var shaders = data.slice(0, s);
            var models = data.slice(s, s + modelsCount);
            s += modelsCount;
            var textureImages = data.slice(s, s + texturesCount);

             //skybox
            Promise.all([
                loadImage('./textures/skybox/xpos.png'),
                loadImage('./textures/skybox/xneg.png'),
                loadImage('./textures/skybox/ypos.png'),
                loadImage('./textures/skybox/yneg.png'),
                loadImage('./textures/skybox/zpos.png'),
                loadImage('./textures/skybox/zneg.png'),
            ]).
            then(function (data) {
                skyboxImages = data;
                Run(shaders, models, textureImages);
            }).catch(errors => console.error(errors));

        }).catch(errors => console.error(errors));


    };


    function Run(shaders, models, textureImages) {
        gl = gl_utils.getWebGl();
        model = models[0];

        //setting color of paint
        gl.clearColor(0, 0, 0, 0);
        //perform paint 'from?' depth and color buffers
        //depth buffer holds the z value
        //color buffer holds color info
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // rasterizer: we tell it to only draw a pixel on already drawn pixel if it's closer
        gl.enable(gl.DEPTH_TEST);
        // back culling
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        /**
         * BOX
         */
        gl_utils.createBuffers(gl);

        /**
         * Each program has asssigned it's vertex and fragment shader.
         * This means that we could have different programs for textured and for single color models
         */
        var basicVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[0]);
        var basicFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[1]);
        var basicProgram = gl_utils.createProgram(gl, basicVertexShader, basicFragmentShader);
        programs.push(basicProgram);

        var textureVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[2]);
        var textureFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[3]);
        var textureProgram = gl_utils.createProgram(gl, textureVertexShader, textureFragmentShader);
        programs.push(textureProgram);

        var skyboxVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[4]);
        var skyboxFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[5]);
        var skyboxProgram = gl_utils.createProgram(gl, skyboxVertexShader, skyboxFragmentShader);
        programs.push(skyboxProgram);

        /**
         * Objects array holding our scene objects
         */
        objects.palmtree = Generator.getFromModel(model);
        objects.box = Generator.getBox();
        objects.island = Generator.getIsland();
        objects.water = Generator.getWater();
        //maybe assign objects to programs in a dictionary

        /**
         * Bound textures
         */
        textures.box = gl_utils.bindTexture(gl, textureImages[0]);
        textures.palm = gl_utils.bindTexture(gl, textureImages[1]);

        camera.init();  

        /**
         * SKYBOX
         */
        skybox = new Skybox();
        skybox.createSkybox(gl, programs[2], skyboxImages);

        /**
         * Main loop
         */
        requestAnimationFrame(drawScene);
    }

    /**
     * Draws a single frame
     */
    function drawScene() {
        var speed = performance.now() / 1000;

        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        gl.useProgram(programs[0]);

        /**
         * Creating Matrices for view and projection , world matrix is handled by gl-utils draw
         */
        
        gl_utils.setDefaultUniforms(programs[0], defualtLighting);

        var worldMatrix = new Float32Array(16);
        var camMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        var vecColor = new Float32Array(3);


        // mat4.lookAt(camera.camMatrix, camera.eye, camera.center, camera.up);
        mat4.invert(viewMatrix, camera.cameraMatrix);
        mat4.perspective(projMatrix, degToRad(90), aspect, 0.1, 1000.0);


        //send current cam position for specular in phong
        var vectorCameraUniform = gl.getUniformLocation(programs[0], 'cameraDirection');
        gl.uniform3fv(vectorCameraUniform, new Float32Array(camera.center));


        /**
         * SKYBOX
         */
        skybox.render(gl, programs[2], viewMatrix, projMatrix, camera.cameraMatrix);

        /**
         * Island
         */
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [6, 3, 5]);
        mat4.translate(worldMatrix, worldMatrix, [0, -2, 0]);
        vec3.set(vecColor, 1.0, 1.0, 0.117);

        gl_utils.drawObject(gl, programs[0], objects.island, vecColor, worldMatrix, viewMatrix, projMatrix);

        /**
         * Water
         */
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [100.0, 1.0, 100.0]);
        mat4.translate(worldMatrix, worldMatrix, [0, -2, 0]);
        vec3.set(vecColor, 0.1, 0.1, 9.0);

        gl_utils.drawObject(gl, programs[0], objects.water, vecColor, worldMatrix, viewMatrix, projMatrix);


        /**
         * SECOND PROGRAM
         */
         /**
         * Crate
         */
        var textureProgram = programs[1];
        gl.useProgram(textureProgram);

        /**
         * Creating Matrices for world, view and projection 
         */
        var matWorldUniformLocation = gl.getUniformLocation(programs[1], 'mWorld');
      
        gl_utils.setDefaultUniforms(programs[1], defualtLighting);

        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.5, 0.5, 0.5]);
        mat4.translate(worldMatrix, worldMatrix, [0, 0.9, 0]);

        gl_utils.drawObject(gl, textureProgram, objects.box, null, worldMatrix, viewMatrix, projMatrix, textures.box);
        
         /**
         * Palms
         */
        gl.disable(gl.CULL_FACE);

        var palmObj = objects.palmtree;
        
        vec3.set(vecColor, 0.376, 0.7, 0.117);

        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [150, -100.0, 0]);

        gl_utils.drawObject(gl, programs[1], palmObj, null, worldMatrix, viewMatrix, projMatrix, textures.palm);


        //second palm
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [30, -100.0, 0]);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.drawElements(gl.TRIANGLES, palmObj.indices.length, gl.UNSIGNED_SHORT, 0);
        
        gl.enable(gl.CULL_FACE);

        requestAnimationFrame(drawScene);
    }
}