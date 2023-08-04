import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// LOGIN CHECKPOINT
const isLoggedIn = (req, res, next) => {
  const { token } = req.cookie;
  if (!token) {
    res.status(401).json({
      success: false,
      message: "not login in container",
    });
  }

  const userDetail = jwt.verify(token, process.env.JWT_SECRET);
  res.user = userDetail;

  next();
};

// AUTHARIZATION CHECKPOINT -> ADMIN
const autharizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const userControl = req.user.role;
    if (!roles.includes(userControl)) {
      res.status(400).send("Admin can change this action");
    }

    next();
  };

export { isLoggedIn, autharizedRoles };
