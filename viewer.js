  window.addEventListener('DOMContentLoaded', function(){
            // get the canvas DOM element
            var canvas = document.getElementById('renderCanvas');

            // load the 3D engine
            var engine = new BABYLON.Engine(canvas, true);

            // createScene function that creates and return the scene
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
	var meshmodel = new BABYLON.AbstractMesh('CurrModel', scene);
	var timeoutID;
	var clicked = false;
    var currentPosition = { x: 0, y: 0 };
    var currentRotation = { x: 0, y: 0 };
	//variables to set last angle and curr angle in each frame
	//so we can calculate angleDiff and use it for inertia
	var lastAngleDiff = { x: 0, y: 0 };
	var oldAngle = { x: 0, y: 0 };
	var newAngle = { x: 0, y: 0 };
	//variable to check whether mouse is moved or not in each frame
	var mousemov = false;
	//framecount reset and max framecount(secs) for inertia
	var framecount = 0;
	var mxframecount = 120; //4 secs at 60 fps

	scene.beforeRender = function () {
		//set mousemov as false everytime before the rendering a frame
		mousemov = false;
	}

	scene.afterRender = function () { 
		//we are checking if the mouse is moved after the rendering a frame
		//will return false if the mouse is not moved in the last frame
		//possible drop of 1 frame of animation, which will not be noticed 
		//by the user most of the time
		if (!mousemov && framecount <mxframecount) {
			//console.log(lastAngleDiff);
			//divide the lastAngleDiff to slow or ease the animation
			lastAngleDiff.x = lastAngleDiff.x / 1.1;
			lastAngleDiff.y = lastAngleDiff.y / 1.1;
			//apply the rotation
			meshmodel.rotation.x += lastAngleDiff.x;
			meshmodel.rotation.y += lastAngleDiff.y
			//increase the framecount by 1
			//this doesnt make sense right now as it resets
			//after reaching max and continues in the loop
			//thinking of a way to fix it
			framecount++;
			currentRotation.x = meshmodel.rotation.x;
            currentRotation.y = meshmodel.rotation.y;
		} else if(framecount>=mxframecount) {
			framecount = 0;
		}
	};
	
    //Adding a light
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);

    //Adding an Arc Rotate Camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
    //camera.attachControl(canvas, false);
        let loader = new BABYLON.AssetsManager(scene);
        loader.useDefaultLoadingScreen = true;  // Set to false to remove the default loading
        let mesh_loaded_task = loader.addMeshTask("loadin","","./", "untitled.obj");

        mesh_loaded_task.onSuccess = function (task) {
             task.loadedMeshes.forEach(function(m) {
                console.log("Loaded!");
                m.position = BABYLON.Vector3.Zero();
				camera.target = m;
				meshmodel = m;
             });
        };


        loader.onFinish = function() {
           engine.runRenderLoop(function () {
                scene.render();
            });
        };
        loader.load();

    canvas.addEventListener("pointerdown", function (evt) {
                currentPosition.x = evt.clientX;
                currentPosition.y = evt.clientY;
                currentRotation.x = meshmodel.rotation.x;
                currentRotation.y = meshmodel.rotation.y;
                clicked = true;
				console.log(canvas);
    });

    canvas.addEventListener("pointermove", function (evt) {
		
		if (clicked) {
			//set mousemov as true if the pointer is still down and moved
			mousemov = true;
		}
        if (!clicked) {
            return;
        }
		//set last angle before changing the rotation
		oldAngle.x = meshmodel.rotation.x;
		oldAngle.y = meshmodel.rotation.y;
		//rotate the mesh
        meshmodel.rotation.y -= (evt.clientX - currentPosition.x) / 300.0;
        meshmodel.rotation.x -= (evt.clientY - currentPosition.y) / 300.0;
		//set the current angle after the rotation
		newAngle.x = meshmodel.rotation.x;
		newAngle.y = meshmodel.rotation.y;
		//calculate the anglediff
		lastAngleDiff.x = newAngle.x - oldAngle.x;
		lastAngleDiff.y = newAngle.y - oldAngle.y;
		currentPosition.x = evt.clientX;
		currentPosition.y = evt.clientY;
    });
	
    canvas.addEventListener("pointerup", function (evt) {
        clicked = false;
    });
    // Move the light with the camera
    scene.registerBeforeRender(function () {
        light.position = camera.position;
    });
	scene.activeCamera = camera;scene.activeCamera.attachControl(canvas);	

    return scene;
}
		
       // Zeichne
       engine.runRenderLoop(function () {
           scene.render();
       });

       // Resize
       window.addEventListener("resize", function () {
           engine.resize();
       });
            // call the createScene function
            var scene = createScene();

            // run the render loop
           engine.runRenderLoop(function(){
               scene.render();
            });

            // the canvas/window resize event handler
            window.addEventListener('resize', function(){
                engine.resize();
            });
        });