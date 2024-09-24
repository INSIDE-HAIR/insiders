# Documentación de Autenticación 

Este documento proporciona una descripción detallada de las estrategias de autenticación implementadas en nuestra aplicación, así como del manejo de sesiones y tokens JWT.

## Estrategias de Autenticación

Nuestra aplicación utiliza múltiples estrategias de autenticación para ofrecer flexibilidad y seguridad a los usuarios. A continuación se describen las estrategias implementadas:

### 1. Autenticación con Credenciales (Correo Electrónico y Contraseña)

- **Proveedor**: `CredentialsProvider`
- **Descripción**: Permite a los usuarios iniciar sesión utilizando su correo electrónico y contraseña.
- **Detalles de Implementación**:
  - Las credenciales ingresadas se validan contra la base de datos.
  - Las contraseñas se comparan de manera segura utilizando `bcrypt`.
  - Si la autenticación es exitosa, se actualiza el campo `lastLogin` del usuario en la base de datos.
  - Se utiliza el esquema de validación `CredentialSigninSchema` para asegurar la integridad de los datos ingresados.

### 2. Autenticación OAuth con Proveedores Externos

- **Proveedores**:
  - `GithubProvider`
  - `GoogleProvider`
- **Descripción**: Permite a los usuarios iniciar sesión utilizando sus cuentas de GitHub o Google.
- **Detalles de Implementación**:
  - Se utilizan las credenciales de cliente (`clientId` y `clientSecret`) proporcionadas por cada proveedor.
  - La aplicación obtiene información del usuario desde el proveedor OAuth para crear o vincular cuentas en nuestro sistema.
  - Si ya existe un usuario con el mismo correo electrónico, la cuenta OAuth se vincula a la cuenta existente en lugar de crear una nueva.

---

**Nota**: Actualmente, las funcionalidades de autenticación por enlace mágico (correo electrónico) y autenticación de dos factores (2FA) no están disponibles. Estamos trabajando para implementar estas características en futuras actualizaciones.

---

## Manejo de Sesiones y Tokens JWT

Nuestra aplicación utiliza tokens JWT (JSON Web Tokens) para manejar las sesiones de manera "stateless", es decir, sin almacenar información de sesión en el servidor.

### Estrategia de Sesión

- **Estrategia**: Sesiones basadas en JWT (`strategy: "jwt"`)
- **Descripción**: Las sesiones se manejan en el lado del cliente utilizando tokens JWT, eliminando la necesidad de almacenamiento de sesiones en el servidor.

### Uso de Tokens JWT

- **Generación del Token**: Al autenticarse exitosamente, se genera un token JWT que contiene información relevante del usuario.
- **Contenido del Token**:
  - ID del usuario, correo electrónico, nombre y rol.
  - Atributos adicionales como `isTwoFactorEnabled`, grupos, etiquetas y recursos de servicio.
- **Almacenamiento del Token**: El token JWT se almacena de manera segura en el cliente, típicamente en una cookie HTTP-only.
- **Verificación del Token**: En cada solicitud, el servidor verifica la validez y la firma del token JWT para autenticar al usuario.
- **Expiración del Token**: Los tokens tienen un tiempo de vida (`maxAge`) definido (en este caso, 24 horas), después del cual el usuario deberá autenticarse nuevamente.

### Beneficios de Utilizar JWT

- **Autenticación Stateless**: No se requiere mantener estado de sesión en el servidor, simplificando la arquitectura.
- **Escalabilidad**: Facilita la escalabilidad horizontal de la aplicación, ya que no depende de un almacenamiento de sesiones centralizado.
- **Rendimiento**: Reduce la carga en el servidor al evitar consultas frecuentes a la base de datos o a un almacenamiento de sesiones.

## Manejo de Cuentas y Flujo de Autenticación

- **Vinculación de Cuentas**: Si un usuario inicia sesión con un proveedor OAuth y ya existe una cuenta con el mismo correo electrónico, se vincula la cuenta OAuth al usuario existente.
- **Actualización de Metadatos del Usuario**: Se actualiza información como `lastLogin`, `emailVerified` e `image` del usuario al iniciar sesión.
- **Eventos y Callbacks Personalizados**: Se utilizan eventos y callbacks (por ejemplo, `signIn`, `jwt`, `session`) para manejar la lógica personalizada durante el proceso de autenticación.
- **Validación de Sesión**: Antes de establecer una sesión, la aplicación verifica si el usuario aún existe en la base de datos para prevenir accesos no autorizados.

## Consideraciones de Seguridad

- **Seguridad de Contraseñas**: Las contraseñas se almacenan de forma segura utilizando hash con `bcrypt`.
- **Seguridad de Tokens**: Los tokens JWT se firman y verifican para prevenir manipulaciones.
- **Datos Sensibles**: Solo se incluye información necesaria del usuario en el token JWT y en la sesión.
- **Uso de HTTPS**: Se recomienda servir la aplicación sobre HTTPS para proteger la transmisión de tokens.

---

**Nota sobre Envío de Correos Electrónicos**: Hemos reemplazado Nodemailer por Resend para el envío de correos electrónicos en nuestra aplicación. Sin embargo, actualmente no estamos utilizando el envío de correos electrónicos para autenticación, ya que las funcionalidades de enlace mágico y 2FA están temporalmente deshabilitadas.

---

Este documento proporciona una visión general de los mecanismos de autenticación y el manejo de sesiones en nuestra aplicación, enfatizando el uso de tokens JWT y las diversas estrategias implementadas para ofrecer una experiencia segura y flexible a los usuarios.
