const form = document.getElementById('equilibrioForm');
const resultadoDiv = document.getElementById('resultado');
const explicacionDiv = document.getElementById('explicacion');
const historialDiv = document.getElementById('listaHistorial');

let historial = [];

// Función para guardar historial en localStorage
function guardarHistorial() {
  localStorage.setItem('historialEjercicios', JSON.stringify(historial));
}

// Función para cargar historial desde localStorage
function cargarHistorial() {
  const datos = localStorage.getItem('historialEjercicios');
  if (datos) {
    historial = JSON.parse(datos);
    mostrarHistorial();
  }
}

// Mostrar historial en pantalla
function mostrarHistorial() {
  historialDiv.innerHTML = '';
  historial.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'historial-item';
    div.innerHTML = `
      <strong>Ejercicio ${index + 1}:</strong><br>
      Coeficientes: A=${item.coefA}, B=${item.coefB}, C=${item.coefC}, D=${item.coefD}<br>
      Concentraciones iniciales: A=${item.concA}, B=${item.concB}, C=${item.concC}, D=${item.concD}<br>
      Kc = ${item.kc}<br>
      <em>Resultado: A=${item.resA.toFixed(3)}, B=${item.resB.toFixed(3)}, C=${item.resC.toFixed(3)}, D=${item.resD.toFixed(3)}</em>
    `;
    historialDiv.appendChild(div);
  });
}

// Cálculo del equilibrio químico
function calcularEquilibrio(coefA, coefB, coefC, coefD, concA, concB, concC, concD, kc) {
  let x = 0;
  let paso = 0.0001;
  let maxIter = 100000;

  for (let i = 0; i < maxIter; i++) {
    x += paso;

    const A = concA - coefA * x;
    const B = concB - coefB * x;
    const C = concC + coefC * x;
    const D = concD + coefD * x;

    if (A < 0 || B < 0 || C < 0 || D < 0) break;

    const Q = (Math.pow(C, coefC) * Math.pow(D, coefD)) / (Math.pow(A, coefA) * Math.pow(B, coefB));

    if (Math.abs(Q - kc) < 0.0005) {
      return { A, B, C, D };
    }
  }
  return null;
}

// Función para interpretar los resultados y dar un análisis sencillo
function interpretarResultado(coefA, coefB, coefC, coefD, concA, concB, concC, concD, kc, resA, resB, resC, resD) {
  let interpretacion = "";

  // Cambios en concentraciones
  const deltaA = concA - resA;
  const deltaB = concB - resB;
  const deltaC = resC - concC;
  const deltaD = resD - concD;

  // Suma cambios reactivos y productos
  const cambioReactivos = deltaA + deltaB;
  const cambioProductos = deltaC + deltaD;

  // Qué se favorece
  if (cambioProductos > cambioReactivos) {
    interpretacion += "<p>La reacción favorece la formación de <strong>productos</strong>.</p>";
  } else if (cambioReactivos > cambioProductos) {
    interpretacion += "<p>La reacción favorece a los <strong>reactivos</strong>.</p>";
  } else {
    interpretacion += "<p>Los cambios en reactivos y productos son similares, equilibrio balanceado.</p>";
  }

  // Comentario sobre Kc
  if (kc > 10) {
    interpretacion += `<p>La constante de equilibrio (Kc = ${kc}) es alta, lo que indica que en equilibrio predominan los productos.</p>`;
  } else if (kc < 0.1) {
    interpretacion += `<p>La constante de equilibrio (Kc = ${kc}) es baja, lo que indica que en equilibrio predominan los reactivos.</p>`;
  } else {
    interpretacion += `<p>La constante de equilibrio (Kc = ${kc}) es moderada, por lo que en equilibrio hay cantidades significativas de reactivos y productos.</p>`;
  }

  // Cambios significativos
  if (Math.abs(cambioReactivos) < 0.01 && Math.abs(cambioProductos) < 0.01) {
    interpretacion += "<p>Los cambios en concentraciones son muy pequeños, por lo que la reacción está casi en equilibrio desde el inicio.</p>";
  } else {
    interpretacion += `<p>Los cambios en concentraciones muestran una reacción que se desplazó para alcanzar el equilibrio.</p>`;
  }

  return interpretacion;
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const coefA = parseFloat(form.coefA.value);
  const coefB = parseFloat(form.coefB.value);
  const coefC = parseFloat(form.coefC.value);
  const coefD = parseFloat(form.coefD.value);

  const concA = parseFloat(form.concA.value);
  const concB = parseFloat(form.concB.value);
  const concC = parseFloat(form.concC.value);
  const concD = parseFloat(form.concD.value);

  const kc = parseFloat(form.kc.value);

  const resultado = calcularEquilibrio(coefA, coefB, coefC, coefD, concA, concB, concC, concD, kc);

  if (!resultado) {
    resultadoDiv.innerHTML = '<strong>No se pudo calcular el equilibrio con los datos ingresados.</strong>';
    explicacionDiv.innerHTML = '';
    return;
  }

  resultadoDiv.innerHTML = `
    <strong>Concentraciones en equilibrio:</strong><br>
    A: ${resultado.A.toFixed(3)} mol/L<br>
    B: ${resultado.B.toFixed(3)} mol/L<br>
    C: ${resultado.C.toFixed(3)} mol/L<br>
    D: ${resultado.D.toFixed(3)} mol/L
  `;

  explicacionDiv.innerHTML = `
    Se calculó el equilibrio ajustando la concentración según los coeficientes estequiométricos.<br>
    Se encontró el valor de x para que el cociente de reacción Q se aproxime a Kc.<br>
    Se verificó que las concentraciones no sean negativas.<br>
    ${interpretarResultado(coefA, coefB, coefC, coefD, concA, concB, concC, concD, kc, resultado.A, resultado.B, resultado.C, resultado.D)}
  `;

  // Guardar en historial
  historial.push({
    coefA, coefB, coefC, coefD,
    concA, concB, concC, concD,
    kc,
    resA: resultado.A,
    resB: resultado.B,
    resC: resultado.C,
    resD: resultado.D
  });
  guardarHistorial();
  mostrarHistorial();
});

// Cargar historial al iniciar
cargarHistorial();
