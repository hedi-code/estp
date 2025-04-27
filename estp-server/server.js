const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const entrepriseRoutes = require("./routes/entrepriseRoutes");
const userRoutes = require("./routes/userRoutes")
const pack1Routes = require("./routes/pack1Routes")
const cors = require('cors');


dotenv.config();
const app = express();
const corsOptions = {
    origin: 'http://localhost:4200',  // Allow requests from this origin
    credentials: true,  // Allow credentials (cookies) to be included in the request
  };
  
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use('/uploads', express.static('uploads'));


app.use("/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/entreprises", entrepriseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pack1", pack1Routes);

app.listen(3000, () => console.log("Server running on port 3000"));