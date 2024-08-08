const express=require("express");
const app=express();
const path =require("path");
const socket =require("socket.io");
const {Chess}=require("chess.js");
const http=require("http");
const server=http.createServer(app);
const io=socket(server);
const chess=new Chess;
const players={};
let currentplayer='W';

app.set("view engine","ejs");
app.use(express.urlencoded(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
    res.render("index")
})

server.listen(3000,()=>{
    console.log("server is running at port 3000");
})
    