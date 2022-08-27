const mongoose = require('mongoose');
const Meals = require('./models/meals');
const Customerregister = require('./models/customer');
const Foodtypes = require('./models/foodtypes');

mongoose.connect('mongodb://localhost:27017/nutritions_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const seedCustomers = [
    {
        name: 'Eve Rose',
        email: 'everose@gmail.com',
        password: '789654123'
    },
    {
        name: 'Pears Williams',
        email: 'pearswilliams@gmail.com',
        password: 'jghobnobn'
    },
    {
        name: 'Iain Tylor',
        email: 'iaintylor@gmail.com',
        password: '123456789'
    },
    {
        name: 'Rachel Knight',
        email: 'rachelknight@gmail.com',
        password: '112255669'
    }
]

const seedFoodTypes = [
    {name: 'starch', mealDetails: ['all bran','raison bran','cheerios','crunchy nut','weetabix','potatoes','noodles','oats','whole-wheat flour','white flour','crackers','pretzels','rice krispies cereal']},
    {name: 'carbohydrate', mealDetails: ['yogurts','sweet potato','pizza','almond milk','potatoes','noodles','oats','pasta','breads','rice','vegetables','nuts','desserts','milk']},
    {name: 'protein', mealDetails: ['plaice','kidney','turkey','liver','fish','burgers','chicken', 'beef','chicken','pork','saugages','lamb','duck']},
    {name: 'sugars', mealDetails: ['c,ereal bars','caramel','treacle','cakes','sugar','honey','ice cream','cookies', 'candy','baked beans','fruit juice','demerara sugar','ice cream','maple syrup','sweeteners']},
    {name: 'fiber', mealDetails: ['pears','raspberries','black berries','vegetables','nuts','bananas','fruit','tomatoes','apples','oranges','cherries']}
];

    Foodtypes.insertMany(seedFoodTypes)
    .then(res => {
        console.log(res)
    })
    .catch(e => {
        console.log(e)
    });