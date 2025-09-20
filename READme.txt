=============================================================
README - Flujo de Clientes y Equipos (API + Frontend)
=============================================================

Este documento describe cómo funciona el flujo de búsqueda y manejo 
de **Clientes** y **Equipos** en la aplicación, incluyendo la 
diferencia entre los modos `autocomplete` y `lookup`, así como 
las reglas de enmascaramiento de datos sensibles.

-------------------------------------------------------------
1. FLUJO DE CLIENTES
-------------------------------------------------------------
- Endpoint: GET /api/clientes/search
- Parámetros aceptados:
  • dni
  • nombre
  • telefono
  • email
  • mode: "autocomplete" | "lookup"
  • limit (opcional, default = 10)

- Modo autocomplete:
  Devuelve lista de clientes enmascarados (dni, telefono, email).
  Ejemplo de resultado:
    {
      "_id": "68969fe10f461a3ec33ea7fd",
      "dni": "******29",
      "telefono": "*******6320",
      "email": "c*****m@gmail.com"
    }

- Modo lookup:
  Devuelve datos completos de un cliente, sin enmascarar, 
  pensado para cuando se selecciona un cliente concreto en el frontend.

-------------------------------------------------------------
2. FLUJO DE EQUIPOS
-------------------------------------------------------------
- Endpoint: GET /api/equipos/search
- Parámetros aceptados:
  • id
  • texto
  • marca
  • tipo
  • nroSerie
  • sku
  • imei
  • macAddress
  • mode: "autocomplete" | "lookup"
  • limit (opcional, default = 10)

- Modo autocomplete:
  Devuelve lista de equipos con información sensible enmascarada:
    • nroSerie → ********123
    • imei → ********7890
    • macAddress → ********AB12

  Campos públicos como `marca`, `modelo` y `tipo` NO se enmascaran.

- Modo lookup:
  Devuelve datos completos de un equipo específico (sin enmascarar),
  incluyendo nroSerie, imei y macAddress.

-------------------------------------------------------------
3. ENMASCARAMIENTO DE DATOS
-------------------------------------------------------------
- Clientes:
  • DNI → solo se muestran los 2 últimos dígitos.
  • Teléfono → solo se muestran los 4 últimos dígitos.
  • Email → muestra primera y última letra del usuario + dominio.

- Equipos:
  • nroSerie, imei y macAddress se enmascaran en modo autocomplete.
  • No se enmascaran en modo lookup.

-------------------------------------------------------------
4. RECOMENDACIONES DE USO EN FRONTEND
-------------------------------------------------------------
- Siempre usar `mode=autocomplete` para búsquedas rápidas y mostrar
  sugerencias en listas desplegables.
- Cuando el usuario selecciona un resultado, hacer una nueva llamada 
  con `mode=lookup` o con `id` para obtener la información completa.
- No mostrar información sensible en la lista de resultados parciales.
- Asegurarse de manejar correctamente los errores de validación:
  • SEARCH_NO_QUERY → No se envió ningún criterio.
  • SEARCH_MIN_CHARS → Se enviaron menos de 3 caracteres en autocomplete.
  • NOT_FOUND → No existe cliente/equipo con ese ID.

-------------------------------------------------------------
5. ARCHIVOS RELEVANTES
-------------------------------------------------------------
- controllers/clientes/buscarClientesController.js
- controllers/equipos/buscarEquiposController.js
- services/clientes/buscarClientesService.js
- services/equipos/buscarEquiposService.js
- utils/masking.js (incluye funciones de enmascaramiento)

-------------------------------------------------------------
6. RESUMEN
-------------------------------------------------------------
• `autocomplete` = búsqueda parcial + datos enmascarados.
• `lookup` = búsqueda exacta + datos completos.
• Información sensible (DNI, teléfono, email, nroSerie, imei, macAddress) 
  se protege en modo autocomplete.
• Frontend debe alternar entre ambos modos según la interacción del usuario.
