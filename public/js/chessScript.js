const socket = io();
socket.emit("xyz");

socket.on("somthing",()=>{
    console.log("somthing is recivied")
});