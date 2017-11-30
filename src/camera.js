var Camera = function(){
	
	this.eye = [0, 0, -1]; // where are we
    this.center = [0, 0, 0]; // point we look at
    this.up = [0, 1, 0]; //vec3 pointing up

	this.init = function(){
        //prepare camera
        this.cameraMatrix = new Float32Array(16);
        mat4.lookAt(this.cameraMatrix, this.eye, this.center, this.up);
       

        //bind events
    	var self = this;
        canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = e => handleMouseMove(e, self);


        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
              return; // Do nothing if the event was already processed
            }
            
            speed = performance.now() / 20000;

            switch (event.key) {
                case "w":
                // code for "s" key press.
                    mat4.translate(self.cameraMatrix, self.cameraMatrix,[0, 0, -speed]);
                break;
                case "s":
                // code for "w" key press.
                    mat4.translate(self.cameraMatrix, self.cameraMatrix, [0, 0, speed]);
                break;
                case "a":
                // code for "a" key press.
                     mat4.translate(self.cameraMatrix, self.cameraMatrix, [-speed, 0, 0]);
                break;
                case "d":
                // code for "d" key press.
                     mat4.translate(self.cameraMatrix, self.cameraMatrix, [speed, 0, 0]);
                break;
                case "q": //sink - q
                     mat4.translate(self.cameraMatrix, self.cameraMatrix, [0, -speed, 0]);
                break;
                case "e": //lift - e
                     mat4.translate(self.cameraMatrix, self.cameraMatrix, [0, speed, 0]);
                break;
                default:
                return; // Quit when this doesn't handle the key event.
            }
             // Cancel the default action to avoid it being handled twice
            event.preventDefault();
          }, true);
          // the last option dispatches the event to the listener first,
          // then dispatches event to window
    };

    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    };


    function handleMouseUp(event) {
        mouseDown = false;
    };


    function handleMouseMove(event, self) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;

        //have to use some trigonometric sin cos here?
        var s = Math.sin(degToRad(deltaY));
        var c = Math.sin(degToRad(deltaX));

        mat4.rotateY(self.cameraMatrix, self.cameraMatrix, c);
        //mat4.rotateX(self.cameraMatrix, self.cameraMatrix, s);
        
        lastMouseX = newX;
        lastMouseY = newY;
    };
}