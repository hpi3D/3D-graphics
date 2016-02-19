// define variables required by WebGL
var     gl = null,
		canvas = null,
		glProgram = null,
		fragmentShader = null,
		vertexShader = null;

var     vertexPositionAttribute = null,
		cubeVerticeBuffer = null,
		cubeIndexBuffer = null;

var		texture = null;
		
var 	mvMatrix = mat4.create(),
		pMatrix = mat4.create();
				
var 	angle = 0.01;


function loadTexture()
{
    var numCubeTextures = 0;
    var textureImage = new Array(6);
    var imageSrcs = [
       "images/posx.jpg", "images/negx.jpg", 
       "images/posy.jpg", "images/negy.jpg", 
       "images/posz.jpg", "images/negz.jpg"
    ];
    for (var i = 0; i < 6; i++) {
        textureImage[i] = new Image();
        textureImage[i].onload = function() {
            numCubeTextures++;
            if (numCubeTextures == 6) {
                texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                var axes = [
                   gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
                ];
                for (var j = 0; j < 6; j++) {
                    gl.texImage2D(axes[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[j]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                drawScene();
            }
        }
        textureImage[i].src = imageSrcs[i];
    }

}


function initWebGL()
{
	console.log("initWebGL");

	// get WebGL context and connect it to canvas
	canvas = document.getElementById("my-canvas");
	
	try{
		 gl = canvas.getContext("webgl") ||
			  canvas.getContext("experimental-webgl");
	}catch(e){
	}
	
	if(gl)
	{
		initShaders();
		setupBuffers();
		getMatrixUniforms();
		loadTexture();
		(function animLoop(){
			setupWebGL();
			setMatrixUniforms();
			drawScene();
			requestAnimationFrame(animLoop, canvas);
		})();
	}else{
		alert( "Error: Your browser does not appear to" + "support WebGL.");
	}
}

function setupWebGL()
{
	// set canvas clear color to black
	gl.clearColor(0.0, 0.0, 0.0, 1.0); 	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 	
	gl.enable(gl.DEPTH_TEST);
	
	// set viewport & make the view rotate on y axis
	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 1000.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, 0.0]);              
	mat4.rotate(mvMatrix, mvMatrix, angle, [0.0, 1.0, 0.0]);              
	angle += 0.01;
}

function initShaders()
{
	//get shader source
	 var    fs_source = document.getElementById('shader-fs').innerHTML,
			vs_source = document.getElementById('shader-vs').innerHTML;
	
	//compile shaders
	vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
	fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
	
	//create program
	glProgram = gl.createProgram();
	
	//attach and link shaders to the program
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);
	
	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		 alert("Unable to initialize the shader program.");
	}
	
	//use program
	gl.useProgram(glProgram);
}

function makeShader(src, type)
{
	//compile the vertex shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		 alert("Error compiling shader: " +
			  gl.getShaderInfoLog(shader));
	}

	return shader;
}

function setupBuffers()
{
	var cubeVertices = [ 
		// front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0, 			
		-1.0, 1.0, 1.0,

		// back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,		
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,		

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		1.0,  1.0,  1.0,
		1.0,  1.0, -1.0,
		
		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		
		// Right face
		1.0, -1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0,  1.0,  1.0,
		1.0, -1.0,  1.0,
		
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	];

	var cubeIndices = [ 
		0, 1, 2,      0, 2, 3,    // Front face	
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face	
	];


	console.log("setupBuffers");

	// create & bind vertice buffer
	cubeVerticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
	cubeVerticeBuffer.itemSize = 3;
	cubeVerticeBuffer.numItems = 24;

	// create & bind index buffer
	cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cubeIndices), gl.STATIC_DRAW);
	cubeIndexBuffer.itemSize = 1;
	cubeIndexBuffer.numItems = 36;

}

// get uniform locations
function getMatrixUniforms(){
	glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
	glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");          
	glProgram.samplerUniform = gl.getUniformLocation(glProgram, "uSampler");          
}

// set uniform data
function setMatrixUniforms() {
	gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
}

function drawScene()
{
	console.log("drawScene");

	// pass vertex position to vertex shader
	vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticeBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	// pass index data to vertex shader
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
	
	gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_BYTE, 0);
}
