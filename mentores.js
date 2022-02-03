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

//Print Mentor List
app.get('/mentores/', async(request, response) => {
    const data = await fsPromise.readFile('kodemia.json', 'utf8')
    const db = JSON.parse(data)

    response.json(db.mentores)
})

// Find Mentor By Name
app.get('/mentores/:name', async(request, response) => {
    const name = request.params.name
    const data = await fsPromise.readFile('kodemia.json', 'utf8')
    const db = JSON.parse(data)
    
    mentorFound = db.mentores.find( (mentor) => {
        return mentor.name.toLowerCase() === name.toLowerCase()
    })
    response.json(mentorFound)
})

// Add Mentor
app.post('/mentores/', async( request, response) => {
    const data = await fsPromise.readFile('kodemia.json', 'utf8')
    const db = JSON.parse(data)

    const newMentorId = db.mentores.length +1
    const newMentorData = {
        id : newMentorId,
        ...request.body
    }

    db.mentores.push(newMentorData)
    const dbAsString = JSON.stringify(db, '\n', 2)
    await fsPromise.writeFile('kodemia.json', dbAsString, 'utf8')

    response.json(db.body)
})

// Levantar Server
app.listen(8080, () => {
    console.log('Server is listening')
  })