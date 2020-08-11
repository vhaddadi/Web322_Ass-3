//Contains Database module and handles all mongodb activity 

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
var fs = require('fs');
const { title } = require("process");
const { stringify } = require("querystring");

 


let Schema = mongoose.Schema; 




//local schema, Only exits in node
let userSchema = new Schema({
    userPhoneNumber: {
        type: Number,
        unique : true
    },
    fullName: {
        type :String,
        unique:true
    },
    email: String,
    password: String,
    
    img: {
        type :String,
        
    },
    role: {
    
        type: String,
        default: "cust"
    }
});

let productSchema = new Schema({
    title:{ 
        type : String,
        unique : true
    },
    Ingredient: String,
    Price: String,
    Category:{
        type : String,
        default : "tbd"
    },
    RTEday : String,
    img: String

});
/*let packageSchema = new Schema({
    packageName :{
        type : String,
        unique: true
    },
    item: {
        type: [productSchema],
        default: undefined
    
    },
    packagePr:Number,
    packageDes: String,
    topMealPackage: Boolean
      


});*/

//our local user/product template schemas
let Users;

let Products;

module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{
        
        let db = mongoose.createConnection(process.env.MONGO_DB_CONNECTION_STRING,{ useNewUrlParser: true, useUnifiedTopology: true });
        
        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
            //create a collection in mongo called "users" and "products" 
            //use the above schemas for their layout
            
            Users = db.model("user", userSchema); //if this doesn't exist, make it
            Products = db.model("product", productSchema);
         //   Packages = db.model("package", packageSchema);
            resolve();
          });

    });
}


module.exports.addUser = function(data){
    return new Promise((resolve,reject)=>{
        //prep the incoming data 

        //set data to null if an empty string ""
         
        //for-in loops the variable that we loop with is a copy. 
        for (var formEntry in data){
            if (data[formEntry] == "") //lets just say this works the way we want
                data[formEntry] = null;
        }

        if (data.password != data.password2) {
            reject('Passwords do not match');
        } else {
            let newUser = new Users(data);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(data.password, salt, function(err, hash) {
                    if (err){
                        reject("There was an error encrypting the password");
                    } else {
                        newUser.password = hash;
                        newUser.save().then(() => {
                            console.log("Saved that user: "+data.fullName);
                            resolve();
                        }).catch((err) => {
                            if (err.code == 11000) {
                                reject('User phone number already taken');
                            } else {
                                reject('There was an error creating the user: ' + err);
                            }
                        });
                    }
                });
            });
        }


        
    });
}

module.exports.registerUser = function(userData) {

    for (var formEntry in data){
        if (data[formEntry] == "") //lets just say this works the way we want
            data[formEntry] = null;
    }s
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject('Passwords do not match');
        } else {
            let newUser = new Users(userData);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err){
                        reject("There was an error encrypting the password");
                    } else {
                        newUser.password = hash;
                        newUser.save().then(() => {
                            resolve();
                        }).catch((err) => {
                            
                                reject('There was an error creating the user: ' + err);
                            
                        });
                    }
                });
            });
        }
    });
};



module.exports.getUsers = function(){
    return new Promise((resolve,reject)=>{
        Users.find() //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedUsers)=>{
            
            resolve(returnedUsers.map(item=>item.toObject()));
        }).catch((err)=>{
                console.log("Error retriving users:"+err);
                reject(err);
        });
    });
}

module.exports.getUsersByEmail = function(inEmail){
    return new Promise((resolve,reject)=>{
        //email has to be spelled the same as in the data base
        Users.find({email: inEmail}) //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedUsers)=>{
            if(returnedUsers.length !=0 )
            //resolve(filteredMongoose(returnedUsers));
                resolve(returnedUsers.map(item=>item.toObject()));
            else
                reject("Incorrect Users name/Password");
        }).catch((err)=>{
                console.log("Error retriving users:"+err);
                reject(err);
        });
    });
}



//data = req.body with email & password 
module.exports.validateUser = (data)=>{
    return new Promise((resolve,reject)=>{
    if (data){
        this.getUsersByEmail(data.email).then((retUser)=>{
            //get the data and check if passwords match hash
                // first is non-hashed pw, vs 2nd which is a hashed pw
                bcrypt.compare(data.password, retUser[0].password).then((result) => {
                    if (result){
                        //for added security is return a user object w/o password
                        resolve(retUser);
                        //resolve and pass the user back
                    }
                    else{
                        reject("password/username don't match");
                        return;
                        //reject pass error
                    }
                    // result === true
                });
        }).catch((err)=>{
            reject(err);
            return;
        });
    }
    });
}




module.exports.editUser = (editData)=>{
    return new Promise((resolve, reject)=>{
        
        bcrypt.genSalt(10)  // Generate a "salt" using 10 rounds
        .then(salt=>bcrypt.hash(editData.password,salt)) // use the generated "salt" to encrypt the password: "myPassword123"
        .then(hash=>{
            Users.updateOne(
            {userPhoneNumber : editData.userPhoneNumber}, //what do we updateBy/How to find entry
            {$set: {  //what fields are we updating
                fullName: editData.fullName,
                email: editData.email,
                 password: hash
            }})
            .exec() //calls the updateOne as a promise
            .then(()=>{
                console.log(`User ${editData.fullName} has been updated
                Phone ${editData.userPhoneNumber}`);
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }).catch(()=>{
            reject("Hashing error");
        });
    });
}


module.exports.deleteUserByEmail = (inEmail)=>{
    //return new Promise((resolve,reject)=>{
        setTimeout(function(){
            // if(Users.email === inEmail)
            // fs.unlink(Users[0].img);
            
            Users.deleteOne({email: inEmail})
        .exec()   //run as a promise
        .then(()=>{

            //resolve();
        }).catch(()=>{
           // reject();  //maybe a problem communicating with server
        });
        },2000);
      
        
    //});
}


////Meal functions


module.exports.addProduct = function(data){
    return new Promise((resolve,reject)=>{
      
        for (var formEntry in data){
            if (data[formEntry] == "") //lets just say this works the way we want
                data[formEntry] = null;
        }

       
            let newProduct = new Products(data);
             newProduct.save()
             .then(() => {
                            console.log("Saved that product: "+data.title);
                            resolve();
                        })
                        
             .catch((err) => {
                            if (err.code == 11000) {
                                reject('Product title number already taken');
                            } else {
                                reject('There was an error creating the product: ' + err);
                            }
              });       
 });
};

module.exports.getAllProduct = function(){
    return new Promise((resolve,reject)=>{
        Products.find() //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedProducts)=>{
            
            resolve(returnedProducts.map(item=>item.toObject()));
        }).catch((err)=>{
                console.log("Error retriving Products:"+err);
                reject(err);
        });
    });
}


module.exports.editProduct = (editData)=>{
    return new Promise((resolve, reject)=>{
        
        Products.updateOne(
            {title : editData.title}, //what do we updateBy/How to find entry
            {$set: {  //what fields are we updating
                Price: editData.Price,
                RTEday: editData.RTEday,
                Ingredient : editData.Ingredient,
                Category : editData.Category
            }})
            .exec() //calls the updateOne as a promise
            .then(()=>{
                console.log(`Product ${editData.title} has been updated`);
                resolve();
            }).catch((err)=>{
                reject(`Error ${err} while updating product title ${editData.title}`);
            });
        
    });
}

module.exports.getProductByTitle = function(inTitle){
    return new Promise((resolve,reject)=>{
        //email has to be spelled the same as in the data base
        Products.find({title: inTitle}) //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedProducts)=>{
            if(returnedProducts.length !=0 )
            //resolve(filteredMongoose(returnedUsers));
                resolve(returnedProducts.map(item=>item.toObject()));
            else
                reject("No product with this name found!");
        }).catch((err)=>{
                console.log("Error retriving products:"+err);
                reject(err);
        });
    });
}

module.exports.deleteProductByTitle = (inTitle)=>{
    
        setTimeout(function(){
                       console.log(inTitle);
                        console.log(title);
            Products.deleteOne({title: inTitle})
        .exec()   //run as a promise
        .then(()=>{
           // resolve();
        }).catch((err)=>{
           console.log(`Error ${err} while deleting  product `);
        });
        },2000);
    
}

module.exports.getRTEproduct=(inDay)=>{
      
    return this.getAllProduct.filter( product => product.RTEday === inDay );
}

module.exports.getProductByCategory = (category)=>{

    return new Promise((resolve,reject)=>{
        //email has to be spelled the same as in the data base
        Products.find({Category: category}) //gets all and returns an array. Even if 1 or less entries
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedProducts)=>{
            if(returnedProducts.length !=0 )
            //resolve(filteredMongoose(returnedUsers));
                resolve(returnedProducts.map(item=>item.toObject()));
            else
                reject("No product with this category found!");
        }).catch((err)=>{
                console.log("Error retriving products:"+err);
                reject(err);
        });
    });
   



   
}

// Math

module.exports.returnSum =(data)=>{

    sum = data.reduce(function(a, b){
        return a + b;
      }, 0);
      
      console.log(sum)
     
}
