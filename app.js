var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    express = require("express"),
    app = express();

//APP CONFIG    
// mongoose.connect("mongodb://localhost/restful_blog");
mongoose.connect("mongodb://lap:4444@ds159856.mlab.com:59856/restful_blog");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extened: true
}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//MOGOOSE CONFIG
var blogSchema = new mongoose.Schema({
    titile: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     titile: "Blog Default Title",
//     image: "http://placehold.it/600x500",
//     body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
// });

//RESTful ROUTES
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", {
                blogs: blogs
            });
        }
    });
});

app.get("/blogs/new", function(req, res) {
    res.render("new");
});

app.post("/blogs", function(req, res) {
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    if(req.body.blog.image.length < 6){
        req.body.blog.image = "http://placehold.it/600x500";
    }
    
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err || !foundBlog) {
            res.redirect("/blogs")
        }
        else {
            res.render("detail", {
                blog: foundBlog
            });
        }
    });
})

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err || !foundBlog) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", {
                blog: foundBlog
            });
        }
    });
});

app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    if(req.body.blog.image.length < 6){
        req.body.blog.image = "http://placehold.it/600x500";
    }
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err || !updatedBlog) {
            res.redirect("/blogs")
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }

    })
});

app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err, foundBlog) {
        if (err || !foundBlog) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server is running");
});
