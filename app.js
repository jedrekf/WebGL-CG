'use strict'

var gl;
var model;

var App = new function(){
    this.Init = function(){
        loadTextResource('./shaders/box.vs.GLSL', function(vsErr, vsText){
            if(vsErr){
                console.log(vsErr);
            } else{
                loadTextResource('./shaders/box.fs.GLSL', function(fsErr, fsText){
                    if(fsErr){
                        console.log(fsErr);
                    } else{
                        loadJSONResource('./models/palm_tree.json', function(modelErr, modelObj){
                            if(modelErr){
                                console.error(modelErr);
                            } else{
                                loadImage('./textures/crate_side.svg', function(imgErr, img){
                                    if(imgErr){
                                        console.error(imgErr);
                                    } else{
                                        Run(vsText, fsText, img, modelObj);                                                                        
                                    }
                                });
                                console.log(modelObj);
                            }
                        });
                    }
                });
            }
        });
    }

    function Run(boxVertexShaderText, boxFragmentShaderText, img,  modelObj) {
        var canvas = document.getElementById('window')
        gl = canvas.getContext('webgl');
        model = modelObj;

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
        // rasterizer: we tell it to only draw a pixel on already drawn pixel if it's closer
        gl.enable(gl.DEPTH_TEST);
        // back culling
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        /**
         * BOX
         */
        
        var boxVertexShader = Instance.createShader(gl, gl.VERTEX_SHADER, boxVertexShaderText);
        var boxFragmentShader = Instance.createShader(gl, gl.FRAGMENT_SHADER, boxFragmentShaderText);
        var programBox = Instance.createProgram(gl, boxVertexShader, boxFragmentShader);

        var box = Generator.getBox();
        var boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        // this sends data to GPU
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(box.vertices), gl.STATIC_DRAW);

        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(box.indices), gl.STATIC_DRAW);

        var positionAttribLocation = gl.getAttribLocation(programBox, 'vertPosition');
        var texCoordAttribLocation = gl.getAttribLocation(programBox, 'vertTexCoord');

        // vertex locations
        gl.vertexAttribPointer(
            positionAttribLocation, //Attr location
            3, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
            0 // offset from beginning of a single vertex to ths attr
        );
        // now it's texture
        gl.vertexAttribPointer(
            texCoordAttribLocation, //Attr location
            2, // number of elements per attr
            gl.FLOAT, // type of elements
            gl.FALSE,
            5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (we have here 2d vertices)
            3 * Float32Array.BYTES_PER_ELEMENT // offset from beginning of a single vertex to ths attr
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(texCoordAttribLocation);

        /**
         * Create Texture
         */
        var boxTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        // S and T are coords, thos things are done on a texture but can be changed later
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, 
            img
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        //indicate to use this program for transformations
        gl.useProgram(programBox);

        /**
         * Creating Matrices for world, view and projection
         */
        var matWorldUniformLocation = gl.getUniformLocation(programBox, 'mWorld');
        var matViewUniformLocation = gl.getUniformLocation(programBox, 'mView');
        var matProjUniformLocation = gl.getUniformLocation(programBox, 'mProj');

        var worldMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);
        var projMatrix = new Float32Array(16);
        mat4.identity(worldMatrix);
        worldMatrix[12] = 2; // translation 12=x, 13=y, 14=z 



        mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0], [0,1,0]);
        mat4.perspective(projMatrix, glMatrix.toRadian(45),canvas.width/canvas.height, 0.1, 1000.0);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

        var xRotationMatrix = new Float32Array(16);
        var yRotationMatrix = new Float32Array(16);


        /**
         * Main render loop
         * (Draw triangle for now)
         */
        var identitymatrix = new Float32Array(16);
        mat4.identity(identitymatrix);
        var angle = 0;
        var loop = function(){
            //angle = performance.now() / 1000 / 6*2*Math.PI;
            //mat4.rotate(yRotationMatrix, identitymatrix, angle, [0,1,0]);
            //mat4.rotate(xRotationMatrix, identitymatrix, angle/2, [1,0,0]);
            //mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

            gl.bindTexture(gl.TEXTURE_2D, boxTexture);
            gl.activeTexture(gl.TEXTURE0);

            gl.drawElements(gl.TRIANGLES, box.indices.length, gl.UNSIGNED_SHORT, 0);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

}