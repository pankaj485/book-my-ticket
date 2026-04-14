import cors from "cors";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { authRouter } from "./src/modules/auth/auth.route.mjs";
import {
  bookSeat,
  getSeats,
} from "./src/modules/booking/booking.controller.mjs";
import { validateUserAuth } from "./src/middlewares/auth.middleware.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

const app = new express();
app.use(cors());
app.use(express.json()); // to parse the incoming request body as JSON

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/auth", authRouter);

//get all seats
app.get("/seats", validateUserAuth, getSeats);

//book a seat give the seatId and your name
app.put("/:id/:name", validateUserAuth, bookSeat);

app.listen(port, () => console.log("Server starting on port: " + port));
