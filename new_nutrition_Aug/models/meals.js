const mongoose = require('mongoose');
const { Schema } = mongoose;
const Customer = require('./customer');
const passportLocalMongoose = require('passport-local-mongoose');

const customerMealsSchema = new Schema ({
    firstMeal: String,
    secondMeal: String,
    thirdMeal: String,
    snacks: String,
    other: String,
    customerregister: {
        type: Schema.Types.ObjectId,
        ref: 'Customerregister'
    }
});

const Meals = mongoose.model('Meals', customerMealsSchema);

module.exports = Meals;