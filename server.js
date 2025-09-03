const express = require('express')
const cors = require("cors")
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const databasePath = path.join(__dirname, 'database.db')
const app = express()
const port = 3004;
app.use(express.json());
app.use(cors())


let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3004, () =>
      console.log('Server Running at http://localhost:3004/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()


app.post('/customers', async (request, response) => {
  const {name,email} = request.body
  const databaseUser = await db.get('SELECT * FROM customers WHERE email = ?',[email])
  console.log(databaseUser)
  if (databaseUser === undefined) {
      try {
        await db.run('INSERT INTO customers (name,email) VALUES (?,?)',[name,email]);
        
        response.json({ id: this.lastID, name, email })
      }catch (error) {
        console.log("Error creating user:",error)
        response.status(500).send('Internal Server Error')
      }
 
  } else {
    response.status(400)
    response.send('User already exists')
  }
 
})

app.get('/customers',async (req, res) => {
 const getUsersQuery = 'SELECT * FROM customers;'
   
  const usersArray = await db.all(getUsersQuery);
  res.send(usersArray)
});



app.post('/customers/:id/addresses',async (req, res) => {
  const { id } = req.params;
  const { street, city, state, zip } = req.body;

   const createUserQuery = `
     INSERT INTO addresses (customer_id, street, city, state, zip)
     VALUES ('${id}','${street}','${city}','${state}','${zip}');
      `;
    try {
        await db.run(createUserQuery);
        res.json({ id: this.lastID, customer_id: id, street, city, state, zip })
      }catch (error) {
        console.log("Error creating user:",error)
        res.status(500).send('Internal Server Error')
      }
 });


 app.get('/customers/:id/addresses',async (req, res) => {
  const { id } = req.params;
   const getUsersQuery = `
    SELECT * FROM addresses WHERE customer_id = ${id}
    ;`
    const usersArray = await db.all(getUsersQuery);
  res.send(usersArray)

});


