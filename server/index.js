import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";

// CONFIGURATION 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginEmbedderPolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

// FILE STORAGE 
// https://www.mongodb.com/community/forums/t/storing-images-in-the-database/207

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/assets");
    }, 
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), register);


//ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);


// MONGOOSE SETUP
const dbUrl = process.env.ATLASDB_URL;
main()
.then(() => {
    console.log("Connect to Database");
}).catch((err) => console.log(`${err} did not connect`));

async function main() {
    await mongoose.connect(dbUrl)
}

//TESTING ROUTE 
const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server is listing to port ${port}`);
})

