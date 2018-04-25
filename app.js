const   express         = require("express"),
        app             = express(),
        bodyParser      = require("body-parser"),
        mongoose        = require('mongoose'),
        flash           = require("connect-flash"),
        passport        = require("passport"),
        LocalStrategy   = require("passport-local"),
        methodOverride  = require("method-override"),
        Campground      = require("./models/campground"),
        Comment         = require("./models/comment"),
        User            = require("./models/user"),
        seedDB          = require("./seeds")

//requring routes
const   commentRoutes    = require("./routes/comments"),
        campgroundRoutes = require("./routes/campgrounds"),
        indexRoutes      = require("./routes/index");

//seedDB();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());

app.locals,moment = require("moment");

//Passport Configuration
app.use(require("express-session")({
    secret: "Dogs dogs dogs",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//SCHEMA in models/campgrounds.js

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

mongoose.connect('mongodb://localhost:27017/yelp_camp', (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log('Connect to Mongodb successfully');
    app.listen(3000, (err) => {
        if (err) {
            throw err;
        }
        console.log('YelpCamp is here')
    });
});


process.on('UnhandledPromiseRejection', (error) => {
    console.log('error UnhandledPromiseRejection');
    throw error;
});

