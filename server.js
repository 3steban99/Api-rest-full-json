// Cargar las variables de entorno del archivo .env
require("dotenv").config();

// Importar el módulo Express
const express = require("express");
const app = express();

// Importar las funciones del gestor de frutas
const { leerFrutas, guardarFrutas } = require("./src/frutasManager");
const { json } = require("body-parser");

// Configurar el número de puerto para el servidor
const PORT = process.env.PORT;

// Crear un arreglo vacío para almacenar los datos de las frutas
let BD = [];

// Configurar el middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para leer los datos de las frutas antes de cada solicitud
app.use((req, res, next) => {
  BD = leerFrutas(); // Leer los datos de las frutas desde el archivo
  next(); // Pasar al siguiente middleware o ruta
});

// Ruta principal que devuelve los datos de las frutas
app.get("/", (req, res) => {
  res.send(BD);
});

// Ruta principal que devuelve los datos mediante el parametro id

app.get("/id/:id", (req, res) =>{
  const id = parseInt(req.params.id); // Obtener el valor del parametro "id"

  const item = BD.find(fruta => fruta.id === id)

  if(!item){
    return res.status(404).json({error: "no se encontro el elemento con el ID proporcionado"})
  }

  res.json(item)
})

// Ruta principal que devuelve los datos mediante el nombre

app.get("/nombre/:nombre", (req, res) => {
  const nombre = req.params.nombre.toLowerCase();
  const result = BD.filter(nom => nom.nombre.toLowerCase().includes(nombre))

  result.length > 0 ? res.json(result) : res.status(404).json({error:"no se encontro el elemento con ese nombre"})
})



// Ruta para borrar una fruta mediante su id

app.delete("/id/:id", (req, res) => {
  const id = parseInt(req.params.id); // Obtener el valor del parametro "id"

  const result = BD.filter((fruta, index) =>{
    if(fruta.id === id){
      BD.splice(index, 1);
      guardarFrutas(BD)
    }
  })
result? res.status(201).send("BORRADO EXITOSO") : res.status(404).json({error: " no se realizo el borrado"})

})


// Ruta para modificar una fruta

app.put('/:id', (req, res) => {
  const id = parseInt(req.params.id); // Obtener el valor del parámetro "id" y convertirlo a un número entero
  const updatedItem = req.body; // Obtener el objeto actualizado desde el cuerpo de la solicitud

  // Buscar el índice del elemento correspondiente al id en el array de frutas
  const index = BD.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'No se encontró el elemento con el ID proporcionado' });
  }

  // Actualizar el elemento en el array de frutas
  BD[index] = { ...BD[index], ...updatedItem };

  // Guardar las frutas actualizadas en el archivo de base de datos
  guardarFrutas(BD);

  res.json({ message: 'Elemento actualizado correctamente' });
});


// Ruta para agregar una nueva fruta al arreglo y guardar los cambios
app.post("/", (req, res) => {
  const nuevaFruta = req.body;
  BD.push(nuevaFruta); // Agregar la nueva fruta al arreglo
  guardarFrutas(BD); // Guardar los cambios en el archivo
  res.status(201).send("Fruta agregada!"); // Enviar una respuesta exitosa
});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
