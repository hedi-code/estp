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
  origin: ['*', 
    'http://localhost:4200',
    'https://test.new.app.forumestp.fr', 
    'https://www.test.new.app.forumestp.fr',
    'http://test.new.app.forumestp.fr', 
    'http://www.test.new.app.forumestp.fr', 
    'https://www.new.app.forumestp.fr', 
    'https://new.app.forumestp.fr'  // Allow requests from this origin
  ], 
  credentials: true,  // Allow credentials (cookies) to be included in the request
};
  const env = process.env.NODE_ENV || 'development';

// Dynamically load corresponding .env file
dotenv.config({ path: `.env.${env}` });

console.log(`Loaded environment: ${env}`);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use('api/uploads', express.static('uploads'));


app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/entreprises", entrepriseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pack1", pack1Routes);

app.listen(3000, () => console.log("Server running on port 3000"));