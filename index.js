require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wls22.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
(async () => {
    try {
        await client.connect()
        console.log("DB Connected")
        const collectionProduct = client.db('store_house').collection('product')
        app.post('/product', async (req, res) => {
            const product = req.body;
            //information check
            console.log(product)
            if (!product.name || !product.image || !product.description || !product.price || !product.quantity || !product.supplier || !product.email) {
                return res.send({ success: false, message: "Please provaide all informations" })
            }


            const result = await collectionProduct.insertOne(product);
            res.send({ success: true, message: `${product.name} inserted successfully!` })


        })
    } catch (err) {
        console.log(err)
    }
})().catch(console.dir)


/* 
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */


app.get('/', (req, res) => {
    res.send(`Server running port : ${port}`)
})


app.listen(port, () => {
    console.log(`Server running port : ${port}`)
})
