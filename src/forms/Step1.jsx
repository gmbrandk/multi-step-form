// Step1.jsx
export function Step1() {
  return (
    <>
      <label htmlFor="nombres" className="sr-only">
        Nombres
      </label>
      <input id="nombres" name="nombres" placeholder="Adriana Josefina" />

      <label htmlFor="apellidos" className="sr-only">
        Apellidos
      </label>
      <input id="apellidos" name="apellidos" placeholder="Tudela Gutiérrez" />

      <label htmlFor="dni" className="sr-only">
        DNI
      </label>
      <input id="dni" name="dni" placeholder="45591954" />

      <label htmlFor="telefono" className="sr-only">
        Teléfono
      </label>
      <input id="telefono" name="telefono" placeholder="913458768" />

      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input id="email" name="email" placeholder="ejemplo@correo.com" />

      <label htmlFor="direccion" className="sr-only">
        Dirección
      </label>
      <input
        id="direccion"
        name="direccion"
        placeholder="Av. Siempre Viva 742"
      />
    </>
  );
}
