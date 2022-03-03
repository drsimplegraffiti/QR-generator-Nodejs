require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const useRouter = require("./routes/userRoute");
const path = require("path");

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
const app = express();

app.use(express.json());
app.use("/api", useRouter);
app.get("/", (req, res) => {
  return res.status(200).json({
    msg: "home",
  });
});

app.use(
  "/api-doc",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJsDoc(swaggerSpec))
);

// server listening
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
