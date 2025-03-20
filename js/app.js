// Selección de formularios y elementos del DOM
const formPresupuesto = document.getElementById('form-presupuesto');
const formGasto = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');

let presupuesto, ui;

// Clases
class Presupuesto {
  constructor(monto, fecha) {
    this.presupuesto = Number(monto);
    this.restante = Number(monto);
    this.fechaIngreso = fecha;
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter(gasto => gasto.id.toString() !== id);
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
    this.restante = this.presupuesto - gastado;
  }
}

class UI {
  insertarPresupuesto(presupuestoObj) {
    document.querySelector('#total').textContent = presupuestoObj.presupuesto;
    document.querySelector('#restante').textContent = presupuestoObj.restante;
    document.querySelector('#fecha-ingreso').textContent = presupuestoObj.fechaIngreso;
  }
  
  imprimirAlerta(mensaje, tipo, contenedor = document.querySelector('.card-body')) {
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert');
    divMensaje.classList.add(tipo === 'error' ? 'alert-danger' : 'alert-success');
    divMensaje.textContent = mensaje;
    contenedor.insertBefore(divMensaje, contenedor.firstChild);
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  agregarGastoListado(gastos) {
    this.limpiarHTML();
    gastos.forEach(gasto => {
      const { nombre, cantidad, fecha, id } = gasto;
      const nuevoGasto = document.createElement('li');
      nuevoGasto.className = 'list-group-item';
      nuevoGasto.dataset.id = id;
      nuevoGasto.innerHTML = `
        <div>
          <strong>${nombre}</strong> <br>
          <small>${fecha}</small>
        </div>
        <div>
          <span class="badge badge-primary badge-pill">$ ${cantidad}</span>
          <button class="btn btn-danger btn-sm ml-2 borrar-gasto">Borrar</button>
        </div>
      `;
      gastosListado.appendChild(nuevoGasto);
    });
  }

  actualizarRestante(restante) {
    document.querySelector('#restante').textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;
    const restanteDiv = document.querySelector('.restante');

    if ((presupuesto / 4) > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-danger');
    } else if ((presupuesto / 2) > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-danger');
      restanteDiv.classList.add('alert-warning');
    } else {
      restanteDiv.classList.remove('alert-danger', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    if (restante <= 0) {
      this.imprimirAlerta('El presupuesto se ha agotado', 'error', formGasto);
      formGasto.querySelector('button[type="submit"]').disabled = true;
    }
  }

  limpiarHTML() {
    while (gastosListado.firstChild) {
      gastosListado.removeChild(gastosListado.firstChild);
    }
  }
}

// Instanciar UI
ui = new UI();

// Eventos
eventListeners();
function eventListeners() {
  formPresupuesto.addEventListener('submit', guardarPresupuesto);
  formGasto.addEventListener('submit', agregarGasto);
  gastosListado.addEventListener('click', eliminarGasto);
}

// Funciones
function guardarPresupuesto(e) {
  e.preventDefault();
  const monto = document.getElementById('presupuesto').value;
  const fecha = document.getElementById('fecha-presupuesto').value;
  if(monto === '' || monto <= 0 || fecha === '') {
    ui.imprimirAlerta('Ambos campos son obligatorios y deben ser válidos', 'error', formPresupuesto);
    return;
  }
  presupuesto = new Presupuesto(monto, fecha);
  ui.insertarPresupuesto(presupuesto);
  formPresupuesto.reset();
  // Habilitar el form de gasto si estaba deshabilitado
  formGasto.querySelector('button[type="submit"]').disabled = false;
}

function agregarGasto(e) {
  e.preventDefault();
  const nombre = document.getElementById('gasto').value;
  const cantidad = Number(document.getElementById('cantidad').value);
  const fechaGasto = document.getElementById('fecha-gasto').value;

  if (nombre === '' || cantidad === '' || fechaGasto === '') {
    ui.imprimirAlerta('Todos los campos son obligatorios', 'error', formGasto);
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta('Cantidad no válida', 'error', formGasto);
    return;
  }

  const gasto = { nombre, cantidad, fecha: fechaGasto, id: Date.now() };
  presupuesto.nuevoGasto(gasto);
  ui.imprimirAlerta('Gasto agregado correctamente', 'success', formGasto);
  ui.agregarGastoListado(presupuesto.gastos);
  ui.comprobarPresupuesto(presupuesto);
  ui.actualizarRestante(presupuesto.restante);
  formGasto.reset();
}

function eliminarGasto(e) {
  if (e.target.classList.contains('borrar-gasto')) {
    const { id } = e.target.parentElement.parentElement.dataset;
    presupuesto.eliminarGasto(id);
    ui.agregarGastoListado(presupuesto.gastos);
    ui.comprobarPresupuesto(presupuesto);
    ui.actualizarRestante(presupuesto.restante);
  }
}
