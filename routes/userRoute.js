const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QR = require("qrcode");
const User = require("../model/user");
const ConnectedDevice = require("../model/connectedDevice");
const QRCode = require("../model/qrCode");

/**
 * @swagger
 * /:
 *  get:
 *    summary: Home page
 *    requestBody:
 *      required: false
 *      content:
 *        application/json:
 *          schema:
 *           type: object
 *           $ref: ""
 *    responses:
 *      200:
 *        description: Home page
 */
router.get("/", (req, res) => {
  return res.status(200).json({
    msg: "Home page",
  });
});

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        first_name:
 *          type: string
 *          description: the user first name
 *        last_name:
 *          type: string
 *          description: the user last name
 *        email:
 *          type: string
 *          description: the user email
 *        password:
 *          type: string
 *          description: the user password
 *      required:
 *        - first_name
 *        - last_name
 *        - email
 *        - password
 *      example:
 *        first_name: Abayomi
 *        last_name:  Lucky
 *        password: add1289fd
 *        email: yomi@yopmail.com
 *
 */

/**
 * @swagger
 * /api/register:
 *  post:
 *    summary: Create a new user
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: "#/components/schemas/User"
 *    responses:
 *      201:
 *        description: new user created!
 */
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    // return new user
    res.status(201).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Server error");
  }
});

/**
 * @swagger
 * components:
 *  schemas:
 *    User_Login:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          description: the user email
 *        password:
 *          type: string
 *          description: the user password
 *      required:
 *        - email
 *        - password
 *      example:
 *        password: add1289fd
 *        email: yomi@yopmail.com
 *
 */

/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: Login a user
 *    tags: [User_Login]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: "#/components/schemas/User_Login"
 *    responses:
 *      201:
 *        description: login successful
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      return res.status(200).json({ token });
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
});

/**
 * @swagger
 * /api/users:
 *  get:
 *    summary: Get all users
 *    tags: [User]
 *    responses:
 *      200:
 *        description: Get all users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: "#/components/schemas/User"
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
});

/**
 * @swagger
 * /api/user/{id}:
 *  get:
 *    summary: Get specific user
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: the user id
 *    responses:
 *      200:
 *        description: Get a specific user
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: "#/components/schemas/User"
 *      404:
 *        description: user not found
 */
router.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    return res.status(200).json(user);
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
});

/**
 * @swagger
 * /api/user/{id}:
 *  delete:
 *    summary: Delete specific user
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: the user id
 *    responses:
 *      200:
 *        description: user deleted
 *      404:
 *        description: user not found
 */
router.delete("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    return res.status(200).json(user);
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
});

/**
 * @swagger
 * /api/user/{id}:
 *  put:
 *    summary: Update specific user
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: the user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: "#/components/schemas/User"
 *    responses:
 *      200:
 *        description: user updated
 *      404:
 *        description: user not found
 */
router.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;

    const updateUser = await User.updateOne(
      { _id: id },
      { $set: { first_name, last_name, email }, new: true }
    );
    return res.status(200).json(updateUser);
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong",
    });
  }
});

router.post("/qr/generate", async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate user input
    if (!userId) {
      res.status(400).send("User Id is required");
    }

    const user = await User.findById(userId);

    // Validate is user exist
    if (!user) {
      res.status(400).send("User not found");
    }

    const qrExist = await QRCode.findOne({ userId });

    // If qr exist, update disable to true and then create a new qr record
    if (!qrExist) {
      await QRCode.create({ userId });
    } else {
      await QRCode.findOneAndUpdate({ userId }, { $set: { disabled: true } });
      await QRCode.create({ userId });
    }

    // Generate encrypted data
    const encryptedData = jwt.sign(
      { userId: user._id },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1d",
      }
    );

    // Generate qr code
    const dataImage = await QR.toDataURL(encryptedData);

    // Return qr code
    return res.status(200).json({ dataImage });
  } catch (err) {
    console.log(err);
  }
});

router.post("/qr/scan", async (req, res) => {
  try {
    const { token, deviceInformation } = req.body;

    if (!token && !deviceInformation) {
      res.status(400).send("Token and deviceInformation is required");
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const qrCode = await QRCode.findOne({
      userId: decoded.userId,
      disabled: false,
    });

    if (!qrCode) {
      res.status(400).send("QR Code not found");
    }

    const connectedDeviceData = {
      userId: decoded.userId,
      qrCodeId: qrCode._id,
      deviceName: deviceInformation.deviceName,
      deviceModel: deviceInformation.deviceModel,
      deviceOS: deviceInformation.deviceOS,
      deviceVersion: deviceInformation.deviceVersion,
    };

    const connectedDevice = await ConnectedDevice.create(connectedDeviceData);

    // Update qr code
    await QRCode.findOneAndUpdate(
      { _id: qrCode._id },
      {
        isActive: true,
        connectedDeviceId: connectedDevice._id,
        lastUsedDate: new Date(),
      }
    );

    // Find user
    const user = await User.findById(decoded.userId);

    // Create token
    const authToken = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    // Return token
    return res.status(200).json({ token: authToken });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
