import mongoose from "mongoose";

let models = {};

await mongoose.connect('mongodb+srv://info441User:nANHtPXx3hn39W1J@cluster0.ltwstvh.mongodb.net/A3DB')

const postSchema = new mongoose.Schema({
    url: String,
    description: String,
    username: String,
    likes: [String],
    created_date: Date,
});


const commentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    post: {type: mongoose.Schema.Types.ObjectId, ref: "Post"},
    created_date: Date,
});

const userInfo = new mongoose.Schema({
    username: String,
    age: Number,
    favorite_color: String
})

models.Post = mongoose.model('Post', postSchema);
models.Comment = mongoose.model('Comment', commentSchema);
models.UserInfo = mongoose.model('UserInfo', userInfo);

export default models;