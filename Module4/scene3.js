/*************************************************************
 *  3D Graphics Programming
 *
 *  Mesh loading and camera movement demo code with Three.js (r69)
 *
 *  anssi.grohn@karelia.fi 2014-2015.
 *************************************************************/
// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];

// HPI: added new parameters
// for waving arm objects 
var armObjects = [];
var angle = 0.0;


$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    // create scene
    scene = new THREE.Scene();
    // camera will be the the child of camObject
    camObject.add(camera);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;

    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;

    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.BoxGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshBasicMaterial({
				     map: rockTexture,
				     transparent: true
				 }));
    // do a little magic with vertex coordinates so ground looks more intersesting.
    $.each( ground.geometry.faceVertexUvs[0], function(i,d){
		d[0] = new THREE.Vector2(0,25);
		d[2] = new THREE.Vector2(25,0);
		d[3] = new THREE.Vector2(25,25);
    });

    // add ground to scene
    scene.add(ground);

    // mesh loading functionality
    var loader = new THREE.JSONLoader();
    function handler( geometry, materials ){
		ruins.push( new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
			{
				map: rockTexture,
				transparent: true
			})));
		checkIsAllLoaded();
    }

    function checkIsAllLoaded(){

		if ( ruins.length == 5 ){
			$.each(ruins, function(i,mesh){
				// rotate 90 degrees
				mesh.rotation.x = Math.PI/2;
				scene.add(mesh);		
		    });

			// arcs
			ruins[0].position.z = 13;
			// corner
			ruins[1].position.x = 13;
			// crumbled place
			ruins[2].position.x = -13;
			ruins[3].position.z = -13;
		}
    }

    // loading of meshes 
    loader.load("meshes/ruins30.js", handler);
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler);
    loader.load("meshes/ruins35.js", handler);

	console.log("calling drawArm");

	// call function that draws the arm object
	drawArm();

    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
		mouse.down = true;
		mouse.prevY = ev.pageY;
		mouse.prevX = ev.pageX;
    }

    
    document.onmouseup = function(ev){
		mouse.down = false;
    }

    document.onmousemove = function(ev){
		if ( mouse.down ) {
			var rot = (ev.pageY - mouse.prevY) * 0.01;
			var rotY = (ev.pageX - mouse.prevX) * 0.01;
			camObject.rotation.y -= rotY;
			camera.rotation.x -= rot;
			mouse.prevY = ev.pageY;
			mouse.prevX = ev.pageX;
		}
    }

    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
		keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
		keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });
    

});

//********************************************************************
//
//	HPI: Added new function that draws the arm objects
//	based on the object data defined in array as follows:
//
//	parameter 1: 		define geometry type
//						0 = sphere, 1 = box
//	parameters 2-4: 	define geometry measurements
//						for sphere: radius, width & height segments
//						for box: width, height & depth
//	parameter 5: 		define object's hierarchy level (0=top)
//	parameter 6: 		define object color in hex
//	parameter 7-8:		define position on x and y axes
//	parameter 9: 		define rotation on z axis
//
//********************************************************************

function drawArm() {
	objData = [
		0, 0.15, 16, 16, 0, 0xFF0000, 0.0, 0.75, 0,			// shoulder
		1, 0.5, 0.1, 0.1, 1, 0x00FF00, 0.35, 0.0, 0,		// upper arm
		0, 0.1, 16, 16, 2, 0x00AAFF, 0.3, 0.0, 0,			// elbow
		1, 0.4, 0.08, 0.08, 3, 0xFFFF00, 0.25, 0.0, 0,		// lower arm
		1, 0.15, 0.15, 0.15, 4, 0x0000FF, 0.25, 0.0, 0,		// palm
		1, 0.12, 0.03, 0.03, 5, 0xFFAAAA, 0.0, -0.1, -1,	// thumb
		1, 0.12, 0.03, 0.03, 5, 0xFFAAAA, 0.12, -0.06, 0,	// finger 1
		1, 0.12, 0.03, 0.03, 5, 0xFFAAAA, 0.12, -0.005, 0,	// finger 2
		1, 0.12, 0.03, 0.03, 5, 0xFFAAAA, 0.12, 0.05, 0		// finger 3
	];

	console.log("drawArm function begins");

	var index = 0;
	for (var i = 0; i<=8; i++) {
		console.log("for loop, i = ", i);

		index = i * 9;
		if (objData[index] == 0) {
			armObjects[i] = new THREE.Mesh( new THREE.SphereGeometry(objData[index+1], objData[index+2], objData[index+3]),
						 new THREE.MeshBasicMaterial({
							 color: objData[index+5],
							 transparent: true
						 }));
		} else {
			armObjects[i] = new THREE.Mesh( new THREE.BoxGeometry(objData[index+1], objData[index+2], objData[index+3]),
						 new THREE.MeshBasicMaterial({
							 color: objData[index+5],
							 transparent: true
						 }));
		}
		
		if (objData[index+4] == 0) {
			scene.add(armObjects[i]);
			console.log("drawArm function: scene.add()");
		} else {
			armObjects[objData[index+4]-1].add(armObjects[i]);
			console.log("drawArm function: armObject[].add()");
		}

		armObjects[i].position.x = objData[index+6];
		armObjects[i].position.y = objData[index+7];
		armObjects[i].rotation.z = objData[index+8];
	};
}

function update(){

    // render everything 
    renderer.setClearColor(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    
    if ( keysPressed["W".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, 0.1 );
    }
    
    if ( keysPressed["S".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, -0.1 );
    }

    if ( keysPressed["A".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyEuler( camObject.rotation);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, -0.1 );
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyEuler( camObject.rotation);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, 0.1);
    }

	// HPI: Added functionality to make
	// the arm wave cyclically

	if (angle == 360) {
		angle = 0;
	} 
	angle = angle + 0.01;

	armObjects[0].rotation.z = 1.5 + Math.sin(angle);				// rotate shoulder
	armObjects[2].rotation.z = Math.sin(angle - Math.PI / 2);		// rotate elbow
	armObjects[4].rotation.y = Math.sin(angle);						// rotate palm

    // request another frame update
    requestAnimationFrame(update);
}
 