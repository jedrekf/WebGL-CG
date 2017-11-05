// helpers

function loadTextResource (url) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url + '?ignore-cache=' + Math.random(), true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                reject('Error: Http Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(request.responseText);
            }
        }
        request.send();
    });
}

function loadImage (url) {
    return new Promise((resolve, reject) => {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        }
        image.onerror = () => reject(image.status);
        image.src = url;            
    });
}

function loadJSONResource (url) {
    return loadTextResource(url);
}

function createProgram (gl, vertexShader, fragmentShader) {
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
}

function createShader (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function setShadersAndAttributes (gl, setters, buffers) {
    setters = setters.attribSetters || setters;
    Object.keys(buffers.attribs).forEach(function (name) {
        var setter = setters[name];
        if (setter) {
            setter(attribs[name]);
        }
    });

    if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
}

function resizeCanvasToDisplaySize (canvas, multiplier) {
    multiplier = multiplier || 1;
    var width = canvas.clientWidth * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function getWebGl () {
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
}

function degToRad (d) {
    return d * Math.PI / 180;
}


function computeMatrix (viewProjectionMatrix, translation, xRotation, yRotation) {
    var matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, xRotation);
    return m4.yRotate(matrix, yRotation);
}
