var Skybox = function(images){
    var gl_utils = new GlUtils();
    this.sideImages = images;
    var texID;
    var aCoords;
    var uModelview;
    var uProjection;
    var uCameraLocation;

    this.createSkybox = function(gl, program, images){
        gl.useProgram(program);
        
        aCoords =  gl.getAttribLocation(program, "coords");
        uModelview = gl.getUniformLocation(program, "modelview");
        uProjection = gl.getUniformLocation(program, "projection");
        uCameraLocation = gl.getUniformLocation(program, "camLocation");

        gl.enableVertexAttribArray(aCoords);
        gl.enable(gl.DEPTH_TEST);
            
        this.cube = createModel(Generator.skybox(200));

        if (images.length == 6) {
            texID = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
            var targets = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
            ];
            for (var j = 0; j < 6; j++) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);                            
                gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[j]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }
        gl.disable(gl.DEPTH_TEST);
    };

    this.render = function(gl, program, viewMatrix, projectionMatrix, cameraMatrix) {
        gl.useProgram(program);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.uniformMatrix4fv(uProjection, false, projectionMatrix );
        //move the skybox so that we can't reach the walls

        var camPos = new Float32Array(16);
        mat4.identity(camPos);
        camPos[12] = cameraMatrix[12];
        camPos[13] = cameraMatrix[13];
        camPos[14] = cameraMatrix[14];

        gl.uniformMatrix4fv(uCameraLocation, false, camPos); 

        modelview = viewMatrix;
    
        if (texID)
            this.cube.render();

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
    };

    function createModel(modelData) {
        var model = {};
        model.coordsBuffer = gl.createBuffer();
        model.indexBuffer = gl.createBuffer();
        model.count = modelData.indices.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
        model.render = function() { 
            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
            gl.vertexAttribPointer(aCoords, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aCoords);
            
            gl.uniformMatrix4fv(uModelview, false, modelview );
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            

            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        };
        return model;
    }
};