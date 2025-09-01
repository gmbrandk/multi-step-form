// Step3.jsx
export function Step3() {
  return (
    <>
      <label htmlFor="tipo" className="sr-only">
        Tipo de orden
      </label>
      <input
        id="tipo"
        name="tipo"
        placeholder="mantenimiento"
        style={{ width: '100%' }}
      />

      <label htmlFor="fechaIngreso" className="sr-only">
        Fecha de ingreso
      </label>
      <input
        id="fechaIngreso"
        name="fechaIngreso"
        type="datetime-local"
        style={{ width: '100%' }}
      />

      <label htmlFor="diagnostico" className="sr-only">
        Diagnóstico
      </label>
      <textarea
        id="diagnostico"
        name="diagnostico"
        placeholder="Equipo enciende pero se apaga solo"
        style={{ width: '100%', minHeight: '80px' }}
      />

      <label htmlFor="observaciones" className="sr-only">
        Observaciones
      </label>
      <textarea
        id="observaciones"
        name="observaciones"
        placeholder="Cliente indicó que el problema empezó hace 2 días"
        style={{ width: '100%', minHeight: '80px' }}
      />

      {/* Grid para los 4 campos de trabajo */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr',
          gap: '0.5rem',
        }}
      >
        <div>
          <label htmlFor="nombreTrabajo" className="sr-only">
            Nombre del trabajo
          </label>
          <input
            id="nombreTrabajo"
            name="nombreTrabajo"
            placeholder="Mantenimiento general"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="cantidad" className="sr-only">
            Cantidad
          </label>
          <input
            id="cantidad"
            name="cantidad"
            type="number"
            min="1"
            placeholder="1"
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}
      >
        <div>
          <label htmlFor="precioUnitario" className="sr-only">
            Precio unitario
          </label>
          <input
            id="precioUnitario"
            name="precioUnitario"
            type="number"
            step="0.01"
            placeholder="150"
            style={{ width: '100%' }}
          />
        </div>

        <label htmlFor="total" className="sr-only">
          Total
        </label>
        <input
          id="total"
          name="total"
          type="number"
          step="0.01"
          placeholder="150"
          readOnly
          style={{
            width: '100%',
            fontWeight: 'bold',
            textAlign: 'right',
            background: '#f9f9f9',
          }}
        />
      </div>
    </>
  );
}
