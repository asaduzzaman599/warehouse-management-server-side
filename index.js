require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

        //get product data from db
        app.get('/products', async (req, res) => {
            const limit = +req?.query?.limit || 0
            const query = {}
            //get product from db
            const result = await collectionProduct.find(query).limit(limit).toArray();
            res.send(result)

        })

        //get one product
        app.get('/product/:productId', async (req, res) => {
            const id = req?.params?.productId
            const query = {
                _id: ObjectId(id)
            }
            console.log(id)
            //get product from db
            const result = await collectionProduct.findOne(query);

            if (result?._id) {
                res.send({ success: true, data: result })
            } else {
                res.send({ success: false, error: "Something is Wrong" })
            }
        })

        //get product data depend on email  from db with jwt token verification
        app.get('/myproduct', async (req, res) => {
            const emailQuery = req.query.email
            const query = {
                email: emailQuery
            }
            //get product from db
            const result = await collectionProduct.find(query).toArray();
            res.send(result)


        })

        //post product data inserted to db
        app.post('/product', async (req, res) => {
            const product = req.body;
            //information check
            console.log(product)
            if (!product.name || !product.image || !product.description || !product.price || !product.quantity || !product.supplier || !product.email) {
                return res.send({ success: false, message: "Please provaide all informations" })
            }

            //inserted to db
            const result = await collectionProduct.insertOne(product);
            res.send({ success: true, message: `${product.name} inserted successfully!` })


        })

        //delete product
        app.delete('/product/:productId', async (req, res) => {
            const id = req.params.productId
            const query = {
                _id: ObjectId(id)
            }
            //get product from db
            const result = await collectionProduct.deleteOne(query);


            if (result?.acknowledged) {
                res.send({ success: true, result })
            } else {
                res.send({ success: true, error: "Something is wrong" })
            }

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
