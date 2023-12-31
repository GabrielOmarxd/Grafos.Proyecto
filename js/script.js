// Grafo vacio
var nodos = [], vinculos = [];

var source = [], target = [];
var ultimoNodo = nodos.length;
var auxMatrix = [], matricita = [], matrioska = [], mIndentidad = [], mAnterior = [];
var mcaminos = [], matrizRes = [], c = [];
var columm = null;
var colores =  [ "#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#db2d2d", "#382fa6", "#21abc1", "#602035" ];
const uuid = Math.floor(Math.random() * 1e9);
var mousedownNode = null;
var tool = null, seleccion = null;
var yoffset = 42;
var w = window.innerWidth, h = window.innerHeight - yoffset, radio = 14;
var conexion = 0, caminocta = 0, vSimples = 0, region = 0, vmgrafo = 0;

var svg = d3.select(".espacio")
svg.attr("width", w).attr("height", h);
svg.on("contextmenu", function() {
  d3.event.preventDefault();
});

var dragLine = svg
  .append("path")
  .attr("class", "dragLine hidden")
  .attr("d", "M0,0L0,0");
  
var flecha = svg
  .append('defs')
  .append('marker')
  .attr('id', `arrowhead-${uuid}`)
  .attr('viewBox', '-0 -5 10 10')
  .attr('refX', 18)
  .attr('refY', 0)
  .attr('orient', 'auto')
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('xoverflow', 'visible')
  .append('svg:path')
  .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
  .attr('fill', "#999")
  .attr('stroke', "#999");

var aristas = svg.append("g").selectAll(".arista");
var vertices = svg.append("g").selectAll(".vertice");

var force = d3
  .forceSimulation()
  .force(
    "charge",
    d3
      .forceManyBody()
      .strength(-300)
      .distanceMax(w / 2)
  )
  .force("link", d3.forceLink().distance(80))
  .force("x", d3.forceX(w / 2))
  .force("y", d3.forceY(h / 2))
  .on("tick", tick);

force.nodes(nodos);
force.force("link").links(vinculos);

var limpiarBtn = document.querySelector(".limpiar");
limpiarBtn.addEventListener("click", limpiarTodo);


var modal = document.querySelector(".modal");
var modalIng = document.querySelector(".modal-ingreso");
var tutoIng = document.querySelector(".modal-tutorial");

window.onclick = function(e) {
  if (e.target == modal || e.target == modalIng || e.target == tutoIng) {
    modal.style.display = "none";
    modalIng.style.display = "none";
    tutoIng.style.display = "none";
  }
}

var imagenes = ['./img/crearg.gif','./img/link.gif','./img/simple.gif','./img/borrar.gif','./img/opciones.gif','./img/propiedades.gif', './img/visual.gif'], cont = 0;

function imgTuto(aboutTitulo){
  aboutTitulo.addEventListener('click', e =>{
    let atras = aboutTitulo.querySelector('.atras'),
        adelante = aboutTitulo.querySelector('.adelante'),
        img = aboutTitulo.querySelector('img'),
        tgt = e.target;

      if (tgt == atras) {
        if(cont > 0){
          img.src = imagenes[cont - 1];
          cont--;
        } else {
            img.src = imagenes[imagenes.length - 1];
            cont = imagenes.length - 1;
          }
      } else if (tgt == adelante) {
        if (cont < imagenes.length - 1) {
          img.src = imagenes[cont + 1];
          cont++;
        } else{
            img.src = imagenes[0];
            cont = 0;
          }
      }
      if (cont == 6) {
        document.querySelector(".instrucciones").style.display = "none";
        document.querySelector(".instrucciones-2").style.display = "block";
      } else {
        document.querySelector(".instrucciones").style.display = "block";
        document.querySelector(".instrucciones-2").style.display = "none";
      }
  });
}

document.addEventListener("DOMContentLoaded", ()=> {
  let aboutTitulo=document.querySelector('.aboutTitulo');
   imgTuto(aboutTitulo);
});

//Boton tutorial
var tutorialBtn = document.querySelector(".tutorial");
tutorialBtn.addEventListener("click", e => {
  tutoIng.style.display = "block";
});

// Boton Grafo por texto
var visualizarBtn = document.querySelector(".visualizar");
visualizarBtn.addEventListener("click", e => {
  modalIng.style.display = "block";
  limpiarTodo();
});
// Input Visualizar
var inputGrafos = document.querySelector('input[name="ginput"]')
inputGrafos.addEventListener("onkeypress", e => {
  e.preventDefault();
  if (e.keyCode == 13) {ingresoDatos();}
});
var submit = document.querySelector('button[type="submit"]')
submit.addEventListener("click", e => {
  modalIng.style.display = "none";
  ingresoDatos();
})

// Ingreso de nodos por texto
function ingresoDatos() {
  var stringcito;
  stringcito = inputGrafos.value;

  regexRule = /([\d],[\d])+/g;
  var arrayNodos = [...stringcito.match(regexRule)]

  contador = 0;
  while (contador < arrayNodos.length + 1) {
    var newNode = {id: contador, grado: 0, color: contador%10};
    nodos.push(newNode);
    contador++;
  }
  for (let iindex = 0; iindex < arrayNodos.length; iindex++) {
    var newLink = { source: parseInt(arrayNodos[iindex][0], 10), target: parseInt(arrayNodos[iindex][2], 10)};
    vinculos.push(newLink);
  }
  vinculos.filter(function(d) {
    nodos[d.source].grado++;
  });

  restart();
}

// Checkbox Numeros
var numLabel = document.querySelector('input[name="numeros"]');
numLabel.addEventListener("click", mostrarNum);
function mostrarNum() {
  if (numLabel.checked == true) {
    d3.selectAll(".texto").style("display", "inline");
  } else {
    d3.selectAll(".texto").style("display", "none");
  }
}

// Checkbox Flechas
var flechaCheck = document.querySelector('input[name="flechas"]');
flechaCheck.addEventListener("click", mostrarFlechas);
function mostrarFlechas() {
  if (flechaCheck.checked == true) {
    document.querySelectorAll(".arista").forEach(function (d) {
      d.setAttribute("marker-end", "url(#arrowhead-" + uuid + ")");
    })
      
  } else {
    document.querySelectorAll(".arista").forEach(function (d) {
      d.setAttribute("marker-end", "");
    })
  }
}

svg
  .on("mousedown", añadirNodo)
  .on("mousemove", updateDragLine)
  .on("mouseup", hideDragLine)
  .on("mouseleave", hideDragLine);

// Actualiza la simulación
function tick() {
  aristas
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });

  vertices.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// Vacia el grafo
function limpiarTodo() {
  nodos.splice(0);
  vinculos.splice(0);
  ultimoNodo = 0;
  d3.selectAll("text").remove();
  matrioska = [];
  matricita = [];
  restart();
}

 document.querySelector(".matrizhide").addEventListener("click", e => {
  var tablamatriz = document.querySelector(".matriz-ady")
  var tablamatrizC = document.querySelector(".matriz-c")
  var labelAdy = document.querySelector(".label-ady")
  var labelC = document.querySelector(".label-c")
  if (tablamatriz.style.display == "block") {
    tablamatriz.style.display = "none";
    tablamatrizC.style.display = "none";
    labelAdy.style.display = "none";
    labelC.style.display = "none";
    document.querySelector('img[alt="menos"]').style.display = "none";
    document.querySelector('img[alt="mas"]').style.display = "block";
  } else {
    tablamatriz.style.display = "block";
    tablamatrizC.style.display = "block";
    labelAdy.style.display = "block";
    labelC.style.display = "block";
    document.querySelector('img[alt="menos"]').style.display = "block";
    document.querySelector('img[alt="mas"]').style.display = "none";
  }
});

// Boton Propiedades
document.querySelector(".propiedades").addEventListener("click", propiedades);
var labelre = document.querySelector(".region");
var barraderecha = document.querySelector(".derecha");
var nAristas = document.querySelector(".naristas");
var nVertices = document.querySelector(".nvertices");
var vinculosReales = new Array ( );
var vinculoIndex = [];

// Hover Vertices
nVertices.addEventListener("mouseenter", e => {
  document.querySelectorAll(".vertice").forEach(function(d){d.setAttribute("class", "vertice seleccionado");})
  setTimeout(function(){
    document.querySelectorAll(".vertice").forEach(function(d){d.setAttribute("class", "vertice");})
  }, 500)
})
// Hover Aristas
nAristas.addEventListener("mouseenter", e => {
  document.querySelectorAll(".arista").forEach(function(d){d.setAttribute("class", "arista arselect");})
  flecha.attr("stroke", "darkorange").attr("fill", "darkorange")
  setTimeout(function(){
    document.querySelectorAll(".arista").forEach(function(d){d.setAttribute("class", "arista");})
    flecha.attr("stroke", "#999").attr("fill", "#999")
  }, 500)
})

// Remueve enventos del mouse anteriores
function cambioTool(toolname) {
  var toolBtn1 = 'button[name="', toolBtn2= '"]';
  tool = toolBtn1 + toolname + toolBtn2;
  d3.selectAll(".tool").classed("activo", false);
  d3.select(tool).classed("activo", true);
  tool = toolname;
  
  svg
  .on("mousedown", null)
  .on("mousemove", null)
  .on("mouseup", null);
  
  vertices
    .on("mousedown", null)

  aristas
    .on("mousedown", null)
    .on("mouseup", null);

  restart();
}

function añadirNodo() {
  var e = d3.event;
  if (e.button == 0) {
    var coords = d3.mouse(e.currentTarget);
    var newNode = { x: coords[0], y: coords[1], id: ++ultimoNodo, grado: 0, color: ultimoNodo%10};
    nodos.push(newNode);
    restart();
  }
}

function borrarNodo(d, i) {  
  nodos.splice(nodos.indexOf(d), 1);
  var vinculosToRemove = vinculos.filter(function(l) {
    if ( typeof(d.source) !== "undefined") l.source.grado--;
    return l.source === d || l.target === d;
  });
  vinculosToRemove.map(function(l) {
    vinculos.splice(vinculos.indexOf(l), 1);
  });
  d3.event.preventDefault();
  restart();
}

function removeEdge(d, i) {
  d.source.grado--;
  vinculos.splice(vinculos.indexOf(d), 1);
  d3.event.preventDefault();
  restart();
}

function beginDragLine(d) {
  //to prevent call of añadirNodo through svg
  d3.event.stopPropagation();
  d3.event.preventDefault();
  mousedownNode = d;
  dragLine
    .classed("hidden", false)
    .attr(
      "d",
      "M" +
        mousedownNode.x +
        "," +
        mousedownNode.y +
        "L" +
        mousedownNode.x +
        "," +
        mousedownNode.y
    );
}

function updateDragLine() {
  var coords = d3.mouse(d3.event.currentTarget);
  if (!mousedownNode) return;
  dragLine.attr(
    "d",
    "M" +
      mousedownNode.x +
      "," +
      mousedownNode.y +
      "L" +
      coords[0] +
      "," +
      coords[1]
  );
}

function hideDragLine() {
  dragLine.classed("hidden", true);
  mousedownNode = null;
}

function endDragLine(d) {
  if (!mousedownNode || mousedownNode === d) return;   //Evita bug source.id = null y nodos vinculados así mismos  
  for (let index = 0; index < vinculos.length; index++) {   //Evita crear vinculos ya existentes
    var l = vinculos[index];
    if (l.source === mousedownNode && l.target === d) return;
  }
  mousedownNode.grado++;
  var newLink = { source: mousedownNode, target: d };
  vinculos.push(newLink);
  colorizacion(d);
  restart();
}

function nVinculos(nvinculos) {
  var cta = 0, zero = 0, uno = 1;
  for (let i = 0; i < nvinculos.length; i++) {
    for (let j = 0; j < nvinculos.length; j++) {
      if(nvinculos[i][zero] === nvinculos[j][uno] && nvinculos[i][uno] === nvinculos[j][zero]) {
        cta++;
      }
    }
  }
  vSimples = cta/2;
  cta = nvinculos.length - vSimples; 
  return(cta) 
}

function aristasVertices() {
  vinculosReales = [];
  for (let index = 0; index < vinculos.length; index++) {
    for (let jndex = 0; jndex < vinculos.length; jndex++) {
      if (index == jndex) {
        vinculosReales[index] = new Array (vinculos[index].source.id , vinculos[jndex].target.id);
      }
    }
  }
  
  for (let index = 0; index < vinculosReales.length; index++) {
    for (let jndex = 0; jndex < vinculosReales.length; jndex++) {
      if (jndex == 0) {
        vinculoIndex[index] = vinculosReales[index][jndex];
      }
    }
  }
  nAristas.innerHTML = nVinculos(vinculosReales);
  nVertices.innerHTML = nodos.length;
}

function tabla(matriz) {
  var tabla= "<table border=\"0\">";
     
  tabla += "<tr><td></td>";
  for(let jndex = 0; jndex<nodos.length; jndex++) { 
      tabla += "<td>" + (jndex + 1) + "</td>";
  }
  tabla+="</tr>";
  
  for(let index = 0; index < nodos.length; index++) {
      tabla += "<tr>";
      tabla += "<td>" + (index+1) + "</td>";
      for(let jndex = 0; jndex < nodos.length; jndex++) { 
          tabla += "<td>" + matriz[index][jndex] + "</td>";
      }
      tabla += "</tr>";
  }
  tabla += "</table>";

  return tabla;
}

// Muestra las propiedades del grafo
function propiedades() {
  
  barraderecha.style.height = "auto";
  
  for (let index = 0; index < vinculos.length; index++) {
    columm = vinculos[index];
    source.push(columm.source.index);
    target.push(columm.target.index);
    auxMatrix.push([index]);
  }
  matricita.push(source);
  matricita.push(target);

  for (let index = 0; index < nodos.length; index++) {
    auxMatrix[index] = source[index] + "," + target[index];
  }
  
  // Llena una matriz con 0's
  for (let index = 0; index < nodos.length; index++) {
    matrioska[index] = Array(nodos.length).fill(0);
    mIndentidad[index] = Array(nodos.length).fill(0);
    matrizRes[index] = Array(nodos.length).fill(0);
  }
  
  //Matriz Indentidad
  for (let index = 0; index < nodos.length; index++) {
    for (let jndex = 0; jndex < nodos.length; jndex++) {
      if (index == jndex) {
        mIndentidad[index][jndex] = 1;
      }
    }    
  }  
  
  //Matriz funcionando
  for (let jndex = 0; jndex <= nodos.length - 1; jndex++) {
    for (let kndex = 0; kndex <= source.length - 1; kndex++) {
      for (let lndex = 0; lndex <= matricita.length - 1; lndex++) {
        var m = matricita[lndex][kndex];
        if (lndex == 0) {
          mm = m;
        }
      }
      matrioska[mm][m] = 1;
    }
    break;
  }
  
  var matrizAdy = tabla(matrioska);
  document.querySelector(".matriz-ady").innerHTML = matrizAdy;
  mAnterior = matrioska;
  matrizCaminos(matrioska); 
  aristasVertices();
  regiones();
  if (vinculos.length == 0) {
    return
  }
  tipoGrafo();
  nCromatico();
  regular();
  euleriano();
  hamilton();
  conexo();
  grafoPlano();
  completo();
}

// Función para sumar Matrices
function sumMatrices (matriz1, matriz2) {
  var sum = 0;
  for (let index = 0; index < matriz1.length; index++) {
    for (let jndex = 0; jndex < matriz1.length; jndex++) {
      sum = matriz1[index][jndex] + matriz2[index][jndex];
      matrizRes[index][jndex] = sum;    
    }
  }
  return matrizRes;
}

//Matriz M2 M3 M4
function matrizCaminos(mcaminos) {
  var sum = 0;
  var matrixAux = [], mSum = [];
  var n = nodos.length - 1;

  for (let index = 0; index < mcaminos.length; index++) {
    matrixAux[index] = [];
    for (let jndex = 0; jndex < mcaminos[0].length; jndex++) {
      for (let kndex = 0; kndex < mcaminos[0].length; kndex++) {
        sum += mcaminos[index][kndex] * matrioska[kndex][jndex];
      }
      matrixAux[index][jndex] = sum;
      sum = 0;
    }
  }
  mcaminos = matrixAux;
  caminocta++;
  if (caminocta == n) {
    c = sumMatrices(mIndentidad, mAnterior)
    var matrizC = tabla(c);
    document.querySelector(".matriz-c").innerHTML= matrizC;
    mcaminos = [];
    return caminocta = 0;
  }
  else {
    mSum = sumMatrices(mcaminos, mAnterior)
    mAnterior = mSum;
    return matrizCaminos(mcaminos);
  }
}

function regiones() {
  region = 2 - nodos.length + nVinculos(vinculosReales);
  if (region < 1) region = 1;
  document.querySelector(".region").innerHTML = region;
}

var tipo = document.querySelector(".tipo");
var conx = document.querySelector(".conexo");

function tipoGrafo() {
  if (vinculos.length == nVinculos(vinculosReales)) {
    tipo.innerHTML = "Es dirigido"
  }
  if (vinculos.length / 2 == nVinculos(vinculosReales)) {
    tipo.innerHTML = "Es Simple";
  }
  if (vinculos.length != nVinculos(vinculosReales) && vinculos.length / 2 != nVinculos(vinculosReales)) {
    tipo.innerHTML = "Es multidigrafo";
  } 
}

function conexo() {
  var conexo = null;
  for (let index = 0; index < c.length; index++) {
    for (let jndex = 0; jndex < c.length; jndex++) {
      if (c[index][jndex] == 0) {
        conexo = false;
        conx.innerHTML = "Es diconexo";
        break;
      }
    }
  }
  if (conexo == null) {
    conexo = true;
    conx.innerHTML = "Es conexo";
  }
}

function grafoPlano() {
  var caras = region - 2;
  plano = caras - nodos.length + nVinculos(vinculosReales)
  if (plano ==  2) {
    document.querySelector(".plano").innerHTML = "Es plano";
    document.querySelector(".plan").style.display = "block";
  } 
}

function completo() {
  var n = nodos.length;
  if (((n * (n - 1)) / 2) == nVinculos(vinculosReales)) {
    document.querySelector(".completo").innerHTML = "Es completo";
    document.querySelector(".comp").style.display = "block";
  }
}

function nCromatico() {
  var mgrado = 0;
  for (let index = 0; index < nodos.length; index++) {
    if (nodos[index].grado > mgrado) {
      mgrado = nodos[index].grado
      vmgrafo = nodos[index].id
    }
  }
  document.querySelector(".ncroma").innerHTML = "Numero cromatico " + (mgrado + 1);
}

function regular() {
  var reg = true;
  for (let index = 0; index < nodos.length; index++) {
    if (nodos[index].grado != nodos[0].grado) {
      reg = false
      break;
    }
  }
  if (reg == true) document.querySelector(".regular").innerHTML = "Es regular";
  else document.querySelector(".regular").innerHTML = "No es regular";
}

function euleriano() {
  var parcta = 0, imparcta = 0;
  for (let index = 0; index < nodos.length; index++) {
    if (nodos[index].grado % 2 == 0) parcta++;
    else imparcta++;
  }
  if (parcta == nodos.length) {
    document.querySelector(".circuito-eu").innerHTML = "Circuito Euleriano";
    document.querySelector(".circuito-eu").style.display = "block !important";
    document.querySelector(".grafo-eu").innerHTML = "Grafo Euleriano";
    document.querySelector(".grafo-eu").style.display = "block !important";
  }
  if (imparcta == 2 && parcta == nodos.length - 2) {
    document.querySelector(".camino-eu").innerHTML = "Camino Euleriano";
    document.querySelector(".camino-eu").style.display = "block !important";
  }
}

function hamilton(){
  var grado1 = vmgrafo - 1;
  if (nodos[grado1].grado + nodos[2].grado >= nodos.length - 1) {
    document.querySelector(".hamilton").innerHTML = "Camino Hamiltoniano"
  }
}

// Casi funcionando :<
function colorizacion(d) {
  var n1 = 'circle[n="', n2= '"]', n = null;
  for (let index = 0; index < vinculos.length; index++) {
    if (d.color == vinculos[vinculos.length - 1].source.color) {
      d.color = vinculos.length;
      n = n1 + d.id + n2;
      d3.select(n).style("fill", function(l) {
      if (d.color == Math.floor(Math.random() * 10) + 1) return;        
        else return colores[Math.floor(Math.random() * 10) + 1]
      })
    }
  }
}

// Actualiza el grafo, vinculos y nodos
function restart() {
  aristas = aristas.data(vinculos, function(d) {
    return "v" + d.source.id + "-v" + d.target.id;
  });
  aristas.exit().remove();

  var ar = aristas
    .enter()
    .append("line")
    .attr("class", "arista")
    .attr('marker-end', `url(#arrowhead-${uuid})`)
    .on("mousedown", function() {
      d3.event.stopPropagation();
    })
    .on("contextmenu", removeEdge);

  ar.append("title").text(function(d) {
    return "v" + d.source.id + "-v" + d.target.id;
  });

  aristas = ar.merge(aristas);

  flecha.style("display", mostrarFlechas)

  vertices = vertices.data(nodos, function(d) {
    return d.id;
  });
  vertices.exit().remove();

  vertices.selectAll("text").text(function(d) {
    return d.id;
  });

  var ve = vertices
    .enter()
    .append("g")
    .attr("class", "vertice")
    .on("mousedown", beginDragLine)
    .on("mouseup", endDragLine)
    .on("contextmenu", borrarNodo);
    
  ve.append("circle")
    .attr("r", radio)
    .style("fill", function(d) {
      return colores[d.color]
    })
    .attr("n", function(d) {
      return d.id
    })
    .append("title").text(function(d) {
      return "v" + d.id;
    });
    
    ve.append("text")
    .attr("class", "texto")
    .attr("x", function(d) {
      if (d.id < 10) return - 4;
       else return - 8;
    })
    .attr("y", 5)
    .style("dislay", mostrarNum)
    .text(function(d) {
      return d.id;
    });

  vertices = ve.merge(vertices);

  force.nodes(nodos);
  force.force("link").links(vinculos);
  force.alpha(0.8).restart();
}

restart();