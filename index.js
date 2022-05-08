require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const tokenValidation = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    });

}

//mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wls22.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
(async () => {
    try {
        await client.connect()
        console.log("DB Connected")
        const collectionProduct = client.db('store_house').collection('product')


        //login with jwt
        app.post('/login', async (req, res) => {
            const email = req.body.email
            token = jwt.sign({
                email
            }, process.env.ACCESS_TOKEN, { expiresIn: "1d" });
            res.send({ success: true, token })
        })

        //get product data from db
        app.get('/products', async (req, res) => {
            const limit = +req?.query?.limit || 0
            const query = {}
            //get product from db
            const result = await collectionProduct.find(query).sort({ sold: -1 }).limit(limit).toArray();
            res.send(result)

        })

        app.get('/allproducts', async (req, res) => {
            const page = +req?.query?.page
            const size = +req?.query?.size
            console.log(page, size)
            const query = {}
            //get product from db
            const cursor = collectionProduct.find(query);
            const count = await collectionProduct.countDocuments()
            const result = await cursor.skip(page * size).limit(size).toArray();
            res.send({ success: true, result, count })

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
        app.get('/myproduct', tokenValidation, async (req, res) => {
            const emailQuery = req.query.email
            const decodedEmail = req.decoded.email;
            console.log(decodedEmail, emailQuery)
            if (emailQuery !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = {
                email: emailQuery
            }
            //get product from db
            const result = await collectionProduct.find(query).toArray();
            res.send({
                success: true, result
            })


        })

        //post product data inserted to db
        app.post('/product', async (req, res) => {
            const product = req.body;
            //information check
            if (!product.name || !product.image || !product.description || !product.price || !product.quantity || !product.supplier || !product.email) {
                return res.send({ success: false, message: "Please provaide all informations" })
            }


            //inserted to db
            const result = await collectionProduct.insertOne(product);
            res.send({ success: true, message: `${product.name} inserted successfully!` })


        })

        //update product 
        app.put('/product/:productId', async (req, res) => {

            const id = req?.params?.productId
            const { quantity, sold } = req?.body
            const filter = {
                _id: ObjectId(id)
            }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity, sold
                },
            };
            const result = await collectionProduct.updateOne(filter, updateDoc, options);
            if (result.acknowledged) {
                res.send({ success: true, result })
            } else {
                res.send({ success: false, error: "Something is wrong" })
            }
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
