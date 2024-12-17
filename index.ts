import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import multer from "multer";
import helmet from "helmet";
import { Server } from "socket.io";
import http from "http";

import authRoutes from "./src/Routes/authroutes";
import postRoutes from "./src/Routes/postRoutes";
import friendsRoutes from "./src/Routes/friendsRoutes";
import profileRoutes from "./src/Routes/profileRoutes";
import verificationRoutes from "./src/Routes/verificationRoutes";
import { swaggerDocs, swaggerUi } from "./swagger";
import { connect } from "./src/database/database";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware";

dotenv.config();

//defined the port
const port = process.env.PORT || 5000;

connect();

const storage = multer.diskStorage({});
const upload = multer({
	storage: storage,
	limits: { fileSize: 50 * 1024 * 1024 },
});

//intialized the express app
const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);

//allows cross origin resource sharing CORS-
const corsOptions = {
    origin: '*', // Allow all origins
    methods: 'GET,POST,PUT,DELETE', // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("tiny"));
app.disable("x-powered-by");

//convertes all request to json format
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array("image"));

//SOCKET IO
io.on("connection", (socket) => {
	console.log("A user is connected", socket.id);

	socket.on("disconnect", () => {
		console.log("User disconnected", socket.id);
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/friend", friendsRoutes);
app.use("/api/", verificationRoutes);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(notFound);
app.use(errorHandler);

//constantly listening at port 5k
server.listen(port, () => console.log(`server started on port ${port}`));
