# ensayadero musical (entrega SENA)

bueno profe este es mi proyecto del ensayadero para reservar turnos

tiene dos partes:
- `ensayadero-api/` = la api (el backend) con express, prisma y sqlite
- `ensayadero-web/` = lo que se ve en el navegador (react y vite)

## mis datos

- nombre: Samuel Hincapie Velez
- ficha: 3519093
- programa: Tecnica en programacion de software
- instructor: Jusef Hoyos
- centro: Centro del diseño y manofactura del cuero
- fecha: 20 de noviembre de 2026

## como prender la api

1. entrar a la carpeta: `cd ensayadero-api`
2. instalar cosas: `npm install`
3. crear la base: `npx prisma migrate dev`
4. meter los 3 instrumentos: `npm run seed`
5. prender el servidor: `npm run dev`

queda en http://localhost:3000

## como prender el frontend

en otra terminal:

1. `cd ensayadero-web`
2. `npm install`
3. `npm run dev`

queda en http://localhost:5173

## como evita que se crucen las reservas

basicamente mira si la hora nueva choca con una que ya existe del mismo instrumento (si el inicio nuevo es menor que el fin que ya hay y el fin nuevo es mayor que el inicio que ya hay). si choca manda error 409. si una termina a las 12:00 y otra empieza a las 12:00 si se puede porque no se cruzan. en el frontend tambien reviso eso pa mostrar el mensaje rojo.

## evidencias

en la carpeta `documentacion/` esta el `evidencia-final.pdf` y las capturas de lo que pidio
