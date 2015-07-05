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

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix(){
  var copy = mat4.create();
  mat4.set(mvMatrix,copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix(){
  if(mvMatrixStack.length === 0){
    throw "invalid popMatrix";
  }
  mvMatrix = mvMatrixStack.pop();
}
function degToRad(degrees){
  return degrees * Math.PI / 180;
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}



var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
function initBuffers(){
  pyramidVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer); // toujour utiliser ce buffer
  console.log("4");
  var vertices = [
    // Front face
    0.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    // Right face
    0.0,  1.0,  0.0,
    1.0, -1.0,  1.0,
    1.0, -1.0, -1.0,
    // Back face
    0.0,  1.0,  0.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    // Left face
    0.0,  1.0,  0.0,
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0
  ];
  // Utiliser l'array vertices pour remplir le buffer ( qui est pyramidVertexPositionBuffer )
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // ajouter des proprieter a notre objet pyramidVertexPositionBuffer ( pas liÉ a webgl juste pour nous)
  // dans le array de 9 c'est 3 vertex qui sont representer
  pyramidVertexPositionBuffer.itemSize = 3; // nombre de chiffre representant un vertex
  pyramidVertexPositionBuffer.numItems = 12; // nombre de vertex

  pyramidVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
  // red green blue alpha
  var colors = [
    // Front face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    // Right face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    // Back face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    // Left face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors),gl.STATIC_DRAW);
  pyramidVertexColorBuffer.itemSize = 4;
  pyramidVertexColorBuffer.numItems = 12;

  //on cree maintenant le carre
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  vertices = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 12;


  cubeVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
  colors = [
    [1.0, 0.0, 0.0, 1.0],     // Front face
    [1.0, 1.0, 0.0, 1.0],     // Back face
    [0.0, 1.0, 0.0, 1.0],     // Top face
    [1.0, 0.5, 0.5, 1.0],     // Bottom face
    [1.0, 0.0, 1.0, 1.0],     // Right face
    [0.0, 0.0, 1.0, 1.0],     // Left face
  ];
  var unpackedColors = [];
  for (var i in colors) {
    var color = colors[i];
    for (var j=0; j < 4; j++) {
      unpackedColors = unpackedColors.concat(color);
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
  cubeVertexColorBuffer.itemSize = 4;
  cubeVertexColorBuffer.numItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = 36;

}
var rTri = 0;
var rCube = 0;
function drawScene() {
  //on met au courant webgl a propos du canvas avec viewport
  gl.viewport(0,0,gl.viewportWidth, gl.viewportHeight);
  //on netoye le canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //set up la perspective ( la camera )
  // 45 degree
  // on le dit le width to heigth ratio de notre canvas
  // ensuite on limite ce qui est visible: entre 0.1 et 100.0 units de distances
  mat4.perspective(50, gl.viewportWidth/ gl.viewportHeight, 0.1, 100.0, pMatrix);

  //The model-view matrix qui combine toute les tranformations ( pour les deplacement?)
  mat4.identity(mvMatrix);
  //Right, let’s move on to the code that draws the pyramid on the left-hand side of our canvas.
  // -1.5 vers la gauche (negatix sur les X)
  // 7 units en profondeur ( loin de la camera ) sur les Z
  mat4.translate(mvMatrix,[ -1.3, 0.0, -7.0]);

  //animate the pyramid
  mvPushMatrix();
  mat4.rotate(mvMatrix, degToRad(rTri), [0,1,0]);


  //blindBuffer sert a mettre notre buffer sur la carte graphique ( il devient le 'current buffer')
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
  // on indique a WebGl d'utiliser les valeur qui sont dans pyramidVertexPositionBuffer pour les position des vertex
  gl.vertexAttribPointer(shaderProgram.vertexPositionBuffer, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0,0);

  // setMatrixUniforms, a function that’s defined further up in this file, moves it over to the graphics card.
  setMatrixUniforms();
  //“draw the array of vertices I gave you earlier as pyramids, starting with item 0 in the array and going up to the numItemsth element”.
  gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);


  mvPopMatrix();
  //Maintenant on va draw le carre
  // la mvMatrix est deja presentement a la position [ -1.5, 0.0, -7.0] donc elle sera [ 1.5, 0.0, -7.0] apres
  mat4.translate(mvMatrix,[3.0, 0.0, 0.0]);

  mvPushMatrix();

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionBuffer, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0,0);

  mat4.rotate(mvMatrix, degToRad(rCube), [-1,5,-10]);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix();
}
var lastTime = 0;
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime !== 0) {
    var elapsed = timeNow - lastTime;

    rTri += (90 * elapsed) / 1000.0;
    rCube += (75 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}

function tick(){
  // browser independent
  requestAnimFrame(tick);
  drawScene();
  animate();
}

function webGLStart(){

  var canvas = document.getElementById("lesson01-canvas");
  initGL(canvas);
  initShaders();
  initBuffers();

  console.log("3");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  tick();
}
