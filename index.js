require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
const morgan = require('morgan')

// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), 
        '-',
        tokens['response-time'](req, res), 'ms',
        tokens.res(req, res, 'body')
    ].join(' ')
}))
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body'));

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    // response.json(persons)
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    let count = persons.length
    let currentDate = new Date()
    response.send(`
    <div>
    Phonebook has info for ${count} people <br> <br>
    </div> 
    <div>${currentDate}</div>`)
})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)

    // if (person)response.json(person)
    // else response.status(404).end()
    Person.findById(request.params.id).then(person => {
        if (person) response.json(person)
        else response.status(404).end() // if person is not found
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) return response.status(400).json({
        error: "Name is missing"
    })
    else if (!body.number) return response.status(400).json({
        error: "Number is missing"
    })
    // else if (Person.find(person => person.name === body.name)) return response.status(400).json({
    //     error: "Name already exist in the phonebook"
    // })

    // const person = {
    //     name: body.name,
    //     number: body.number,
    //     id: Math.floor(Math.random() * 1000)
    // }
    const person = new Person({
        name: body.name,
        number:body.number
    })

    // persons = persons.concat(person)
    // response.json(person)
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server is running on port ${PORT}`)