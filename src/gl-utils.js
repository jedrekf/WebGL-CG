var GlUtils = function () {
    this.getWebGl = function () {
        canvas = document.getElementById('window')
        gl = canvas.getContext('webgl');
        if (!gl) {
            console.log('Falling back on experimental webgl');
            gl = cavas.getContext('experimental-webgl');
        }
        if (!gl) {
            alert('webgl init failed.');
        }

        return gl;
    };

    this.createProgram = function (gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    };

    this.createShader = function (gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    };

    this.createBuffers = function (gl){
        var vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);

        var indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

        var normalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBufferObject);
    };

    this.drawObject = function(gl, program, obj, vecColor,  worldMatrix, viewMatrix, projMatrix) {

        gl.useProgram(program);

        var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
        var vecColorUniform = gl.getUniformLocation(program, 'vColor');

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        
        gl.uniform3fv(vecColorUniform, vecColor);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

        //each program has it'c vertex and fragment shaders
        var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');

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
        
        var normalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);

        var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
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
    };
};