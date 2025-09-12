// utils/mockOrdenServicio.js
const randomId = () => Math.random().toString(36).substring(2, 10);

const nombresMock = ['Juan', 'María', 'Pedro', 'Adriana', 'Lucía'];
const apellidosMock = ['Pérez', 'Gutiérrez', 'Rodríguez', 'Tudela', 'Quispe'];
const marcasMock = ['Dell', 'HP', 'Lenovo', 'Toshiba', 'Acer'];
const modelosMock = [
  'Inspiron 15',
  'Pavilion X360',
  'ThinkPad X1',
  'Satellite L45',
  'Aspire 5',
];

export function generarOrdenServicioMock() {
  const nombre = nombresMock[Math.floor(Math.random() * nombresMock.length)];
  const apellido =
    apellidosMock[Math.floor(Math.random() * apellidosMock.length)];
  const marca = marcasMock[Math.floor(Math.random() * marcasMock.length)];
  const modelo = modelosMock[Math.floor(Math.random() * modelosMock.length)];

  return {
    cliente: {
      nombres: nombre,
      apellidos: apellido,
      dni: String(Math.floor(Math.random() * 90000000) + 10000000), // 8 dígitos
      telefono: '9' + Math.floor(Math.random() * 100000000),
      email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@example.com`,
      direccion: `Av. Siempre Viva ${Math.floor(Math.random() * 1000)}`,
    },
    equipo: {
      tipo: 'Laptop',
      marca,
      modelo,
      sku: `${marca.toUpperCase()}-${randomId()}`,
      macAddress: Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      ).join(':'),
      nroSerie: `SN-${randomId().toUpperCase()}`,
    },
    'orden-servicio': {
      categoria: 'servicio',
      nombreTrabajo: 'Cambio de pantalla',
      diagnostico: 'Pantalla rota',
      observaciones: 'Cliente necesita reparación urgente',
      fechaIngreso: new Date().toISOString().slice(0, 16), // datetime-local
      cantidad: 1,
      precioUnitario: 250,
      subTotal: 250,
      lineas: [
        {
          categoria: 'servicio',
          nombreTrabajo: 'Cambio de pantalla',
          cantidad: 1,
          precioUnitario: 250,
          subTotal: 250,
        },
      ],
      total: 250,
    },
  };
}
