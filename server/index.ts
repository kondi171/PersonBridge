import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import userRoutes from "./routes/users.routes";
import authenticationRoutes from "./routes/authentication.routes";
import accessRoutes from "./routes/access.routes";
import exploreRoutes from "./routes/explore.routes";

import startSocketServer from "./middlewares/websocket.middleware";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const app = express();

const username: string = "WebKing";
const password: string = "gJKkzxRt1toy7TCr";
const cluster: string = "cluster0.niyeq92";
const dbname: string = "PersonBridge";

mongoose.connect(`mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}`);

const db = mongoose.connection;
const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true,
};

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(express.json({ limit: '50mb' }));
app.use(cors(corsOptions));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
}));

// Session configuration
app.use(session({
  secret: '61dc8cfcaee2ff7da7203c4aec19d6c509f9fe16bb23d2b44ae1cced5591e767',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}`
  }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(userRoutes);
app.use(authenticationRoutes);
app.use(accessRoutes);
app.use(exploreRoutes);

const server = startSocketServer(app);

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
