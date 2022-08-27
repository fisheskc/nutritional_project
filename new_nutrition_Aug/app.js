// This works with NPM dotenv and the .env file that stores my API keys for cloudinary
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const utils = require('utils');
const multer = require('multer');
const {storage} = require('./cloudinary');
const {upload} = multer({storage});


const Joi = require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const {isLoggedIn} = require('./middleware')

const Meals = require('./models/meals');
const Foodtypes = require('./models/foodtypes');
const User = require('./models/user');

const customerRoutes = require('./routes/customers');
const { resolve } = require('path');

mongoose.connect('mongodb://localhost:27017/nutritions_db', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

// view directory of EJS
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // 1000= miliseconds, 60=secs, 60=mins, 60= 24=hrs, 24=day, 7= days  
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// authenticate on the user model
passport.use(new LocalStrategy(User.authenticate()));

// passport stores and receives info from a session lines 74/75
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// on every single request, will be accessed by the key: res.locals.success
app.use((req, res, next) => {
    console.log(req.session);
    // checks to see if the current user is loggedIn, key property to use else where is currentUser in if statements
    res.locals.currentUser = req.user;
    // checks to see if the success of user is loggedIn, key property to use else where is success in if statements
    res.locals.success = req.flash('success');
    // this is accessed under the key of error, key property to use else where is error in if statements
    res.locals.error = req.flash('error');
    next();

})

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', customerRoutes);

const requireLogin = (req, res, next) => {
    if(!req.session.name_id) {
        req.flash('success', 'You have successfully registered');
        return res.redirect('/customers/login');
    }
    next();
}

// foodtypes routes
app.get('/food', catchAsync(async(req, res) => {
    const foodTypes = await Foodtypes.find({});
    console.log(foodTypes);
    res.render('food/index', {foodTypes});
}))

app.get('/food/:id', catchAsync(async(req, res) => {
    const foodType = await Foodtypes.findById(req.params.id).populate('meals');
    console.log(foodType);
    res.render('food/show', {foodType});
}))

app.delete('/food/:id', catchAsync(async(req, res) => {
    const foodType = await Foodtypes.findByIdAndDelete(req.params.id);
    res.redirect('/food');
}))

app.post('/food', catchAsync(async(req, res) => {
    const foodType = new Foodtypes(req.body);
    await food.save();
    res.redirect('/food');
}))

app.get('/food/:id/meals/new', async(req, res) => {
    const {id} = req.params;
    const foodType = await Foodtypes.findById(id);
    console.log(foodType);
    res.render('meals/new', {foodType});
})

app.post('/food/:id/meals', catchAsync(async(req, res) => {
    const {id} = req.params;
    const foodtype = await Foodtypes.findById(id);
    const {firstMeal,secondMeal,thirdMeal,snacks,other}=req.body;
    const meal = new Meals({firstMeal,secondMeal,thirdMeal,snacks,other});
    console.log(meal);
    // meals is the array
    foodtype.meals.push(meal);
    meal.foodtype = foodtype;
    await foodtype.save();
    await meal.save();
    res.redirect(`/food/${id}`);
}))

// meals routes
app.get('/meals', catchAsync(async(req, res) => {
    const meals = await Meals.find({});
    res.render('meals/index', {meals});
}))

app.get('/meals/new', (req, res) => {
    res.render('meals/new');
})

app.post('/meals', catchAsync(async(req, res) => {
   const newMeals = new Meals(req.body);
   await newMeals.save();
//    console.log(newMeals)
   res.redirect(`/meals/${newMeals._id}`)
}))

// food search here takes place against the meals schema
app.get('/meals/:id', catchAsync(async(req, res) => {
    let usedFood = [];
    // Variable for extractFoodInfo function on line 209
    let foodinfo
    // populate takes other schema keys from mongoose - not working line below
    const meal = await Meals.findById(req.params.id);
    let Allmeals = await Meals.findById(req.params.id);
    // all food input is turned to lowercase & pushed into the new array - usedFood
    usedFood = [...usedFood, Allmeals.firstMeal.toLowerCase(),Allmeals.secondMeal.toLowerCase(),Allmeals.thirdMeal.toLowerCase(),Allmeals.snacks.toLowerCase(),Allmeals.other.toLowerCase()];
    const findFoodType = await Foodtypes.find();
    const findFoodNutrition = [];
    // extractFoodInfo is the parameter, is used as a function & is curried
    let findFoodTypes = () => {
         // iterate through the foodtype schemas 
        Object.entries(findFoodType).forEach((entry) => {
           console.log(entry);
           // accesses the 2nd array
            const foodTypeName = entry[1].name;
            // meals mealDetails entered , adds 1 to the count in the found food
            const mealDetails = entry[1].mealDetails;
            // filters the meals entered in the new array & compares with foodtype
            const searchFoodTypes = mealDetails.filter((food) => {
                // the mealDetails 
                return usedFood.includes(food);
            })
              //pushed to a new array as an object & searchFoodTypes is counted
                findFoodNutrition.push({name: foodTypeName, count: searchFoodTypes.length});
        })
    }
    console.log(findFoodTypes((findFoodNutrition)));

    function extractFoodInfo(){
        return findFoodNutrition.map((key) => {
         let foodOutput = `This is your nutrition feedback: ${key.name} = ${key.count} from your day's food`   
         console.log(foodOutput)
         return foodOutput;
   });
   }
   foodinfo = extractFoodInfo(findFoodNutrition);
   res.render('meals/show', {meal, foodinfo});
}))     

app.delete('/meals/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    const deletedProduct = await Meals.findByIdAndDelete(id);
    res.redirect('/meals');
}));

app.get('/',(req,res) => {
    res.render('home');
})

app.all('*',(req,res,next) => {
    next(new ExpressError('Page not Found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode=500 }  = err;
    if(!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!");
})

