
var Generator = {

    //should be half a ball
    getIsland: function () {
        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = 2;

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
            }
        }

        var indexData = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        return { vertices: vertexPositionData, indices: indexData, normals: normalData }
    },

    getFromModel: function (model) {
        var palmTreeVertices = model.meshes[0].vertices;
        var palmTreeIndices = [].concat.apply([], model.meshes[0].faces);

        return { vertices: palmTreeVertices, indices: palmTreeIndices };
    },

    getWater: function(){
        return {
            vertices:
            [
                -1, 0, 1,
                1, 0, -1,                
                1, 0, 1, 
                -1, 0, -1 
                
            ],
            indices:
            [
                0, 1, 2, 
                0, 2, 3  
            ]
        };
    },

    getBox: function () {
        return {
            vertices:
            [ // X, Y, Z
                // Top
                -1.0, 1.0, -1.0, 
                -1.0, 1.0, 1.0, 
                1.0, 1.0, 1.0, 
                1.0, 1.0, -1.0,

                // Left
                -1.0, 1.0, 1.0, 
                -1.0, -1.0, 1.0,
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,

                // Right
                1.0, 1.0, 1.0, 
                1.0, -1.0, 1.0,
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,

                // Front
                1.0, 1.0, 1.0, 
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0, 
                -1.0, 1.0, 1.0, 

                // Back
                1.0, 1.0, -1.0, 
                1.0, -1.0, -1.0,
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0, 

                // Bottom
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0, 
                1.0, -1.0, -1.0,
            ],

            indices:
            [
                // Top
                0, 1, 2,
                0, 2, 3,

                // Left
                5, 4, 6,
                6, 4, 7,

                // Right
                8, 9, 10,
                8, 10, 11,

                // Front
                13, 12, 14,
                15, 14, 12,

                // Back
                16, 17, 18,
                16, 18, 19,

                // Bottom
                21, 20, 22,
                22, 20, 23
            ]
        };
    }
}