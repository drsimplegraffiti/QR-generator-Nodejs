require("dotenv").config();
var cookieParser = require("cookie-parser");
require("./config/database").connect();
const express = require("express");
const csrf = require("csurf");
const helmet = require("helmet");
const useRouter = require("./routes/userRoute");
const path = require("path");

const csrfProtection = csrf({ cookie: true });

const app = express();

//swagger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QR code Node Js",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4001",
      },
    ],
  },
  apis: [`${path.join(__dirname, "./routes/*.js")}`],
};
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.get("/", csrfProtection, (req, res) => {
  console.log("working");
  return res.status(200).json({
    msg: "home",
    csrfToken: req.csrfToken(),
  });
});
app.use("/api", useRouter);

app.use(
  "/api-doc",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJsDoc(swaggerSpec))
);

// server listening
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
