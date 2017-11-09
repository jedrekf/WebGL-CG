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
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url + '?ignore-cache=' + Math.random(), true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                reject('Error: Http Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(JSON.parse(request.responseText));
            }
        }
        request.send();
    });
}

function loadObjResource (url) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url + '?ignore-cache=' + Math.random(), true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                reject('Error: Http Status ' + request.status + ' on resource ' + url);
            } else {
                Assimp.parse (request.responseText, 'aaa.obj', function(result){
                    resolve(JSON.parse(result));
                });
            }
        }
        request.send();
    });
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

function degToRad (d) {
    return d * Math.PI / 180;
}