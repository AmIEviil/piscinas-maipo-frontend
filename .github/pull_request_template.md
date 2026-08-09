## Qué cambia

<!-- Una o dos frases. Qué problema resuelve, no qué archivos toca. -->

## Protección de datos

Marcar lo que aplique. Si nada aplica, indicarlo explícitamente.

- [ ] **No toca datos personales** — el resto de esta sección no aplica
- [ ] No se añaden datos personales a `localStorage`, `sessionStorage` ni al
      `persist` de Zustand. Solo se conservan `id`, `user_name` y el rol
- [ ] Ningún `console.log` registra datos de clientes o trabajadores
- [ ] No se usa `dangerouslySetInnerHTML` con contenido que venga del servidor
      o del usuario
- [ ] Si se recoge un dato personal nuevo en un formulario, hay **aviso de
      tratamiento** visible (ver `docs/proteccion-datos/avisos-de-tratamiento.md`
      en el repositorio del backend)
- [ ] El gating por rol en el cliente **no es el único control**: el endpoint
      correspondiente del backend también lo restringe

> Ocultar un botón no protege un endpoint. El control de acceso vive en el
> backend; lo del cliente es presentación.

## Verificación

- [ ] `yarn build`
- [ ] `yarn lint`
- [ ] Probado en el navegador

## Notas para quien revise

<!-- Decisiones no obvias, alternativas descartadas, deuda que queda abierta. -->
