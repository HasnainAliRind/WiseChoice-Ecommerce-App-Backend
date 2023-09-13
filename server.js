const express = require("express")
const app = express();
const PORT = 5000
const cors = require('cors');
const path = require("path");

app.use(cors());
app.use(express.json());
app.use( "/" , require(path.join(__dirname , "router/route")))






app.listen(PORT,()=>console.log(`App is running at ${5000}`))