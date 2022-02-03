const { request, response } = require('express')
const express = require('express')
const req = require('express/lib/request')
const { writeFile } = require('fs')
// const fs = require('fs')
const fsPromise = require('fs/promises')
const { findSourceMap } = require('module')

const app = express()

// ** HACER PARSE DE TODAS LAS PETICIONES QUE LLEGUEN SUPER IMPORTANTE ** 
// Sin esta linea no podemos leer el body haceindo un app.post
app.use(express.json())

app.get('/', (request, response) => {
  response.send('Hola desde mi primer API')
})


// con callbacks
app.get('/file', (request, response) => {
  fs.readFile('text.txt', (error, data) => {
    if (error) {
      response.send('NO SE PUDO LEER :c')
      return
    }

    response.send(data)
  })
})

// con promesas (then/catch)
app.get('/file-promise', (request, response) => {
  fsPromise.readFile('text.txt', 'utf8')
    .then((data) => {
      response.send(data)
    })
    .catch((error) => {
      response.send('NO SE PUDO LEER :c')
    })
})

// con promesas (async/await)
app.get('/file-async', async (request, response) => {
  const data = await fsPromise.readFile('text.txt', 'utf8')
  response.send(data)
})

// Base de datos KODERS.JSON
app.get('/koders', async(request, response) => {
  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)
  let kodersFound = db.koders

  // queryParams :D
  if (request.query.max_age) {
    kodersFound = kodersFound.filter( ( koder ) => {
      return koder.age <= parseInt(request.query.max_age)
    })
  }

  console.log('query params:', request.query)
  response.json(kodersFound)
})

// GET / Koders/Emilio Info de emilio 
// GET / KODERS / SAra Info de Sara

// Request por Nombre
app.get('/koders/:name', async (request, response) => {
  const name = request.params.name
  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)

  const koderFound = db.koders.find( (koder) => {
    return koder.name.toLowerCase() === name.toLowerCase()
  })
  response.json(koderFound)
})

// Request por Genero
// app.get('/koders/sex/:sex', async (request, response) => {
//   const sex = request.params.sex
//   const data = await fsPromise.readFile('kodemia.json', 'utf8')
//   const db = JSON.parse(data)
  
//   const genderFound = db.koders.filter( (koder) => {
//     return koder.sex.toLowerCase() === sex.toLocaleLowerCase()
//   })
//   response.json(genderFound)
// })

// Request por ID
app.get('/koders/idNumber/:idNumber', async (request, response) => {
  const idNumber = parseInt(request.params.idNumber)
  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)

  const idFound = db.koders.find( (koder) => {
    return koder.idNumber === idNumber
  })
  response.json(idFound)
})



// Query Params 
// GET: http://localhost:8080/koders?hobbies=caminar

// Hacer un endpoint que al llamarlo nos regrese el contenido de un archivo text.txt
// GET /file


//POST CREAR KODER Y AGREGARLO AL ARREGLO DE OBJETOS

app.post('/koders', async ( request, response ) => {

  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)

  const newKoderId = db.koders.length +1
  const newKoderData = {
    id : newKoderId,
    ...request.body
  }

  db.koders.push(newKoderData)

  const dbAsString = JSON.stringify(db, '\n', 2) // Hace un String con formato parecido a JSON

  await fsPromise.writeFile('kodemia.json', dbAsString, 'utf8')

  response.json(db.body)
})


// DELETE, BORRAR KODER
// Koders / 1, 2, 4, etc...
app.delete('/koders/:id' , async(request, response) => {
  // Leemos info
  const id = parseInt(request.params.id)
  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)

  // Aplicamos cambios
  const newKodersArray = db.koders.filter(( koder ) => id != koder.id)
  db.koders = newKodersArray
  //Reescribimos 
  const dbAdString = JSON.stringify(db, '\n', 2)
  await fsPromise.writeFile('kodemia.json', dbAdString, 'utf8')

  response.json(db.koders)
  })

  // ACTUALIZAR 
  app.patch('/koders/:id', async (request, response) => {
  const id = parseInt(request.params.id)

  if (isNaN(id)) {
    console.log('hi')
    response.status(400)
    response.json( {
      message: 'Id must be a number'
    } )
    return
  }

  const data = await fsPromise.readFile('kodemia.json', 'utf8')
  const db = JSON.parse(data)

  const koderFoundIndex = db.koders.findIndex( (koder) => id === koder.id)

  if (koderFoundIndex < 0) {
    response.status(404)
    response.json( {
      message: 'koder not found'
    } )
    return
  }
  db.koders[koderFoundIndex] = {
    ...db.koders[koderFoundIndex],
    ...request.body, // Remplazamos el primer spread operator con los valores del segundo
    
  }

  const dbAsString = JSON.stringify(db, '\n', 2)
  await fsPromise.writeFile('kodemia.json', dbAsString, 'utf8')
  response.json(db.koders[koderFoundIndex])


  })

// ENciende el Servidor

app.listen(8080, () => {
  console.log('Server is listening')
})