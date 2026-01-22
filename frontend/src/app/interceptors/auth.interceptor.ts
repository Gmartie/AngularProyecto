/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ARCHIVO: auth.interceptor.ts
 * TIPO: HttpInterceptorFn (Función interceptora funcional - Angular 15+)
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPCIÓN GENERAL:
 * ───────────────────
 * Este interceptor se ejecuta automáticamente en TODAS las peticiones HTTP
 * que realiza la aplicación. Su propósito es agregar el token JWT al encabezado
 * Authorization de cada petición, sin que necesitemos hacerlo manualmente en
 * cada servicio.
 *
 * ¿POR QUÉ LO NECESITAMOS?
 * ────────────────────────
 * El backend está protegido y requiere un token JWT válido para validar que
 * el usuario está autenticado. En lugar de escribir lo mismo en cada servicio:
 *
 *   this.http.get('/api/alumnos', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   })
 *
 * Este interceptor lo hace automáticamente en TODAS las peticiones.
 *
 * FLUJO DE FUNCIONAMIENTO:
 * ───────────────────────
 * 1. Usuario hace login → Se guarda token en localStorage
 * 2. Componente hace petición: this.http.get('/api/alumnos')
 * 3. ⚡ INTERCEPTOR se activa automáticamente
 * 4. Lee token del localStorage
 * 5. ¿Hay token? → Agrega encabezado Authorization
 * 6. Envía petición modificada al servidor
 * 7. Servidor valida token y responde
 * 8. Respuesta llega al componente
 *
 * EJEMPLO DE TRANSFORMACIÓN:
 * ──────────────────────────
 * PETICIÓN ORIGINAL (lo que hace el componente):
 *   GET /api/alumnos HTTP/1.1
 *   Host: localhost:3000
 *
 * PETICIÓN MODIFICADA (después del interceptor):
 *   GET /api/alumnos HTTP/1.1
 *   Host: localhost:3000
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * REGISTRO EN LA APLICACIÓN:
 * ──────────────────────────
 * En app.config.ts se registra así:
 *   provideHttpClient(withInterceptors([authInterceptor]))
 *
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * authInterceptor - Función interceptora de autenticación
 *
 * TIPO: HttpInterceptorFn
 * SINTAXIS: Funcional (Angular 15+), no basada en clases
 *
 * PARÁMETROS:
 * ───────────
 * @param req - La petición HTTP original que hizo el componente
 *              Puede ser GET, POST, PUT, DELETE, etc.
 *              Es de tipo HttpRequest<unknown>
 *
 * @param next - Función que continúa con la cadena de interceptores
 *               O pasa la petición al servidor si no hay más interceptores
 *               Es de tipo HttpHandlerFn
 *
 * RETORNA:
 * ────────
 * Observable<HttpEvent<unknown>> 
 *
 * Técnicamente, el interceptor EN SÍ no crea un Observable.
 * El Observable lo crea y devuelve next(req).
 * El interceptor simplemente "pasa" ese Observable al código que hace la petición.
 *
 * Ejemplo de tipo:
 *   HttpInterceptorFn = (req: HttpRequest, next: HttpHandlerFn) 
 *                       => Observable<HttpEvent>
 *
 * Donde:
 *   - next es de tipo: HttpHandlerFn = (req: HttpRequest) => Observable<HttpEvent>
 *   - El return es el resultado de: next(req)  // Observable<HttpEvent>
 *
 * NOTAS IMPORTANTES:
 * ──────────────────
 * - No implementa interfaz HttpInterceptor (sintaxis antigua)
 * - Usa inject() para inyectar servicios (más eficiente que constructores)
 * - Es una función pura que no modifica la petición original
 * - Es ligero y con mejor rendimiento que interceptores basados en clases
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // ════════════════════════════════════════════════════════════════════════════
  // PASO 1: Inyectar el servicio de autenticación
  // ════════════════════════════════════════════════════════════════════════════
  // 
  // inject() es el equivalente funcional de los constructores de clases
  // Permite obtener instancias de servicios inyectables de forma más eficiente
  // 
  // AuthService contiene métodos como:
  //   - obtenerToken(): obtiene el token del localStorage
  //   - tieneRol(rol): verifica si el usuario tiene un rol específico
  //   - estaAutenticado(): comprueba si hay sesión activa
  //
  const authService = inject(AuthService);

  // ════════════════════════════════════════════════════════════════════════════
  // PASO 2: Obtener el token JWT del localStorage
  // ════════════════════════════════════════════════════════════════════════════
  //
  // obtenerToken() busca en localStorage la clave 'usuario'
  // El token está guardado dentro del objeto usuario en la propiedad 'token'
  //
  // Estructura en localStorage:
  // {
  //   id: 1,
  //   usuario: "admin",
  //   email: "admin@example.com",
  //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  //   roles: [...]
  // }
  //
  // Si el usuario no ha hecho login o la sesión expiró, token = null
  //
  const token = authService.obtenerToken();

  // Log para depuración en consola del navegador
  // Muestra "Sí ✓" si hay token, "No ✗" si no hay
  console.log('🔑 AuthInterceptor - Token obtenido:', !!token ? 'Sí ✓' : 'No ✗');

  // ════════════════════════════════════════════════════════════════════════════
  // PASO 3: Validar si hay token y agregar encabezado Authorization
  // ════════════════════════════════════════════════════════════════════════════
  //
  // Si el token existe, lo agregamos a la petición
  // Si no existe, enviamos la petición sin modificar (para public endpoints)
  //
  if (token) {
    
    // req.clone() crea una COPIA de la petición original
    // No modificamos la original, creamos una nueva
    //
    // setHeaders() agrega o sobrescribe encabezados HTTP
    //
    // Formato JWT estándar:
    // Authorization: Bearer <token>
    //
    // Ejemplo real:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.signature
    //
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // Formato estándar JWT
      }
    });
    
    // Log confirmando que se agregó el token
    console.log('🔑 AuthInterceptor - Token agregado al encabezado Authorization');

  } else {
    // Si no hay token, enviamos la petición sin modificar
    // Esto permite acceder a endpoints públicos (como login/register)
    // que no requieren autenticación
    console.log('🔑 AuthInterceptor - Sin token, petición sin autenticación');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PASO 4: Pasar la petición (modificada o no) al siguiente paso
  // ════════════════════════════════════════════════════════════════════════════
  //
  // next(req) devuelve un Observable<HttpEvent<unknown>>
  //
  // ¿Qué es next?
  //   - Parámetro de tipo HttpHandlerFn
  //   - Es una función que recibe una petición HTTP
  //   - Retorna un Observable con los eventos HTTP
  //   - Es parte de la cadena de interceptores
  //
  // Flujo de ejecución:
  //   1. next(req) se ejecuta
  //   2. Si hay más interceptores → pasa a ellos
  //   3. Si no hay más → envía la petición al servidor
  //   4. El servidor procesa y responde
  //   5. La respuesta vuelve como Observable<HttpEvent>
  //   6. El componente se subscribe y recibe la respuesta
  //
  // El interceptor RETORNA ese Observable directamente
  // Sin modificarlo, solo lo "pasa" con la petición alterada
  //
  // Diagrama:
  //
  //   Componente                Interceptor              Servidor
  //   ──────────                ───────────              ────────
  //        │
  //        │ this.http.get()    
  //        │──────────────→ authInterceptor()
  //        │                    │
  //        │                    ├─ inyecta AuthService
  //        │                    ├─ obtiene token
  //        │                    ├─ clona petición + header Authorization
  //        │                    │
  //        │                    ├─ next(req) ──────────→ Servidor
  //        │                    │              ←──────── Respuesta
  //        │                    │
  //        │                    └─ return Observable
  //        │←─────── Observable<HttpEvent> ─────
  //        │
  //    subscribe() recibe respuesta
  //
  return next(req);
};
