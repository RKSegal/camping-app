var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err)
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

//create and add to db
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    const { name, price, image, description } = req.body;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;
        const newCampground = { name, price, image, description, author, location, lat, lng };
        newCampground.createdAt = new Date();
        newCampground.updatedAt = new Date();
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });  
});
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new")
});

router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log("err");
            req.flash("error", "Campground not found.");
            return res.redirect("back");
        } 
        return res.render("campgrounds/show", {campground: foundCampground});
    });
})

//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err || !foundCampground) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        }
        return res.render("campgrounds/edit", { campground: foundCampground })
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        req.body.campground.updatedAt = new Date();
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Your campground has been successfully updated!")
            res.redirect("/campgrounds/" + req.params.id)
        }
    });
});
});

//Destroy
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            req.flash("error", "You don't have permission to do that.")
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "You have successfully deleted <%= campground.name &>")
            res.redirect("/campgrounds");
        }
    });
});




module.exports = router;