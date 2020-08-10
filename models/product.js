
/*
Vahideh Haddadi
ID: 149955163
*/


// http://clipart-library.com/clipart/8T6okX7jc.htm free clip
const product ={

    fakeDb : [],


    initDB(){

        this.fakeDb.push({
            title : 'Beef Lo Mein Noodles',
            Ingredient : 'beef, sliced carrots, peppers and  broccoli florets with a soy and ginger sauce',
            Price : '$15.99',
            imgPath : 'dish/beefnoodle2.jpg',
            Category : 'dish',
            ReadyToEat : true
        })

        this.fakeDb.push({
            title : 'Cabbage Soup',
            Ingredient : 'cabbage with smoked paprika and rousted tomatoes',
            Price : '$10.99',
            imgPath : 'dish/cabbagSoup.jpg',
            Category : 'dish',
            ReadyToEat : true
        })

        this.fakeDb.push({
            title : 'Lemon Herb Salmon and Zucchini',
            Ingredient : ' zucchini,Salmon, olive oil,brown sugar, lemon juice, garlic',
            Price : '$16.99',
            imgPath : 'dish/casey2.jpg',
            Category : 'dish',
            ReadyToEat : false
        })

        
        this.fakeDb.push({
            title : 'Chicken Curry',
            Ingredient : 'chicken,Creamy curry sauce ,Curry powder,spice, coconut milk',
            Price : '$14.99',
            imgPath : 'dish/chickenCurry.jpg',
            Category : 'dish',
            ReadyToEat : false
        })

        
        this.fakeDb.push({
            title : 'Lemon Herb Chicken and Bowtie Pasta',
            Ingredient : 'seasoned chicken breast fillets, broccoli, carrots and bell peppers, with a savoury lemon herb and garlic sauce',
            Price : '$10.99',
            imgPath : 'dish/chickenPasta.jpg',
            Category : 'dish',
            ReadyToEat : false
        })

        this.fakeDb.push({
            title : 'Steak',
            Ingredient : 'Beef,soy sauce, parsley,garlic, butter',
            Price : '$18.99',
            imgPath : 'dish/Steak.jpg',
            Category : 'dish',
            ReadyToEat : true
        })
        /* Salads */
        this.fakeDb.push({
            title : 'Spicy Chicken',
            Ingredient : 'seasoned chicken breast fillets, broccoli, carrots and bell peppers, lettuce, green beans, green onion, egg',
            Price : '$13.99',
            imgPath : 'salads/spicychicken.jpg',
            Category : 'salad',
            ReadyToEat : true
        })

        /* vegan */


        this.fakeDb.push({
            title : 'Baked stuffed butternut pumpkin',
            Ingredient : 'seasoned  pumpkin,  butternut, cashew coriander cream cheese',
            Price : '$12.99',
            imgPath : 'vegan/Bakedpumpkin.jpg',
            Category : 'vegan',
            ReadyToEat : true
        })


        /* sea food */

        this.fakeDb.push({
            title : 'Coconut Fish Curry',
            Ingredient : 'salmon,Creamy curry sauce ,Curry powder,spice, coconut milk',
            Price : '$20.99',
            imgPath : 'seafood/coconut-fish-curry.jpg',
            Category : 'seafood',
            ReadyToEat : true
        })


    },


    getAllProduct(){

        return this.fakeDb;
    },

    getRTEproduct(){
      
        return this.fakeDb.filter( product => product.ReadyToEat === true );
    },

    getProductByCategory(category){
        return this.fakeDb.filter( product => product.Category === category );
    }



}

product.initDB();

module.exports = product;