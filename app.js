'use strict'

var gl;
var model;
var canvas;
var mouseDown = false;
var lastMouseX;
var lastMouseY;


var App = new function () {

    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(60);
    var cameraHeight = 50;
    var programs = [];
    var img;
    var eye;
    var center;
    var up;

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
        Promise.all([loadTextResource('./shaders/basic.vs.GLSL'),
            loadTextResource('./shaders/basic.fs.GLSL'),
            loadTextResource('./shaders/box.vs.GLSL'),
            loadTextResource('./shaders/box.fs.GLSL'),
            loadJSONResource('./models/palm_tree.json'),
            loadImage('./textures/crate_side.svg')]).
            then( data => {
                var s = shaderPairsCount*2;
                var shaders = data.slice(0, s);
                var models = data.slice(s, s + modelsCount);
                s += modelsCount;
                var textures = data.slice(s, s + texturesCount);

                Run(shaders, models, textures);

        }).catch(errors => console.error(errors));
    }


    function Run (shaders, models, textures) {
        gl = getWebGl();
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
        var boxVertexShader = createShader(gl, gl.VERTEX_SHADER, shaders[2]);
        var boxFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaders[3]);
        var programBox = createProgram(gl, boxVertexShader, boxFragmentShader);

        var basicVertexShader = createShader(gl, gl.VERTEX_SHADER, shaders[0]);
        var basicFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaders[1]);
        var basicProgram = createProgram(gl, basicVertexShader, basicFragmentShader);

        /**
         * Each program has asssigned it's vertex and fragment shader.
         * This means that we could have different programs for textured and for single color models
         */
        programs.push(basicProgram);
        programs.push(programBox);
        
        /**
         * Objects array holding our scene objects
         */
        objects.push(Generator.getFromModel(model));
        objects.push(Generator.getBox());        
        objects.push(Generator.getIsland());
        //maybe assign objects to programs in a dictionary


        bindEvents();
        //cam position
        eye = [0, 10, -8]; // where are we
        center = [0, 0, 0]; // point we look at
        up = [0, 1, 0]; //vec3 pointing up
        
        /**
         * Main loop
         */
        requestAnimationFrame(drawScene);
    }

    /**
     * Draws a single frame
     */
    function drawScene () {
        var speed = performance.now() / 1000;

        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        
        gl.useProgram(programs[0]);
        
        /**
         * Creating Matrices for world, view and projection 
         * This probably could be used outside of a shader and multiplied on the go
         * Then pass to shader just results
         */
        var matWorldUniformLocation = gl.getUniformLocation(programs[0], 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(programs[0], 'mView');
        var matProjUniformLocation = gl.getUniformLocation(programs[0], 'mProj');
        var vecColorUniform = gl.getUniformLocation(programs[0], 'vColor');

        var worldMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        var vecColor = new Float32Array(3);
       

        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [150, 0, 0]);
        mat4.lookAt(viewMatrix, eye, center, up);
        mat4.perspective(projMatrix, degToRad(90), aspect, 0.1, 1000.0);

        //this shit uploads to card??
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        
        vec3.set(vecColor, 0.376, 0.7, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);

        /**
         * Palm
         */
        // Set buffers
        var obj = objects[0];

        var boxVertexBufferObject = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        // this sends data to GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

        //each program has it'c vertex and fragment shaders
        var positionAttribLocation = gl.getAttribLocation(programs[0], 'vertPosition');

        // vertex locations
        gl.vertexAttribPointer(
            positionAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );
        // now it's texture
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        //second palm
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [-3, 0, 0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        /**
         * Crate
         */
        gl.useProgram(programs[0]);
        var obj = objects[1];
        
        //move object
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.5, 0.5, 0.5]);
        mat4.translate(worldMatrix, worldMatrix, [0, 1, -2]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        vec3.set(vecColor, 1.0, 0.313, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);
        

        var crateBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, crateBufferObject);
        // this sends data to GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        var createBufferIndices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, createBufferIndices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

        //each program has it'c vertex and fragment shaders
        var positionAttribLocation = gl.getAttribLocation(programs[0], 'vertPosition');

        // vertex locations
        gl.vertexAttribPointer(
            positionAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );

        // now it's texture
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        

        /**
         * Island
         */
        gl.useProgram(programs[0]);
        var obj = objects[2];
        
        //move object
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [5, 0.4, 3]);
        mat4.translate(worldMatrix, worldMatrix, [0, -2, 0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        vec3.set(vecColor, 1.0, 1.0, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);

        var islandBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, crateBufferObject);
        // this sends data to GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        var islandBufferIndices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, createBufferIndices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

        //each program has it'c vertex and fragment shaders
        var positionAttribLocation = gl.getAttribLocation(programs[0], 'vertPosition');

        // vertex locations
        gl.vertexAttribPointer(
            positionAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );

        // now it's texture
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);


        requestAnimationFrame(drawScene);
    }


    function bindEvents(){
        canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
              return; // Do nothing if the event was already processed
            }
          
            switch (event.key) {
                case "s":
                // code for "s" key press.
                    eye[1] -= 0.5;
                break;
                case "w":
                // code for "w" key press.
                    eye[1] += 0.5;
                break;
                case "a":
                // code for "a" key press.
                    eye[0] -= 0.5;
                break;
                case "d":
                // code for "d" key press.
                    eye[0] += 0.5;
                break;
                case "q": //sink - q
                    eye[2] -= 0.5;
                break;
                case "e": //lift - e
                    eye[2] += 0.5;
                break;
                default:
                return; // Quit when this doesn't handle the key event.
            }
             // Cancel the default action to avoid it being handled twice
            event.preventDefault();
          }, true);
          // the last option dispatches the event to the listener first,
          // then dispatches event to window
    }

    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }


    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var deltaY = newY - lastMouseY;
        
        var xDelta = deltaX / 10;
        var yDelta = deltaY / 10;

        vec3.set(center, center[0] + xDelta, center[1] + yDelta , 0);

        lastMouseX = newX
        lastMouseY = newY;
    }

}