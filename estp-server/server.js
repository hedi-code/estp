const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const entrepriseRoutes = require("./routes/entrepriseRoutes");
const userRoutes = require("./routes/userRoutes")
const pack1Routes = require("./routes/pack1Routes")
const option1Routes = require("./routes/option1Routes")
const secteurRoutes = require("./routes/secteurRoutes")
const commande1Routes = require("./routes/commande1Routes");
const commande1OptionsRoutes = require("./routes/commande1OptionsRoutes");
const fileRoutes = require('./routes/fileRoutes'); // <- Import file routes



const cors = require('cors');


dotenv.config();
const app = express();
const corsOptions = {
  origin: ['*', 
    'http://localhost:4200',
    'https://test.app.forumestp.fr',
    'http://test.app.forumestp.fr',
    'https://www.test.app.forumestp.fr',
    'http://www.test.app.forumestp.fr',  // Allow requests from this origin
    'https://app.forumetp.fr',
    'http://app.forumetp.fr',
    'https://www.app.forumetp.fr',
    'http://www.app.forumetp.fr'  // Allow requests from this origin
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
app.use('/api/uploads', express.static('uploads'));


app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/entreprises", entrepriseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pack1", pack1Routes);
app.use("/api/option1", option1Routes);
app.use("/api/secteur", secteurRoutes);
app.use("/api/commande1", commande1Routes);
app.use("/api/commande1Options", commande1OptionsRoutes);
app.use('/api/upload', fileRoutes); // <- Use file routes under /api/files





app.listen(process.env.PORT || 3000, () => console.log("Server running on port 3000"));
