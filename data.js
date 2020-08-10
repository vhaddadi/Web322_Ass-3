var fs = require("fs");

var cars;
var testVar =[];

module.exports.initialize = ()=>{
    return new Promise((resolve, reject)=>{
        //use readfile to try and read the file.
        fs.readFile("./data.json",'utf8', (err, readData)=>{
            if (err){
                reject({data:"File had problem reading: "+err.message});
                return;
            }
            else{
                cars = JSON.parse(readData);
                resolve();
                return;
            }
        });
    });
}

module.exports.getAllCarsNP = ()=>{
    setTimeout(() => {
        return cars;
    }, 1000);
}

module.exports.getAllCarsP = ()=>{
    return new Promise((resolve, reject)=>{
        if (cars.length == 0){
            reject("There are no cars available");
            return;
        }
        else{
            setTimeout(() => {
                resolve(cars);
                return;
            }, 1000);
        }
    });
}

module.exports.addName = (name)=>{
    return new Promise((resolve, reject)=>{
        testVar.push(name);
        resolve();
    });
}

module.exports.getVar =()=>{
    return new Promise((resolve, reject)=>{
        resolve(testVar);
    })
}

module.exports.validate = (body)=>{
    return new Promise((resolve, reject)=>{
        if (body.uname && body.email && body.password) //checks to see if these attributes exist
        {
            if(body.uname !="" && body.email !="" && body.password !="")
            {
                var emailCheck = new RegExp('^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$');
                if (emailCheck.test(body.email.trim())){
                    resolve();
                    return;
                }
            }
        }
        
        
            body.message = "email or password is incorrect.";
            reject(body);
            return; 
        
    });
}