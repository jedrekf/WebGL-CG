var gl;
var model;
var canvas;
var mouseDown = false;
var lastMouseX;
var lastMouseY;


var App = function () {
    var programs = [];
    var img;
    var eye;
    var center;
    var up;
    var gl_utils = new GlUtils();

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
            loadObjResource('./models/palm_tree.obj'),
            loadImage('./textures/crate_side.svg')]).
            then( function (data) {
                var s = shaderPairsCount*2;
                var shaders = data.slice(0, s);
                var models = data.slice(s, s + modelsCount);
                s += modelsCount;
                var textures = data.slice(s, s + texturesCount);

                Run(shaders, models, textures);
        }).catch(errors => console.error(errors));
    };


    function Run (shaders, models, textures) {
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
        var boxVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[2]);
        var boxFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[3]);
        var programBox = gl_utils.createProgram(gl, boxVertexShader, boxFragmentShader);

        var basicVertexShader = gl_utils.createShader(gl, gl.VERTEX_SHADER, shaders[0]);
        var basicFragmentShader = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, shaders[1]);
        var basicProgram = gl_utils.createProgram(gl, basicVertexShader, basicFragmentShader);

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
        eye = [0, 0, -8]; // where are we
        center = [0, 0, -1.0]; // point we look at
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
        var camMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        var vecColor = new Float32Array(3);
       
       
        mat4.lookAt(camMatrix, eye, center, up);
        mat4.invert(viewMatrix, camMatrix);
        mat4.perspective(projMatrix, degToRad(90), aspect, 0.1, 1000.0);

        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
       
        
        vec3.set(vecColor, 0.376, 0.7, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);

        /**
         * Palms
         */
        // Set buffers
        var obj = objects[0];

        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [150, -100.0, 0]);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        var palmVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, palmVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        var palmIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, palmIndexBufferObject);
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
        gl.enableVertexAttribArray(positionAttribLocation);
        
        var palmNormalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, palmNormalsBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);

        var normalAttribLocation = gl.getAttribLocation(programs[0], 'vertNormal');
        
        gl.vertexAttribPointer(
            normalAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.TRUE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );
        gl.enableVertexAttribArray(normalAttribLocation);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        //second palm
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.02, 0.02, 0.02]);
        mat4.translate(worldMatrix, worldMatrix, [30, -100.0, 0]);  

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        /**
         * Crate
         */
        // using external function

        // mat4.identity(worldMatrix);
        // mat4.scale(worldMatrix, worldMatrix, [0.5, 0.5, 0.5]);
        // mat4.translate(worldMatrix, worldMatrix, [0, -2.2, -2]);
        // vec3.set(vecColor, 1.0, 0.313, 0.117);

        //gl_utils.drawObject(gl, programs[0], objects[1], vecColor,  worldMatrix, viewMatrix, projMatrix);

        /////////////////////

        gl.useProgram(programs[0]);
        var obj = objects[1];
        
        //move object
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [0.5, 0.5, 0.5]);
        mat4.translate(worldMatrix, worldMatrix, [0, -2.2, -2]);
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
        gl.enableVertexAttribArray(positionAttribLocation);


        var boxNormalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxNormalsBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);

        var normalAttribLocation = gl.getAttribLocation(programs[0], 'vertNormal');
        
        gl.vertexAttribPointer(
            normalAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.TRUE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );
        gl.enableVertexAttribArray(normalAttribLocation);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);

        /**
         * Island
         */
        gl.useProgram(programs[0]);
        var obj = objects[2];
        
        //move object
        mat4.identity(worldMatrix);
        mat4.scale(worldMatrix, worldMatrix, [3.0, 0.5, 2.0]);
        mat4.translate(worldMatrix, worldMatrix, [0, -5.0, 0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        vec3.set(vecColor, 1.0, 1.0, 0.117);
        gl.uniform3fv(vecColorUniform, vecColor);

        var islandBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, islandBufferObject);
        // this sends data to GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        var islandBufferIndices = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, islandBufferIndices);
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

        gl.enableVertexAttribArray(positionAttribLocation);


        var islandNormalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, islandNormalsBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);

        var normalAttribLocation = gl.getAttribLocation(programs[0], 'vertNormal');
        
        gl.vertexAttribPointer(
            normalAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.TRUE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );
        gl.enableVertexAttribArray(normalAttribLocation);

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);


        requestAnimationFrame(drawScene);
    }


    // function bindEvents(){
    //     canvas.onmousedown = handleMouseDown;
    //     document.onmouseup = handleMouseUp;
    //     document.onmousemove = handleMouseMove;

    //     window.addEventListener("keydown", function (event) {
    //         if (event.defaultPrevented) {
    //           return; // Do nothing if the event was already processed
    //         }
          
    //         switch (event.key) {
    //             case "s":
    //             // code for "s" key press.
    //                 eye[2] -= 0.5;
    //             break;
    //             case "w":
    //             // code for "w" key press.
    //                 eye[2] += 0.5;
    //             break;
    //             case "a":
    //             // code for "a" key press.
    //                 eye[0] += 0.5;
    //             break;
    //             case "d":
    //             // code for "d" key press.
    //                 eye[0] -= 0.5;
    //             break;
    //             case "q": //sink - q
    //                 eye[1] -= 0.5;
    //             break;
    //             case "e": //lift - e
    //                 eye[1] += 0.5;
    //             break;
    //             default:
    //             return; // Quit when this doesn't handle the key event.
    //         }
    //          // Cancel the default action to avoid it being handled twice
    //         event.preventDefault();
    //       }, true);
    //       // the last option dispatches the event to the listener first,
    //       // then dispatches event to window
    // }

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

        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;
        
        var xDelta = deltaX / 10;
        var yDelta = deltaY / 10;

        //vec3.set(eye, eye[0] - xDelta , eye[1] + yDelta, eye[2]);
        vec3.set(center, center[0] + xDelta, center[1] + yDelta , 0);

        lastMouseX = newX;
        lastMouseY = newY;
    }

}