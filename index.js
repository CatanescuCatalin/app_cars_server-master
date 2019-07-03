const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const bodyParser = require("body-parser");

const fs = require('fs');

const fileUpload = require('express-fileupload');

const Customer = require("./models/Customers");
const User = require("./models/User");
const Car = require("./models/Car");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(fileUpload());

app.post("/api/register", async (req, res) => {
  const { userName, password, email } = req.body;
  const user = new User({
    userName,
    password,
    email
  });

  await user.save();
  res.sendStatus(201);
});

app.post("/api/create/car", async (req, res) => {
  console.log("trying to upload");
  const {
    Maker,
    Model,
    FuelType,
    Volume,
    Seats,
    Transmision,
    Color,
    Ncoordonate,
    Ecoordonate,
    Price
  } = JSON.parse(req.body.car);

  const car = new Car({
    Maker,
    Model,
    FuelType,
    Volume,
    Seats,
    Transmision,
    Color,
    Ncoordonate,
    Ecoordonate,
    Price
  });

  var dir = './public/'+ car.id;
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  Object.values(req.files).forEach(value => {

    let sampleFile = value;

    sampleFile.mv('./public/'+ car.id + '/' + sampleFile.name, function(err) {
      if (err){
        console.log(err)
        return res.status(500).send(err);
      } 
      
    }); 
  });

  await car.save((err, car) => {
    if(err){
      console.error(err);
    }
  });

  res.sendStatus(201);
});

app.post("/api/login", async (req, res) => {
  const { userName, password } = req.body;

  const user = await User.find({ userName, password });
  if (user.length === 0) {
    res.status(404);
    res.json({ msg: "not found user" });
  } else {
    res.json(user);
  }
});

app.post("/api/userinfo", async (req, res) => {
  const { userName } = req.body;

  const user = await User.find({ userName });
  if (user.length === 0) {
    res.status(404);
    res.json({ msg: "not found user" });
  } else {
    if(user[0].ReservedCar){
      const car = await Car.findById(user[0].ReservedCar)
      res.json({ user, car });
    } else {
      res.json({ user });
    }
  }
});

app.post('/upload', function(req, res) {

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  Object.values(req.files).forEach(value => {
    console.log("upload image", value);

    let sampleFile = value;

    sampleFile.mv('./public/'+sampleFile.name, function(err) {
      if (err){
        console.log(err)
        return res.status(500).send(err);
      } 
      
    }); 
  });

  res.send('File uploaded!');
});

app.get("/api/cars", async (req, res) => {
  try {
    const car = await Car.find({"Reserved": false});
    res.send(car);
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
});

app.get("/api/cars-all", async (req, res) => {
  try {
    const car = await Car.find({});
    res.send(car);
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
});

app.get("/api/free-car/:id", async (req, res) => {
  console.log("try to free car");
  try {
    const car = await Car.findOne({_id: req.params.id}, (err, doc) => {
      doc.Reserved = false;
      doc.ReservedUser = "";
      doc.save();
    });

    const user = await User.findOne({"userName": car.ReservedUser}, (err, doc) => {
      doc.ReservedCar = "";
      doc.save();
    });


    res.send("Updated");
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
})

app.get("/api/car/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.send(car);
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
});

app.get("/users", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
});

app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.send(customers);
  } catch (err) {
    console.log(err);
    res.send("Not Found");
  }
});

app.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.send(customer);
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/image/:carId", async (req, res) => {
  let cardId = req.params.carId;
  images = [];

  fs.readdirSync('./public/' + cardId).forEach(file => {
    images.push(file)
  });

  res.send(images)
});

app.post("/customers", async (req, res) => {
  if (!req.is("application/json")) {
    return console.error("Expects application/json");
  }

  const { name, email, balance } = req.body;

  const customer = new Customer({
    name,
    email,
    balance
  });

  try {
    const newCustomer = await customer.save();
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/reservCar/:id", async (req, res) => {
  console.log("Try to reserv car");
  if (!req.is("application/json")) {
    return console.error("Expects application/json");
  }

  let cardId = req.params.id;
  let { user, totalPrice, selectedEndDate, selectedStartDate } = req.body
  let userObj = JSON.parse(user)


  console.log(req.body);

  try {
    User.findOne({userName: userObj.userName}, (err, doc) => {
      doc.ReservedCar = cardId;
      doc.TotalSpent += totalPrice;
      doc.selectedEndDate = selectedEndDate;
      doc.selectedStartDate = selectedStartDate;
      doc.save()
    });
  } catch (error) {
    console.log(error)
  }
  
  try {
    Car.findOne({ _id: cardId }, function (err, doc){
      doc.Reserved = true;
      doc.ReservedUser = userObj.userName;
      doc.save();
    });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.put("/customers/:id", async (req, res) => {
  if (!req.is("application/json")) {
    return console.error("Expects application/json");
  }

  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
  }
});

app.listen(config.PORT, () => {
  console.log(`Server started at http://localhost:${config.PORT}`);

  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on("error", err => console.log(err));

db.once("open", () => {
  console.log(`DB connection open${config.PORT}`);
});
