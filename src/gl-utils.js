var GlUtils = function () {
    this.buffers = {};
    this.textures = [];

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

        var texCoordBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObject);

        this.buffers.vertexBufferObject = vertexBufferObject;
        this.buffers.indexBufferObject = indexBufferObject;
        this.buffers.normalsBufferObject = normalsBufferObject;
        this.buffers.texCoordBufferObject = texCoordBufferObject;
    };

    this.bindTexture = function(gl, textureImage){
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE,
            textureImage
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    };

    this.bindSkybox = function(gl, images){

    }

    this.drawObject = function(gl, program, obj, vecColor,  worldMatrix, viewMatrix, projMatrix, texture, move) {

        gl.useProgram(program);

        var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
        
        if(!texture){
            var vecColorUniform = gl.getUniformLocation(program, 'vColor');
            gl.uniform3fv(vecColorUniform, vecColor);
        }

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBufferObject)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  this.buffers.indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

        var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        gl.vertexAttribPointer(
            positionAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
            0 // offset from beginning of a single vertex to ths attr
        );
        gl.enableVertexAttribArray(positionAttribLocation);
        

        // var normalsBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,  this.buffers.normalsBufferObject);
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

        if(texture) {
            var textCoords = model.vertices; // maybe normalize
            
            gl.bindBuffer(gl.ARRAY_BUFFER,  this.buffers.texCoordBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texturecoords), gl.STATIC_DRAW);
    
            var textureCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
            gl.vertexAttribPointer(
                textureCoordAttribLocation, //Attr location
                2, // number of elements per attr
                gl.FLOAT, // type of elements
                gl.TRUE,
                2 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
                0 // offset from beginning of a single vertex to ths attr
            );
            gl.enableVertexAttribArray(textureCoordAttribLocation);

            // BIND TEXTURE
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.activeTexture(gl.TEXTURE0);
        }

        gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
    };

    this.setDefaultUniforms = function(program, defaults){
        var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
        var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sun.direction');
        var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sun.color');

        gl.uniform3fv(ambientUniformLocation, defaults.ambient);
        gl.uniform3fv(sunlightDirUniformLocation, defaults.direction);
        gl.uniform3fv(sunlightIntUniformLocation, defaults.color);

    };
};