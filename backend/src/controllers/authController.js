const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          designation: user.designation,
          role: user.role,
          joiningDate: user.joiningDate,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};


// Email वरून User शोधतो. // select("+password") वापरून password temporarily घेतो. // User inactive असेल तर login block करतो. // bcrypt.compare() ने password verify करतो. // Successful login नंतर JWT token तयार करतो. // JWT मध्ये userId आणि role ठेवतो. // Token ची expiry 1 day आहे. // Response मध्ये password कधीही frontend ला पाठवत नाही. // Error असल्यास centralized errorHandler कडे पाठवतो. he file middleware madhe error.handler madhe 