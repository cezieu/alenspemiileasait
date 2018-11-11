var scene, camera, renderer, mesh;
var meshFloor, ambientLight, light;
var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};

var USE_WIREFRAME = false;
function getRWidth(){
//if(window.matchMedia("(orientation: portrait)").matches) return window.screen.height;
//else return window.screen.width;
return window.devicePixelRatio*window.screen.width;
}
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};		
var loadingManager = null;
var RESOURCES_LOADED = false;

// Models index
var models = {
	tastatura: {
		obj:"models/tastatura.obj",
		mtl:"models/tastatura.mtl",
		mesh: null
	}
};

// Meshes index
var meshes = {};


function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90,getRWidth()/720, 0.1, 1000);


	//loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};

/*	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20,20, 10,10),
		new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);*/


	ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

	// Load models
	// REMEMBER: Loading in Javascript is asynchronous, so you need
	// to wrap the code in a function and pass it the index. If you
	// don't, then the index '_key' can change while the model is being
	// downloaded, and so the wrong model will be matched with the wrong
	// index key.
	for( var _key in models ){
		(function(key){

			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();

				var objLoader = new THREE.OBJLoader(loadingManager);

				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){

					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							node.castShadow = true;
							node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;

				});
			});

		})(_key);
	}


	camera.position.set(0, 0, -8);
	camera.lookAt(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(getRWidth(), 720)

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.getElementById("frame").appendChild(renderer.domElement);

	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded(){

	// Clone models into meshes.
	meshes["tastatura"] = models.tastatura.mesh.clone();

	// Reposition individual meshes, then add meshes to scene
	meshes["tastatura"].position.set(0, 0,0);
	meshes["tastatura"].rotation.set(0, Math.PI, 0); // Rotate it to face the other way.
	scene.add(meshes["tastatura"]);
}

function animate(){

	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);

		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);

	// Uncomment for absurdity!
	 //meshes["pirateship"].rotation.z += 0.01;
	 controls = new THREE.OrbitControls(camera, renderer.domElement);
					 controls.enableDamping = true;
					 controls.dampingFactor = 0.25;
					 controls.enableZoom = true;

	renderer.render(scene, camera);
}



window.onload = init;
