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
const emailRoutes = require('./routes/emailRoutes'); // <- Import file routes
const bookRoutes = require('./routes/bookRoutes'); // <- Import file routes
const commande2Routes = require('./routes/commande2Routes'); // <- Import commande2 routes
const commande2OptionsRoutes = require('./routes/commande2OptionsRoutes'); // <- Import commande2Options routes
const pack2Routes = require('./routes/pack2Routes'); // <- Import pack2 routes
const option2Routes = require('./routes/option2Routes'); // <- Import option2 routes
const option2CategoriesRoutes = require('./routes/option2CategoriesRoutes'); // <- Import option2Categories routes
const dashboardRoutes = require('./routes/dashboardRoutes'); // <- Import dashboard routes
const exposantRoutes = require('./routes/exposantRoutes'); // <- Import exposant routes
const authMiddleware = require('./middleware/auth'); // <- Import JWT middleware



const cors = require('cors');


dotenv.config();
const app = express();
const corsOptions = {
  origin: [ 
    'http://localhost:4200',    
    'http://localhost:4201',
    'http://localhost:4300',
    'https://test.app.forumestp.fr',
    'http://test.app.forumestp.fr',
    'https://www.test.app.forumestp.fr',
    'http://www.test.app.forumestp.fr',
    'https://app.forumetp.fr',
    'http://app.forumetp.fr',
    'https://www.app.forumetp.fr',
    'http://www.app.forumetp.fr',
    'https://app.forumestp.fr',
    'https://www.app.forumestp.fr',
    'http://app.forumestp.fr',
    'http://www.app.forumestp.fr'

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
app.use('/api/email', emailRoutes); // <- Use file routes under /api/files
app.use('/api/book', bookRoutes); // <- Use file routes under /api/files
app.use('/api/commande2', commande2Routes); // <- Use commande2 routes
app.use('/api/commande2Options', commande2OptionsRoutes); // <- Use commande2Options routes
app.use('/api/pack2', pack2Routes); // <- Use pack2 routes
app.use('/api/option2', option2Routes); // <- Use option2 routes
app.use('/api/option2Categories', option2CategoriesRoutes); // <- Use option2Categories routes
app.use('/api/dashboard', dashboardRoutes); // <- Use dashboard routes
app.use('/api/exposants', exposantRoutes); // <- Use exposant routes





app.listen(process.env.PORT || 3000, () => console.log("Server running on port 3000"));
