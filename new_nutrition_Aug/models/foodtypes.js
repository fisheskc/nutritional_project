const mongoose = require('mongoose');
const Meals = require('./meals');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const foodTypesSchema = new Schema({
    mealDetails: [
        {
            type: String
        }
    ],
    name: {
        type: String
    },
    
    meals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meals'
        }
    ]
})

module.exports.foodTypesForMeal = async (meal) => {
    let foundMeal = [];
    let count = 0;
    console.log(meal)
    // this is like a where clause
    const findFoodType = await Foodtypes.find({mealDetails: meal })
    console.log(`This is findFoodType: ${findFoodType}`)
  
        for(const foodT in findFoodType) {
            if(findMeal[meal]===findFoodType[foodT]) {
                count++;
            }

        return meal;
    }
    console.log(foundMeal)
    return foundMeal;
}

foodTypesSchema.post('findOneAndDelete', async function(foodType){
    if(foodType.meals.length) {
       const res = await Meals.deleteMany({_id: { $in: foodType.meal } })
       console.log(res);
    }
    
})

const Foodtypes = mongoose.model('Foodtypes', foodTypesSchema);

module.exports = Foodtypes;






