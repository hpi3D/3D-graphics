/*******************************************************************************
*  Util.js for 3D Graphics Programming course examples. Contains generic helper 
*  functions.
* 
*  Copyright (c) anssi.grohn@karelia.fi 2013.
*
*******************************************************************************/

// our global WebGL context 
var gl = null;
// Helper object
var Util = {}
Util.handleTexture = function(tex){

    // make sure we are handling proper texture object
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // flip image aound
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/* ---------- Utility function, allows to compile shaders   ---------- */
Util.compileShader = function( id )
{
    // access script element according to id (using jQuery)
    var script = $("#"+id);
    // access text source 
    var src = script.text();
    var shader = null;
    
    // determine shader type and create appropriate shader 
    if (script[0].type == "x-shader/x-vertex" )
    {
	shader = gl.createShader(gl.VERTEX_SHADER);
    } 
    else if ( script[0].type == "x-shader/x-fragment" ) 
    {
	shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else 
    {
	console.log('Unknown shader type:', script[0].type);
	return null;
    }
    // set shader source (text)
    gl.shaderSource( shader, src);
    
    // compile shader source
    gl.compileShader(shader);
    
    // check if the compilation went ok, otherwise
    var ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	
    if ( !ok ) {
	console.log('shader failed to compile: ', gl.getShaderInfoLog(shader));
	    return null;
    }
    
    return shader;
}
/* ---------- WebGL context init  ---------- */
Util.InitGL = function(canvas)
{
    
    try {
	// get webgl context
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	
    } catch(e) {
	console.log(e);
    }
    
    if (!gl) {
	console.log("Could not initialise WebGL, sorry :-(");
    } else {
	console.log("WebGL initialized ok!");
    }
}
/* ---  Creates shader program from two given element IDs --- */
Util.createShaderProgramFrom = function( vs_id, fs_id ) {
    
    // compile vertex and fragment shaders
    var vs = Util.compileShader(vs_id);
    var fs = Util.compileShader(fs_id);

    // Create actual shader program
    var program  = gl.createProgram();
    
    // Attach shaders into shader program
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    
    // link shader program
    gl.linkProgram(program);
    
    // check if the shader program was successfully linked
    var ok = gl.getProgramParameter( program, gl.LINK_STATUS);
    if ( !ok ){
	console.log('Could not link shaders:' + 
		    gl.getProgramInfoLog( program));
    }
    program.attrib = {}
    program.uniform = {}

    return program;
}
