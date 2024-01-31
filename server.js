import express, { json } from "express";
import route from "./routes/route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = 5000;

var whitelist = [
  "https://n9csvcvb-3000.asse.devtunnels.ms",
  "https://4gh92pj3-3000.asse.devtunnels.ms",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(route);

app.listen(PORT, () => console.log("Server listening on port " + PORT));
