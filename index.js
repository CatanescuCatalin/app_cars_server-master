const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const bodyParser = require('body-parser');

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const Customer = require('./models/Customers');
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
    const { userName, password, email } = req.body;
    const user  = new User({
        userName,
        password,
        email
    });

    await user.save();
    res.sendStatus(201);
});
 
app.post('/api/login', async (req, res) => {
    const { userName, password } = req.body;
    console.log(req.body);
    
    const user = await User.find({userName, password})
    if(user.length === 0){
        res.status(404);
        res.json({msg: "not found user"})
    }else{
        res.json(user);
    }
   
});

app.post('/upload', upload.single('image'), (req, res) => {
    var img = new Image(req.file);
    console.log(img);
});

app.get('/customers', async (req, res) => {
    try{
        const customers = await Customer.find({});
        res.send(customers);
    }catch(err){
        console.log(err);
        res.send("Not Found");
    }
});

app.get('/customers/:id', async (req, res) => {
    try{
        const customer = await Customer.findById(req.params.id);
        res.send(customer);
    }catch(err){
        console.log(err);
    }
});

app.post('/customers', async (req, res) => {
    if(!req.is('application/json')){
        return console.error('Expects application/json');
    }

    const { name, email, balance } = req.body;

    const customer  = new Customer({
        name,
        email, 
        balance
    });

    try {
        const newCustomer = await customer.save();
        res.sendStatus(201);
    } catch (error) {
        console.error(error)
    }
});

app.put('/customers/:id', async (req, res) => {
    if(!req.is('application/json')){
        return console.error('Expects application/json');
    }

    try {
        const customer = await Customer.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error(error)
    }

});

app.listen(config.PORT, () => {
    console.log(`Server started at http://localhost:${config.PORT}`);

    mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on('error', (err) => console.log(err));

db.once('open', () => {
    console.log(`Server started on port ${config.PORT}`);
});
