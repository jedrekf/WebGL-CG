var gl;
var model;
var canvas;
var mouseDown = false;
var lastMouseX;
var lastMouseY;


var App = function () {
    var programs = [];
    var img;
    var gl_utils = new GlUtils();
    var camera = new Camera();

    /**
     * {vertices, indices, normals?}
     */
    var objects = [];

    //downloads shit
    this.Init = function () {
        var shaderPairsCount = 2;
        var modelsCount = 1;
        var texturesCount = 1;

        var basicshaderText;
        Promise.all([
            loadTextResource('./src/shaders/basic.vs.GLSL'),
            loadTextResource('./src/shaders/basic.fs.GLSL'),
            loadTextResource('./src/shaders/box.vs.GLSL'),
            loadTextResource('./src/shaders/box.fs.GLSL'),
            loadObjResource('./models/palm_tree.obj'),
            loadImage('./textures/crate_side.svg')
        ]).
        then(function (data) {
            var s = shaderPairsCount * 2;
            var shaders = data.slice(0, s);
            var models = data.slice(s, s + modelsCount);
            s += modelsCount;
            var textures = data.slice(s, s + texturesCount);

            Run(shaders, models, textures);
        }).catch(errors => console.error(errors));
    };


    function Run(shaders, models, textures) {
        gl = gl_utils.getWebGl();
        img = textures[0];
        model = models[0];

        //setting color of paint
        gl.clearColor(0.529, 0.807, 0.98, 1.0);
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

        var boxVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[2]);
        var boxFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[3]);
        var programBox = gl_utils.createProgram(gl, boxVertexShader, boxFragmentShader);
        programs.push(programBox);



        /**
         * Objects array holding our scene objects
         */
        objects.palmtree = Generator.getFromModel(model);
        objects.box = Generator.getBox();
        objects.island = Generator.getIsland();
        objects.water = Generator.getWater();
        //maybe assign objects to programs in a dictionary


        camera.init();

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
         * Creating Matrices for world, view and projection 
         */
        var matWorldUniformLocation = gl.getUniformLocation(programs[0], 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(programs[0], 'mView');
        var matProjUniformLocation = gl.getUniformLocation(programs[0], 'mProj');
        var vecColorUniform = gl.getUniformLocation(programs[0], 'vColor');

        var worldMatrix = new Float32Array(16);
        var camMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        var vecColor = new Float32Array(3);


        // mat4.lookAt(camera.camMatrix, camera.eye, camera.center, camera.up);
        mat4.invert(viewMatrix, camera.cameraMatrix);
        mat4.perspective(projMatrix, degToRad(90), aspect, 0.1, 1000.0);


        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


        //send current cam position for specular in phong
        var vectorCameraUniform = gl.getUniformLocation(programs[0], 'cameraDirection');
        gl.uniform3fv(vectorCameraUniform, new Float32Array(camera.center));


        /**
         * Palms
         */
        var palmObj = objects.palmtree;

        vec3.set(vecColor, 0.376, 0.7, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);

        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [150, -100.0, 0]);
        vec3.set(vecColor, 0.376, 0.7, 0.117);

        gl_utils.drawObject(gl, programs[0], palmObj, vecColor, worldMatrix, viewMatrix, projMatrix);


        //second palm
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [30, -100.0, 0]);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.drawElements(gl.TRIANGLES, palmObj.indices.length, gl.UNSIGNED_SHORT, 0);

        /**
         * Crate
         */
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.5, 0.5, 0.5]);
        mat4.translate(worldMatrix, worldMatrix, [0, 0, 0]);
        vec3.set(vecColor, 1.0, 0.313, 0.117);

        gl_utils.drawObject(gl, programs[0], objects.box, vecColor, worldMatrix, viewMatrix, projMatrix);


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

        requestAnimationFrame(drawScene);
    }

}