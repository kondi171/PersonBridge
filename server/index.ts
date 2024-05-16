import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import cluster from 'cluster';
import { cpus } from 'os';

import authenticationRoutes from "./routes/authentication.routes";
import accessRoutes from "./routes/access.routes";
import chatRoutes from "./routes/chat.routes";
import peopleRoutes from "./routes/people.routes";
import exploreRoutes from "./routes/explore.routes";
import settingsRoutes from "./routes/settings.routes";

import startSocketServer from "./middlewares/websocket.middleware";

// const numCPUs = cpus().length;
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 4616;
const app = express();

const username: string = "WebKing";
const password: string = "gJKkzxRt1toy7TCr";
const clusterURL: string = "cluster0.niyeq92";
const dbname: string = "PersonBridge";

mongoose.connect(`mongodb+srv://${username}:${password}@${clusterURL}.mongodb.net/${dbname}`);

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
app.use('/resources/avatars', express.static('resources/avatars', {
  setHeaders: function (res, path) {
    res.set('Cache-Control', 'no-cache');
  }
}));

// Session configuration
app.use(session({
  secret: '61dc8cfcaee2ff7da7203c4aec19d6c509f9fe16bb23d2b44ae1cced5591e767',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://${username}:${password}@${clusterURL}.mongodb.net/${dbname}`
  }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(authenticationRoutes);
app.use(accessRoutes);
app.use(chatRoutes);
app.use(peopleRoutes);
app.use(exploreRoutes);
app.use(settingsRoutes);

const server = startSocketServer(app);

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
// }
