const User = require('../models/user');
const Blog =  require('../models/blog');


module.exports.newBlog = function (req,res) {
    // Check if blog title was provided
    if (!req.body.title) {
        res.json({ success: false, message: 'Blog title is required.' }); // Return error message
    } else {
        // Check if blog body was provided
        if (!req.body.body) {
            res.json({ success: false, message: 'Blog body is required.' }); // Return error message
        } else {
            // Check if blog's creator was provided
            if (!req.body.createdBy) {
                res.json({ success: false, message: 'Blog creator is required.' }); // Return error
            } else {
                // Create the blog object for insertion into database
                const blog = new Blog({
                    title: req.body.title, // Title field
                    body: req.body.body, // Body field
                    createdBy: req.body.createdBy // CreatedBy field
                });
                // Save blog into database
                blog.save(function(err) {
                    // Check if error
                    if (err) {
                        // Check if error is a validation error
                        if (err.errors) {
                            // Check if validation error is in the title field
                            if (err.errors.title) {
                                res.json({ success: false, message: err.errors.title.message }); // Return error message
                            } else {
                                // Check if validation error is in the body field
                                if (err.errors.body) {
                                    res.json({ success: false, message: err.errors.body.message }); // Return error message
                                } else {
                                    res.json({ success: false, message: err }); // Return general error message
                                }
                            }
                        } else {
                            res.json({ success: false, message: err }); // Return general error message
                        }
                    } else {
                        res.json({ success: true, message: 'Blog saved!' }); // Return success message
            }
            });
            }
        }
    }
};

module.exports.allBlogs = function (req,res,next) {
    Blog.find({},function (err,blogs) {
        if(err){
            res.json({success: false, message: err});
        }else{
            if(!blogs){
                res.json({success: false, message: 'No blogs found!'});
            }else{
                res.json({success: true, blogs:blogs});
            }
        }
    }).sort({'_id': -1});
};

module.exports.singleBlog = function (req,res,next) {
    if(!req.params.id){
        res.json({success: false, message: ' Blog ID not found!'});
    }else{
        Blog.findOne({_id: req.params.id}, function (err, blog) {
            if(err){
                res.json({success: false, message: 'Not a valid Blog ID!'});
            }else{
                if(!blog){
                    res.json({success: false, message: 'Blog not found!'});
                }else {
                    User.findOne({_id: req.decoded.userId},function (err,user) {
                        if(err){
                            res.json({success: false, message: 'DEcoded ID ERROR!!!'});
                        }else {
                            if(!user){
                                res.json({success: false, message: 'Unable to Authenticate user!'});
                            }else{
                                if(user.username !== blog.createdBy){
                                    res.json({success: false, message: 'You are nou authorized to edit this blog'});
                                }else{
                                    res.json({success: true, blog: blog});
                                }
                            }
                        }
                    });
                }
            }
        });
    }
};

module.exports.updateBlog = function (req,res,next) {
    if(!req.body._id){
        res.json({success: false, message: 'No Blog id provided!'});
    }else{
        Blog.findOne({ _id: req.body._id }, function (err,blog) {
           if(err){
               res.json({success: false, message: 'Not a valid Blog ID !'});
           }else{
               if(!blog){
                   res.json({success: false, message: 'Blog ID was not found!'});
               }else{
                   User.findOne({ _id: req.decoded.userId },function (err,user) {
                       if(err){
                           res.json({success: false, message: err});
                       }else {
                           if(!user){
                               res.json({success: false, message: 'Unable to Authenticate user!'});
                           }else{
                               if(user.username !== blog.createdBy){
                                   res.json({success: false, message: 'You are nou authorized to edit this blog'});
                               }else{
                                   blog.title = req.body.title;
                                   blog.body = req.body.body;
                                   blog.save(function (err) {
                                       if(err){
                                           res.json({success: false, message: 'Validation Error on Title:'});
                                       }else{
                                           res.json({success: true, message: 'Blog updated!'});
                                       }
                                   })
                               }
                           }
                       }
                   });
               }
           }
        });
    }
};

module.exports.deleteBlog = function (req,res,next) {
    if(!req.params.id){
        res.json({success: false, message: 'No ID Provided!'});
    }else{
        Blog.findOne({_id: req.params.id},function (err,blog) {
            if(err){
                res.json({success: false, message: 'Invalid ID'});
            }else{
                if(!blog){
                    res.json({success: false, message: ' Blog was not found!'});
                }else{
                    User.findOne({_id: req.decoded.userId},function (err,user) {
                        if(err){
                            res.json({success: false, message: err});
                        }else{
                            if(!user){
                                res.json({success: false, message: 'Unable to authenticate User.'});
                            }else{
                                if(user.username !== blog.createdBy){
                                    res.json({success: false, message: 'You are not authorized to delete this blog post'});
                                }else{
                                    blog.remove(function (err) {
                                        if(err){
                                            res.json({success: false, message: err});
                                        }else{
                                            res.json({success: true, message: 'Blog Deleted!'});
                                        }
                                    })
                                }
                            }
                        }
                    })
                }
            }
        })
    }
};

module.exports.likeBlog = function (req,res,next) {
    if(!req.body.id){
        res.json({success: false, message: 'No ID Provided!'});
    }else{
        Blog.findOne({_id: req.body.id},function (err,blog) {
            if(err){
                res.json({success: false, message: 'Invalid ID'});
            }else{
                if(!blog){
                    res.json({success: false, message: 'That Blog was not found!'});
                }else{
                    User.findOne({_id: req.decoded.userId},function (err,user) {
                        if(err){
                            res.json({success: false, message: 'Something went wrong'});
                        }else{
                            if(!user){
                                res.json({success: false, message: 'Unable to authenticate User.'});
                            }else{
                                if(user.username === blog.createdBy){
                                    res.json({success: false, message: 'Cannot like your own post.'});
                                }else{
                                    if(blog.likedBy.includes(user.username)){
                                        res.json({success: false, message: 'You already liked this post.'});
                                    }else{
                                        if(blog.dislikedBy.includes(user.username)){
                                            blog.dislike--;
                                            const arrayIndex = blog.dislikedBy.indexOf(user.username);
                                            blog.dislikedBy.splice(arrayIndex,1);
                                            blog.like++;
                                            blog.likedBy.push(user.username);
                                            blog.save(function (err) {
                                                if(err){
                                                    res.json({success: false, message: 'Something went wrong.'});
                                                }else{
                                                    res.json({success: true, message: 'Blog liked'});
                                                }
                                            });
                                        }else{
                                            blog.like++;
                                            blog.likedBy.push(user.username);
                                            blog.save(function (err) {
                                                if(err){
                                                    res.json({success: false, message: 'Something went wrong.'});
                                                }else{
                                                    res.json({success: true, message: 'Blog liked'});
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            }
        })
    }
};


module.exports.dislikeBlog = function (req,res,next) {
    if(!req.body.id){
        res.json({success: false, message: 'No ID Provided!'});
    }else{
        Blog.findOne({_id: req.body.id},function (err,blog) {
            if(err){
                res.json({success: false, message: 'Invalid ID'});
            }else{
                if(!blog){
                    res.json({success: false, message: 'That Blog was not found!'});
                }else{
                    User.findOne({_id: req.decoded.userId},function (err,user) {
                        if(err){
                            res.json({success: false, message: 'Something went wrong'});
                        }else{
                            if(!user){
                                res.json({success: false, message: 'Unable to authenticate User.'});
                            }else{
                                if(user.username === blog.createdBy){
                                    res.json({success: false, message: 'Cannot dislike your own post.'});
                                }else{
                                    if(blog.dislikedBy.includes(user.username)){
                                        res.json({success: false, message: 'You already disliked this post.'});
                                    }else{
                                        if(blog.likedBy.includes(user.username)){
                                            blog.like--;
                                            const arrayIndex = blog.likedBy.indexOf(user.username);
                                            blog.likedBy.splice(arrayIndex,1);
                                            blog.dislike++;
                                            blog.dislikedBy.push(user.username);
                                            blog.save(function (err) {
                                                if(err){
                                                    res.json({success: false, message: 'Something went wrong.'});
                                                }else{
                                                    res.json({success: true, message: 'Blog disliked'});
                                                }
                                            });
                                        }else{
                                            blog.dislike++;
                                            blog.dislikedBy.push(user.username);
                                            blog.save(function (err) {
                                                if(err){
                                                    res.json({success: false, message: 'Something went wrong.'});
                                                }else{
                                                    res.json({success: true, message: 'Blog disliked'});
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            }
        })
    }
};

module.exports.comment = function (req,res,next) {
    if(!req.body.comment){
        res.json({success: false, message: 'No comment Provided!'});
    }else{
        if(!req.body.id){
            res.json({success: false, message: 'No ID Provided!'});
        }else{
            Blog.findOne({_id: req.body.id},function (err,blog) {
                if(err){
                    res.json({success: false, message: 'Invalid blog Id!'});
                }else{
                    if(!blog){
                        res.json({success: false, message: 'Blog not found'});
                    }else{
                        User.findOne({_id: req.decoded.userId},function (err,user) {
                            if(err){
                                res.json({success: false, message: 'Something went wrong'});
                            }else{
                                if(!user){
                                    res.json({success: false, message: 'User not found!'});
                                }else{
                                    blog.comments.push({
                                        comment: req.body.comment,
                                        commentator: user.username
                                    });
                                    blog.save(function (err) {
                                        if(err){
                                            res.json({success: false, message: 'Something went wrong'});
                                        }else{
                                            res.json({success: true, message: 'Comment saved!'});
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    }
};