var gl;
function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    console.log("1");
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }

}


function getShader(gl, id) {
  console.log("2");

  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


var shaderProgram;

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}



var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
function initBuffers(){
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer); // toujour utiliser ce buffer
  console.log("4");
  var vertices = [
    0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
  ];
  // Utiliser l'array vertices pour remplir le buffer ( qui est triangleVertexPositionBuffer )
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // ajouter des proprieter a notre objet triangleVertexPositionBuffer ( pas liÉ a webgl juste pour nous)
  // dans le array de 9 c'est 3 vertex qui sont representer
  triangleVertexPositionBuffer.itemSize = 3; // nombre de chiffre representant un vertex
  triangleVertexPositionBuffer.numItems = 3; // nombre de vertex

  //on cree maintenant le carre
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
    1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
    1.0, -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;
}

function drawScene() {
  //on met au courant webgl a propos du canvas avec viewport
  gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight);
  //on netoye le canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //set up la perspective ( la camera )
  // 45 degree
  // on le dit le width to heigth ratio de notre canvas
  // ensuite on limite ce qui est visible: entre 0.1 et 100.0 units de distances
  mat4.perspective(45, gl.viewportWidth/ gl.viewportHeight, 0.1, 100.0, pMatrix);

  //The model-view matrix qui combine toute les tranformations ( pour les deplacement?)
  mat4.identity(mvMatrix);
  //Right, let’s move on to the code that draws the triangle on the left-hand side of our canvas.
  // -1.5 vers la gauche (negatix sur les X)
  // 7 units en profondeur ( loin de la camera ) sur les Z
  mat4.translate(mvMatrix,[ -1.5, 0.0, -7.0]);
  //blindBuffer sert a mettre notre buffer sur la carte graphique ( il devient le 'current buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  // on indique a WebGl d'utiliser les valeur qui sont dans triangleVertexPositionBuffer pour les position des vertex
  gl.vertexAttribPointer(shaderProgram.vertexPositionBuffer, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  // setMatrixUniforms, a function that’s defined further up in this file, moves it over to the graphics card.
  setMatrixUniforms();
  //“draw the array of vertices I gave you earlier as triangles, starting with item 0 in the array and going up to the numItemsth element”.
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  //Maintenant on va draw le carre
  // la mvMatrix est deja presentement a la position [ -1.5, 0.0, -7.0] donc elle sera [ 1.5, 0.0, -7.0] apres
  mat4.translate(mvMatrix,[3.0, 0.0, 0.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionBuffer, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0,0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0 , squareVertexPositionBuffer.numItems);
}
function webGLStart(){

  var canvas = document.getElementById("lesson01-canvas");
  initGL(canvas);
  initShaders();
  initBuffers();

  console.log("3");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  drawScene();
}
