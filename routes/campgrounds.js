var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")

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
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author: author}
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
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
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

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