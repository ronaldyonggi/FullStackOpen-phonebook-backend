const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const personName = process.argv[3]
const personNumber = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.roigez4.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

mongoose
    .connect(url)
    .then(() => {
        console.log('connected')

        if (personName && personName) {
            const person = new Person({
                name: personName, 
                number: personNumber
            })

            person.save()
            .then(() => {
                console.log('number saved!')
                mongoose.connection.close()
            })
        } else {
            Person.find({}).then (result => {
                console.log('phonebook:')
                result.forEach(person => {
                    console.log(`${person.name} ${person.number}`)
                })
                mongoose.connection.close()
            })
        }
    })
    .catch(err => console.log(err))