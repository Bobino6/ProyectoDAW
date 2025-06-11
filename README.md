Instrucciones para el uso de la app



cuenta de correo para mongoDB: eduromerootero@gmail.com
contraseña correo: proyectoweb2025


---------------------------------

Para lanzar el backend (necesario tenerlo simpre ejecutado):
node server.js


Para lanzar el front:
Ejecutar el archivo index.html en explorador

Para lanzar el backend:
entrar en carpeta 'backend' y ejecutar 'npm run dev':
cd backend / npm run dev


datbase: invoices?retryWrites=true&w=majority 
url mongoDB: mongodb+srv://eduromerootero:noFEWmGe4YgAY9sa@cluster0.d9sx94x.mongodb.net/



 Implementación del Proyecto
Este proyecto consiste en una aplicación de gestión de pedidos de clientes y asignación de tareas a empleados, utilizando una arquitectura tipo REST API con Node.js, Express y MongoDB, y un cliente web construido en HTML/CSS/JavaScript vanilla.

 Tecnologías utilizadas
Backend: Node.js, Express, MongoDB, Mongoose

Frontend: HTML5, CSS3, JavaScript

Base de Datos: MongoDB Atlas (o local)

Herramientas adicionales: Nodemon (dev), CORS, dotenv

 Estructura del backend
bash
Copiar
Editar
/server
  /models
    client.js
    employee.js
  /routes
    clientRoutes.js
    employeeRoutes.js

 Instalación y configuración
Clona el repositorio:

git clone https://github.com/Bobino6/ProyectoDAW
cd tu-repositorio
Instala las dependencias del backend:


cd backend
npm install
Crea un archivo .env dentro de la carpeta backend con tus variables:

PORT=5000
MONGO_URI=mongodb+srv://eduromerootero:noFEWmGe4YgAY9sa@cluster0.d9sx94x.mongodb.net/invoices?retryWrites=true&w=majority


Inicia el servidor:
cd backend
npm run dev
Abre el archivo login.html (en la carpeta pages dentro de frontend) en tu navegador para comenzar a interactuar con la interfaz. (editado)
