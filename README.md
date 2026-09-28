# biblioteca-web

Vive en el repositorio **`biblioteca-web-l6`** de la organización. Este es el
frontend Angular de la biblioteca, congelado **al terminar L4**: es el punto
de partida de **L6**, para quien no alcanzó a terminar L3 y L4 a tiempo.

Trae resuelto todo lo de L3 (login real contra tu propio user pool de
Cognito) y de L4 (el panel de préstamos pedido al BFF en una sola llamada).
No trae nada de L6: ni `amqplib`, ni nada que hable de colas o eventos —eso
lo agregas tú en L6, contra el gateway y el BFF que también clonaste de
partida.

## Qué hay en cada archivo

| Archivo | Qué hace |
|---|---|
| `src/main.ts` | `Amplify.configure` contra tu user pool, y el listener que canjea el código de OAuth solo |
| `src/app/app.ts` | El cascarón: botón de login (`entrar()`), el rol `esBibliotecario` leído de `cognito:groups`, y `cargarPanel()` contra el BFF |
| `src/app/app.html` | La barra de navegación —Préstamos solo si eres bibliotecario— y el botón «Ver mis préstamos» |
| `src/app/app.routes.ts` | Las rutas, con `canActivate: [sesionGuard]` en `libros` y `prestamos` — **no** en `callback` |
| `src/app/app.config.ts` | `provideHttpClient(withInterceptors([tokenInterceptor]))` |
| `src/app/auth/sesion.guard.ts` | Si no hay sesión, manda al login. Si hay, deja pasar |
| `src/app/auth/token.interceptor.ts` | Adjunta `Authorization: Bearer <token>` solo a las peticiones a `http://localhost:8080` |
| `src/app/callback/callback.ts` | A dónde vuelve el navegador tras el login; navega a `/libros` cuando la sesión existe |
| `src/app/biblioteca.ts` | El catálogo y los préstamos, contra el gateway |
| `src/app/libros/`, `src/app/prestamos/` | Las dos pantallas del catálogo, sin cambios desde L1 |

## Cómo usarlo si no terminaste L3 y L4

Parado en `$HOME/DSY1107`:

1. Haz **Fork** de este repositorio en GitHub.
2. Si ya tienes una carpeta `biblioteca-web` de un intento anterior, renómbrala primero (por ejemplo `biblioteca-web-anterior`).
3. Clónalo con el nombre que espera el resto de la guía:

```bash
cd $HOME/DSY1107
git clone https://github.com/TU_USUARIO/biblioteca-web-l6.git biblioteca-web
cd biblioteca-web
npm install
```

4. Pega tus cuatro valores de Cognito en `src/main.ts`, líneas 16 a 21 (dentro
   del bloque `Amplify.configure`): `userPoolId`, `userPoolClientId`, `domain` —
   **sin** `https://`— y confirma que el `scope` trae el prefijo
   `biblioteca/libros.leer`. Los cuatro están en tu `ficha.txt` de L3.
5. Levántalo:

```bash
npm start
```

6. Revisa en la consola de Cognito que el **Allowed callback URL** de tu app
   client siga siendo `http://localhost:4200/callback`, exacto, sin barra
   final.

## Cómo se comprueba que quedó bien

Con el gateway (`8080`) corriendo, abre **http://localhost:4200**. Aprieta
**Entrar**: te lleva a la pantalla de login de tu propio dominio de Cognito.
Entra con `lector@biblioteca.test` y vuelves a `/libros` con el catálogo. Con
el BFF (`3000`) también corriendo, el botón **Ver mis préstamos** trae tu
panel en una sola llamada al `8080`. Esa comprobación es la fila 1 de
«Antes de empezar» de L6.

## Lo que no trae

Nada de L6: sin colas, sin `amqplib`, sin `biblioteca-eventos` ni
`biblioteca-admin`. Eso es del gateway y del BFF, no de este frontend.

## Sobre las versiones

`package.json` fija las dependencias **exactas**, sin `^`, y el
`package-lock.json` está versionado.

```bash
npm ci            # instala desde el lock, sin recalcular nada
npx ng build       # que compile de verdad, con las optimizaciones de produccion
```

## Si algo te falla

| Lo que ves | Qué pasó | Qué haces |
|---|---|---|
| `The Angular CLI requires a minimum Node.js version` | Tu Node es más viejo que lo que pide Angular 22 | Instala Node 24 |
| La página dice **401** | El interceptor no mandó el token, o no hay sesión | Revisa que hiciste login con `signInWithRedirect()` |
| La página dice **403** | El token es válido pero le falta el scope o el grupo | ¿Entraste con el usuario correcto? |
| **código 0** en el panel | No hubo respuesta | ¿Está el gateway en el `8080` y el BFF en el `3000`? |
| `redirect_mismatch` en Cognito | El callback no coincide **exacto** | `http://localhost:4200/callback`, sin barra final |
| `EADDRINUSE` en el `4200` | Quedó otra copia corriendo | `lsof -ti:4200 \| xargs kill -9` en macOS y Linux; `netstat -ano \| findstr :4200` y `taskkill /PID <n> /F` en Windows |

Y antes de irte de la sala, corta los procesos con `Ctrl+C` en cada terminal.
