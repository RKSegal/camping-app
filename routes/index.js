var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware")

router.get("/", function(req, res){
    res.render("landing");
});

//AUTH routes
router.get("/register", function(req, res){
    res.render("register");
});
//sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username)
            res.redirect("/campgrounds");
        })
    })
});

router.get("/login", function(req, res){
    res.render("login");
});
//login logic
const passportOptions = {
    successRedirect:"/campgrounds",
    failureRedirect: "/login",
    failureFlash: "Wrong Username/Passowrd"
};
router.post("/login", passport.authenticate("local", passportOptions));

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "See you next time!");
    res.redirect("/");
});


module.exports = router;