var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")

router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            console.log(err);
            console.log('do something here...');
            res.redirect('/');
        } else {
            res.render("comments/new", {campground: campground});
        }
    })
})

router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //create new comment
            const newComment = JSON.parse(JSON.stringify(req.body.comment));
            newComment.created_at = new Date();
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong.")
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id)
                }
            })
        }
    })   
})

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
         });
    })
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    const temp = JSON.parse(JSON.stringify(req.body.comment));
    temp.updatedAt = new Date();
    Comment.findByIdAndUpdate(req.params.comment_id, temp, function(err, updatedComment){
       if(err){
           res.redirect("back");
       } else {
        if (!updatedComment) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        }
        req.flash("success", "You have successfully updated your comment.")
        return res.redirect("/campgrounds/" + req.params.id );
       }
    });
 });

 router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
         if(err){
            req.flash("error", "You don't have permission to do that.");
             res.redirect("back");
         } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/campgrounds/" + req.params.id );
         }
     });
 });

module.exports = router;