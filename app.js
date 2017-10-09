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
    [ // X, Y       R, G, B
    0.0, 0.5,       1.0, 0.2, 0.0,
    -0.5, -0.5,     0.2, 1.0, 0.2,
    0.5, -0.5,       0.1, 0.3, 1.0
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
        2, // number of elements per attr
        gl.FLOAT, // type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
        0 // offset from beginning of a single vertex to ths attr
    );

    // color colors
    gl.vertexAttribPointer(
        colorAttribLocation, //Attr location
        3, // number of elements per attr
        gl.FLOAT, // type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
        2 * Float32Array.BYTES_PER_ELEMENT // offset from beginning of a single vertex to ths attr
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    /**
     * Main render loop
     * (Draw triangle for now)
     */

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}



