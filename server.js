//Heroku link:
//Github link:  


const express = require("express");  //allows us to use the installed express module
const app = express();  //takes the express module and assignes it to app
const path = require("path");
const ds = require("./data.js");
const db = require("./db.js");
const exphbs = require("express-handlebars");
const bp = require("body-parser");
const multer = require("multer");
const clientSessions = require("client-sessions");

//const product = require("./models/product");
 
require('dotenv').config({path:"./config/keys.env"});

const HTTP_PORT = process.env.PORT ;    //get the process enviornment port or use port 8080

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}



app.use(bp.urlencoded({ extended: false }));

//Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: process.env.SESSION_PASS, // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));


const storage = multer.diskStorage({
  destination: "./public/photos/",
  filename: function (req, file, cb) {
   
      cb(null, Date.now() + path.extname(file.originalname));

  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  } else {
    return cb(new Error('Not an image! Please upload an image.', 400), false);
  }
};

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage, fileFilter: imageFilter });

db.initialize()
.then(()=>{
  console.log("Data read successfully");
  app.listen(HTTP_PORT, onHttpStart);
  
})
.catch((data)=>{
  console.log(data);
});



//Handlebars stuff
// Register handlerbars as the rendering engine for views
app.set("views", "./views");//points to our handlebars files.

app.engine(".hbs", exphbs({ extname: ".hbs"})
);//Setting up rendering engine
//uses .hbs files, and whenever we render a file, we can just call the filename without the extension.


app.set("view engine", ".hbs"); //setup viewEngine.

//body parser setup

app.use(express.static('public'));//let us use the "public" folder in our browsers



app.get("/", (req, res) => {
  //console.log(process.env.MONGO_DB_CONNECTION_STRING);
  res.render("index");
  
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } 
  else {
    next();
  }
}

function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role =="admin") {
    next();
  } else {
    res.redirect("/login");
  }
}


app.get("/login",(req,res)=>{
  res.render("login");
});

//handles the post and calls a function to validate user and add them to a session
app.post("/login",(req,res)=>{

  const errors = [];
  if(req.body.email === ''){

    errors.push('The email filed can not be empty! ')
  }
   db.validateUser(req.body)
  .then((inData)=>{
    req.session.user = inData[0];  //logs them in as a user

    console.log(req.session.user);
    if(inData[0].role === 'admin'){
      
      res.render("adminDash",{users: inData[0], session: req.session.user, successMessage: `Admin ${inData[0].fullName} logged in!` });}
    else{
      res.render("private",{users: inData, session: req.session.user, successMessage: `${inData[0].fullName} logged in!`});}
    
  })
  .catch((err)=>{

    if(errors.length > 0){

      res.render('login', { errorMessage: errors, userName: req.body.fullName });
    }else{

      res.render('login', { errorMessage: err , userName: req.body.fullName });
    }
  });
});

//this will be a private route
app.get("/private", ensureLogin, (req,res)=>{
  res.render("private",{data: req.session.user});
});



app.get("/logout",(req,res)=>{
  req.session.reset();
  res.redirect("/login");
});

//Users Pages--------------------------------------------------
app.get("/users",ensureLogin,ensureAdmin,(req,res)=>{
  //this code is only for test purposes, just checking function
  if (req.query.email){
    db.getUsersByEmail(req.query.email).then((data)=>{
      res.render("users",{users: (data.length!=0)?data:undefined});
    }).catch((err)=>{
      res.render("users"); //add an error message or something
    });
  }
  else{
  db.getUsers().then((data)=>{
    res.render("users",{users: (data.length!=0)?data:undefined});
  }).catch((err)=>{
    res.render("users"); //add an error message or something
  });
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post('/register',upload.single("photo"), (req, res) => {
 
  req.body.img = req.file.filename;
  db.addUser(req.body).then(()=>{
    res.render('register', { successMessage: "User created" });
  }).catch((err)=>{
    console.log("Error adding user: "+ err);
    res.render('register', { errorMessage: err, userName: req.body.userName });
  }); 
});

app.get("/users/add",ensureLogin, ensureAdmin, (req,res)=>{
  res.render("addUser");
});


app.post("/users/add", upload.single("photo"), (req, res)=>{

  
        req.body.img = req.file.filename;

        db.addUser(req.body).then(()=>{
          res.redirect("/users");
        }).catch((err)=>{
          console.log("Error adding user: "+ err);
          res.redirect("/users/add"); //passing an error message or the user object
        }); 
      
});
//----------------------------------------------------------




app.get("/edit",ensureLogin,(req,res)=>{
  if (req.query.email){ 
    db.getUsersByEmail(req.query.email).then((users)=>{
      res.render("EditUser", {data:users[0]}); //using [0] because user is an array
    }).catch(()=>{
      console.log("couldn't find the user");
      res.redirect("/");
    });
  }
  else
    res.redirect("/users");
});

app.post("/users/edit",upload.single("photo"),(req,res)=>{
   
    db.editUser(req.body).then(()=>{
      res.redirect("/users");
    }).catch((err)=>{
      console.log(err);
      res.redirect("/users");
    })
});




//Delete Route
app.get("/delete",ensureLogin,(req,res)=>{
 // req.body.img = req.file.filename;
  if(req.query.email){
    db.deleteUserByEmail(req.query.email);
   // unlinkAsync(req.file.path);     //searching is slow
    res.redirect("/users");                   //typically a faster function
  }
  else{
    console.log("No Query");
    res.redirect("/users");
  }
});


//Product route

app.get("/productList",(req,res) =>{


  if (req.query.title){
    db.getProductByTitle(req.query.title).then((data)=>{
      res.render("productList",{products: (data.length!=0)?data:undefined});
    }).catch((err)=>{
      res.render("productList"); //add an error message or something
    });
  }
  else{
  db.getAllProduct().then((data)=>{
    res.render("productList",{products: (data.length!=0)?data:undefined});
  }).catch((err)=>{
    res.render("productList"); //add an error message or something
  });
  }
  
})

app.get("/vegan",(req,res) =>{

  db.getProductByCategory('vegan')
  .then((data)=>{
   res.render("productList",{products: (data.length!=0)?data:undefined});
 })
 
 .catch((err)=>{
   res.render("productList");
   console.log(`Error1 : ${err}`); //add an error message or something
 });    

});



app.get("/smartFood",(req,res) =>{

  db.getProductByCategory('dish')
   .then((data)=>{
    res.render("productList",{products: (data.length!=0)?data:undefined});
  })
  
  .catch((err)=>{
    res.render("productList");
    console.log(`Error1 : ${err}`); //add an error message or something
  });      
})

app.get("/SeaFood",(req,res) =>{

  
  db.getProductByCategory('seafood')
   .then((data)=>{
    

      res.render("productList",{products: (data.length!=0)?data:undefined});
    
    
  })
  
  .catch((err)=>{
    res.render("productList");
    console.log(`Error1 : ${err}`); //add an error message or something
  });
  

})

app.get("/salad",(req,res) =>{
  db.getProductByCategory('salad')
   .then((data)=>{
    res.render("productList",{products: (data.length!=0)?data:undefined});
  })
  
  .catch((err)=>{
    res.render("productList");
    console.log(`Error1 : ${err}`); //add an error message or something
  });    
});


app.post("/products/add", upload.single("photo"), (req, res)=>{

  
  req.body.img = req.file.filename;

  db.addProduct(req.body).then(()=>{
    res.render('addProduct', { successMessage: `${req.body.title} created` })
   
  }).catch((err)=>{
    console.log("Error adding product: "+ err);
    res.render('addProduct', { errorMessage: err, title: req.body.title });
     //passing an error message or the user object
  }); 

});

app.get("/products/add",ensureAdmin,ensureLogin, (req,res)=>{
  res.render("addProduct");
});

app.get("/editProduct",(req,res)=>{
  if (req.query.title){ 
    db.getProductByTitle(req.query.title).then((products)=>{
      res.render("EditProduct", {data:products[0]}); //using [0] because user is an array
    }).catch(()=>{
      console.log("couldn't find the product");
      res.redirect("/ProductDashboard");
    });
  }
  else
    res.redirect("/ProductDashboard");
});

app.post("/editProduct",upload.single("photo"),(req,res)=>{
   
  db.editProduct(req.body).then(()=>{
    res.redirect("/productList");
  }).catch((err)=>{
    console.log(err);
    res.redirect("/productList");
  })
});

app.get("/deleteProduct",ensureAdmin,(req,res)=>{
  // req.body.img = req.file.filename;
   if(req.query.title){
     db.deleteProductByTitle(req.query.title);
      res.render("ProductDash")
                  //typically a faster function
   }
   else{
     console.log("No Query");
     res.redirect("/ProductDashboard");
   }
 });

 app.get("/ProductDashboard",ensureLogin,ensureAdmin,(req,res)=>{

  if (req.query.title){
    db.getProductByTitle(req.query.title).then((data)=>{
      res.render("producDash",{products: (data.length!=0)?data:undefined});
    }).catch((err)=>{
      res.render("producDash"); //add an error message or something
    });
  }
  else{
  db.getAllProduct().then((data)=>{
    res.render("productDash",{products: (data.length!=0)?data:undefined});
  }).catch((err)=>{
    res.render("productDash"); //add an error message or something
  });
  }
  
});

















//getAllCarsP
app.get("/carsNP",(req,res)=>{
  var stuff = ds.getAllCarsNP();
  res.render("cars",{data: stuff});
});

app.get("/cars", (req,res)=>{
  ds.getAllCarsP().then((cars)=>{
     res.render("cars", {data: cars});
  }).catch((err)=>{
    res.render("cars", {message: err});
  });
})



// /test/joe      /test/fred
app.get("/test/:name",(req,res)=>{
  ds.addName(req.params.name).then(()=>{
    res.redirect("/test");
  })
});

app.get("/test",(req,res)=>{
  ds.getVar().then((data)=>{
    res.render("test",{data:data});
  })
});

app.post("/validate", (req,res)=>{
  ds.checkValid(req.body).then(()=>{
    ds.storePerson(req.body).then(()=>{
      res.redirect("/profile");
    })
  }).catch((errmessage)=>{
    res.render("/registration",{message: req.body});
  })
})


var formData = {  //should come in from an actual form
  uname: "BilyBob",
  email: "bo%^%^&%b@myseneca.ca",
  password: "P@ssw0rd"
};

//app.post
app.get("/formPost", (req,res)=>{
  ds.validate(formData).then(()=>{
    res.send("It worked " + JSON.stringify(formData));  //res.send => res.render passing you data back
  }).catch((data)=>{
    res.send("It didn't work " + JSON.stringify(data));
  });
});



//if checkValid rejects anything in the ("error with user name") gets passed into message
//errmessage is what is passed from reject
//"message" gets passed into hbs

app.use((err, req,res, next)=>{
  if(err){
    console.log(err.message);
    res.status(500).send('Something broke!')
  }
  else {
    res.status(404).send("No page found by that route");
  }
  
});

// Countact Us

app.get("/contactUs", (req , res) => {

  res.render("contactUs", {
      title: "Contact Us"

  })

});

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
      

app.post("/contactUs", (req , res) => {

  const {firstName,lastName,email,message} = req.body;

  console.log(req.body);
 

  const errors = [];

  if (firstName === '' || lastName === ''){
      errors.push('Please enter your name!');
  }
  if (email === ''){
      errors.push('Please enter your email address!');
  }
  if(message === ''){

      errors.push('The message filed can not be empty! ')
  }

      if(errors.length > 0){
          res.render("contactUs" , {
              title: "Contact Us",
              errorsArray : errors
      
          });
          //console.log(errors);
      }
      
      //console.log(req.body);
     else {

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
      const msg = {
      to: `${email}`,
      from: `vahideh.hdd@gmail.com`,
      subject: 'Contact us form submit',
      html:
       `
          Visitor's Name: ${firstName} ${lastName} <br>
          Visitor's Email Address : ${email} <br>
          Visitor's Message : ${message}
      `,
      };
      
      
      sgMail.send(msg)
  
      .then(()=>{

          res.redirect("/");
      })
      .catch(err =>{

              console.log(`Error ${err}`);
      })
  }

});
