var Init = function () {
    console.log("Init.");

    var canvas = document.getElementById('window')
    var gl = canvas.getContext('webgl');

    if(!gl){
        console.log('Falling back on experimental webgl');
        gl = cavas.getContext('experimental-webgl');
    }

    if(!gl){
        alert('wegl init failed.');
    }

    //setting color of paint
    gl.clearColor(0.75, 0.85, 0.8, 1.0);  
    //perform paint 'from?' depth and color buffers
    //depth buffer holds the z value
    //color buffer holds color info
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    /**
     * Creating Shaders
     */
    var vertexShaderText = document.getElementById("vertexShader.GLSL").textContent;
    var fragmentShaderText = document.getElementById("fragmentShader.GLSL").textContent;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('error compiling vertex shader! ', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('error compiling fragment shader! ',  gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.log("ERROR linking program!", gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.log("ERROR linking program!", gl.getProgramInfoLog(program));
    }

    /**
     * Create Buffer
     * create vertex list
     */
    var triangleVertices = 
[   // X, Y                R, G, B
    0.0, 0.5, 0.0,      1.0, 0.2, 0.0,
    -0.5, -0.5, 0.0,    0.2, 1.0, 0.2,
    0.5, -0.5, 0.0,     0.1, 0.3, 1.0
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    // this sends data to GPU
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    
    // vertex locations
    gl.vertexAttribPointer(
        positionAttribLocation, //Attr location
        3, // number of elements per attr
        gl.FLOAT, // type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
        0 // offset from beginning of a single vertex to ths attr
    );

    // color colors
    gl.vertexAttribPointer(
        colorAttribLocation, //Attr location
        3, // number of elements per attr
        gl.FLOAT, // type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
        3 * Float32Array.BYTES_PER_ELEMENT // offset from beginning of a single vertex to ths attr
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //indicate to use this program for transformations
    gl.useProgram(program);
    
    /**
     * Creating Matrices for word, view and projection
     */
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0,0,-4], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45),canvas.width/canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    /**
     * Main render loop
     * (Draw triangle for now)
     */
    var identitymatrix = new Float32Array(16);
    mat4.identity(identitymatrix);
    var angle = 0;
    var loop = function(){
        angle = performance.now() / 1000 / 6*2*Math.PI;
        mat4.rotate(worldMatrix, identitymatrix, angle, [0,1,0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}



