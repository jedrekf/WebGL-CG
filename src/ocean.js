var Ocean = function(){
    var gl_utils = new GlUtils();
    
    this.deltaTime = 0;
    
    var aCoords;
    var uModelview;
    var uProjection;
    var uWorld;
    var texID;

    this.water = {};

    this.createOcean = function(gl, program, image) {
        gl.useProgram(program);
        
        aPos = gl.getAttribLocation(program, "vertPosition");
        aCoords =  gl.getAttribLocation(program, "vertTexCoord");
        uModelview = gl.getUniformLocation(program, "modelview");
        uProjection = gl.getUniformLocation(program, "projection");
        uWorld = gl.getUniformLocation(program, "world");
        
        gl.enableVertexAttribArray(aCoords);

        var texID = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texID);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    

        this.water = createModel(Generator.getWater());


    };


    this.render = function(gl, program, worldMatrix, viewMatrix, projectionMatrix) {
        gl.useProgram(program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.clearColor(1.0, 1.0, 1.0, 0);

        gl.uniformMatrix4fv(uProjection, false, projectionMatrix );
        
        gl.uniformMatrix4fv(uWorld, false,  worldMatrix); 
        gl.uniformMatrix4fv(uModelview, false,  viewMatrix);
        modelview = viewMatrix;
        
        if (texID)
            this.water.render();
    };

    this.createBinds = function() {
        //bind to fields with numbers and to uModelView for scaling rotation and shit
    };

    function createModel(modelData) {
        var model = {};
        model.coordsBuffer = gl.createBuffer();
        model.indexBuffer = gl.createBuffer();
        model.vertexBuffer = gl.createBuffer();
        model.count = modelData.indices.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, modelData.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vertexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

        model.render = function() { 
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
            gl.vertexAttribPointer(aCoords, 2, gl.FLOAT, gl.TRUE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.enableVertexAttribArray(aCoords);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(
                aPos, //Attr location
                3, // number of elements per attr
                gl.FLOAT, // type of elements
                gl.FALSE,
                3 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
                0 // offset from beginning of a single vertex to ths attr
            );
            gl.enableVertexAttribArray(aPos);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            
            // BIND TEXTURE
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.activeTexture(gl.TEXTURE0);

            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        };
        return model;
    }

};