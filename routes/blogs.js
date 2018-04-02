const express = require('express');
const router = express.Router();
const blog = require('../controllers/blogController');
const auth = require('../controllers/authController');

router.use(auth.profileUse);

router.post('/newBlog', blog.newBlog);

router.get('/allBlogs', blog.allBlogs);

router.get('/singleBlog/:id', blog.singleBlog);

router.put('/updateBlog', blog.updateBlog);

router.delete('/deleteBlog/:id', blog.deleteBlog);

router.put('/likeBlog', blog.likeBlog);

router.put('/dislikeBlog', blog.dislikeBlog);

router.post('/comment', blog.comment);

module.exports = router;