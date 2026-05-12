import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
dotenv.config();

//middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({}));

//Test route
app.get("/", (req, res) => {
    res.json({"message": "ChefAI is working!"});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`environment: ${process.env.NODE_ENV || 'development'}`);
});

