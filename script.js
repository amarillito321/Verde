// Datos reales recolectados
const datosReales = [
  { reg: 1, t: 3, s: 2, p: 4 },
  { reg: 2, t: 4, s: 4, p: 4 },
  { reg: 3, t: 3, s: 1, p: 2 },
  { reg: 4, t: 3, s: 2, p: 1 },
  { reg: 5, t: 4, s: 3, p: 2 },
  { reg: 6, t: 4, s: 5, p: 5 },
  { reg: 7, t: 3, s: 4, p: 3 },
  { reg: 8, t: 2, s: 3, p: 4 },
  { reg: 9, t: 3, s: 4, p: 3 },
  { reg: 10, t: 3, s: 3, p: 4 }
];

// Poblar tabla de registros
const tbody = document.getElementById('tabla-registros');
const scatterPoints = [];

datosReales.forEach(item => {
  const x = (item.t + item.s + item.p) / 3;
  const y_est = -15 * x + 75.8;
  scatterPoints.push({ x: Number(x.toFixed(2)), y: Number(y_est.toFixed(1)) });

  const row = `<tr>
    <td>${item.reg}</td>
    <td>${item.t}</td>
    <td>${item.s}</td>
    <td>${item.p}</td>
    <td><strong>${x.toFixed(2)}</strong></td>
  </tr>`;
  tbody.innerHTML += row;
});

// Gráfica de Dispersión
const ctxScatter = document.getElementById('scatterChart').getContext('2d');
const scatterChart = new Chart(ctxScatter, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Datos Reales (X, Y)',
        data: scatterPoints,
        backgroundColor: '#1b5e20'
      },
      {
        label: 'Escenario Seleccionado',
        data: [{ x: 3.17, y: 28.3 }],
        backgroundColor: '#c62828',
        pointRadius: 9
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { min: 1, max: 5, title: { display: true, text: 'Aceptación (X)' } },
      y: { min: 0, max: 80, title: { display: true, text: '% Desperdicio (Y)' } }
    }
  }
});

// Gráfica Doughnut por Alimento
const ctxPie = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(ctxPie, {
  type: 'doughnut',
  data: {
    labels: ['Arroz (30%)', 'Ensalada (30%)', 'Papa (20%)', 'Otros (20%)'],
    datasets: [{
      data: [14.8, 14.8, 9.9, 9.9],
      backgroundColor: ['#f39c12', '#27ae60', '#e67e22', '#bdc3c7']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  }
});

// Evento de Selección de Menú Predeterminado
document.getElementById('select-servicio').addEventListener('change', function(e) {
  const val = e.target.value;
  const sliderPrecio = document.getElementById('input-precio');
  if (val === 'desayuno') sliderPrecio.value = 4050;
  else if (val === 'almuerzo_comedor') sliderPrecio.value = 8500;
  else if (val === 'almuerzo_salon') sliderPrecio.value = 8900;
  actualizarSimulacion();
});

// Función Principal de Cálculo
function actualizarSimulacion() {
  const poblacion = parseInt(document.getElementById('input-poblacion').value);
  const precioRacion = parseFloat(document.getElementById('input-precio').value);
  const temp = parseFloat(document.getElementById('input-temp').value);
  const sabor = parseFloat(document.getElementById('input-sabor').value);
  const pres = parseFloat(document.getElementById('input-pres').value);

  // Actualizar labels
  document.getElementById('val-poblacion').innerText = poblacion + " estudiantes";
  document.getElementById('val-precio').innerText = "$ " + precioRacion.toLocaleString('es-CO');
  document.getElementById('val-temp').innerText = temp.toFixed(1);
  document.getElementById('val-sabor').innerText = sabor.toFixed(1);
  document.getElementById('val-pres').innerText = pres.toFixed(1);

  // Cálculo X y Y (%)
  const x = (temp + sabor + pres) / 3;
  const y_pct = Math.max(0, Math.min(100, -15 * x + 75.8));

  // Cálculos de Masa (0.35 kg por plato)
  const totalServidoKg = poblacion * 0.35;
  const desperdicioDiaKg = totalServidoKg * (y_pct / 100);
  const desperdicioSemanaKg = desperdicioDiaKg * 5;

  // Cálculos Financieros
  const presupuestoTotalDiario = poblacion * precioRacion;
  const perdidaDineroDia = presupuestoTotalDiario * (y_pct / 100);
  const perdidaDineroSemana = perdidaDineroDia * 5;

  // Mostrar métricas en interfaz
  document.getElementById('res-x').innerText = x.toFixed(2) + " / 5";
  document.getElementById('res-y').innerText = y_pct.toFixed(1) + "%";
  document.getElementById('res-kg-dia').innerText = desperdicioDiaKg.toFixed(1) + " kg";
  document.getElementById('res-kg-semana').innerText = Math.round(desperdicioSemanaKg) + " kg";
  
  document.getElementById('res-dinero-dia').innerText = "$ " + Math.round(perdidaDineroDia).toLocaleString('es-CO');
  document.getElementById('res-dinero-semana').innerText = "$ " + Math.round(perdidaDineroSemana).toLocaleString('es-CO');

  // Actualizar Scatter
  scatterChart.data.datasets[1].data = [{ x: Number(x.toFixed(2)), y: Number(y_pct.toFixed(1)) }];
  scatterChart.update();

  // Actualizar Doughnut
  const arrozKg = desperdicioDiaKg * 0.30;
  const ensaladaKg = desperdicioDiaKg * 0.30;
  const papaKg = desperdicioDiaKg * 0.20;
  const otrosKg = desperdicioDiaKg * 0.20;

  pieChart.data.datasets[0].data = [
    Number(arrozKg.toFixed(1)),
    Number(ensaladaKg.toFixed(1)),
    Number(papaKg.toFixed(1)),
    Number(otrosKg.toFixed(1))
  ];
  pieChart.data.labels = [
    `Arroz (${arrozKg.toFixed(1)} kg)`,
    `Ensalada (${ensaladaKg.toFixed(1)} kg)`,
    `Papa (${papaKg.toFixed(1)} kg)`,
    `Otros (${otrosKg.toFixed(1)} kg)`
  ];
  pieChart.update();
}

// Event Listeners
document.getElementById('input-poblacion').addEventListener('input', actualizarSimulacion);
document.getElementById('input-precio').addEventListener('input', actualizarSimulacion);
document.getElementById('input-temp').addEventListener('input', actualizarSimulacion);
document.getElementById('input-sabor').addEventListener('input', actualizarSimulacion);
document.getElementById('input-pres').addEventListener('input', actualizarSimulacion);

// Inicialización
actualizarSimulacion();