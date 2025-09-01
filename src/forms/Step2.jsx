// Step2.jsx
export function Step2() {
  return (
    <>
      <label htmlFor="tipo" className="sr-only">
        Tipo de equipo
      </label>
      <input id="tipo" name="tipo" placeholder="laptop" />

      <label htmlFor="marca" className="sr-only">
        Marca
      </label>
      <input id="marca" name="marca" placeholder="Toshiba" />

      <label htmlFor="modelo" className="sr-only">
        Modelo
      </label>
      <input id="modelo" name="modelo" placeholder="Satellite L45" />

      <label htmlFor="sku" className="sr-only">
        SKU
      </label>
      <input id="sku" name="sku" placeholder="L45B4205FL" />

      <label htmlFor="macAddress" className="sr-only">
        Dirección MAC
      </label>
      <input
        id="macAddress"
        name="macAddress"
        placeholder="FA:KE:28:08:25:03"
      />

      <label htmlFor="nroSerie" className="sr-only">
        Número de serie
      </label>
      <input id="nroSerie" name="nroSerie" placeholder="3BO52134Q" />
    </>
  );
}
