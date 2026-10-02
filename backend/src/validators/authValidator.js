const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  next();
};

module.exports = {
  validateLogin,
};


// email required ahe ka check kele passowrd reqire ahe ka email format validate kela