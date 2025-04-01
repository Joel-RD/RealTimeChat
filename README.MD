# RealTimeChat

![Descripción de la imagen](/file/logo.png)

RealTimeChat es una aplicación de chat en tiempo real que permite a los usuarios enviar mensajes, compartir imágenes y realizar videollamadas utilizando tecnologías como **Socket.IO**, **WebRTC** y **PeerJS**.

## Características

- **Mensajería en tiempo real**: Los usuarios pueden enviar y recibir mensajes instantáneamente.
- **Compartir imágenes**: Los usuarios pueden compartir imágenes en el chat.
- **Videollamadas**: Soporte para videollamadas entre usuarios utilizando WebRTC.
- **Salas de chat dinámicas**: Los usuarios se emparejan automáticamente en salas de chat privadas.
- **Interfaz moderna**: Diseño responsivo y accesible.

## Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para el servidor.
- **Express**: Framework para manejar rutas y middleware.
- **Socket.IO**: Comunicación en tiempo real entre cliente y servidor.
- **WebRTC**: Para videollamadas en tiempo real.
- **PeerJS**: Simplificación de la conexión WebRTC.
- **PostgreSQL**: Base de datos para almacenar información de usuarios (configurable).
- **HTML, CSS y JavaScript**: Para la interfaz de usuario.

## Requisitos previos

- **Node.js** (v14 o superior)
- **npm** (v6 o superior)
- **PostgreSQL** (opcional, si se utiliza una base de datos local)

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/Joel-RD/RealTimeChat.git
   cd realtimechat
   ```

2. Instala las dependencias

   ```bash
   npm install
   ```

3. Configurar las variables de entorno en el archivo .env en la raiz del projecto.

   ```bash
   PORT_SERVER=8120
   URL_LOCAL_HOST="http://localhost:"
   DB_URL_LOCAL=postgresql://postgres:tu_contraseña@localhost:5432/registeruser
   DB_URL_CLOUD=
   NODE_ENV=development
   ```

4. Iniciar el servidor en modo desarrollador.

```bash
npm start
```

5. Abre tu navegador en:
```bash
 http://localhost:8120
```

6. Scripts disponibles.
```bash
npm start
npm run build
```
