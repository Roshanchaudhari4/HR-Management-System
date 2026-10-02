const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = authMiddleware;


// Request मधून Authorization header घेतला.
// Bearer <token> format check केला.
// JWT token verify केला.
// Token मधून:
// userId
// role
// घेतले.
// हे req.user मध्ये ठेवले.
// Token valid असेल तर next() करून पुढच्या controller कडे request पाठवली.
// Token missing/invalid/expired असेल तर 401 response दिला.


// req mahnje login zalywar ek token genrat hoto to to proteted api sathi use hoto ya file madhe maily token valid ahe ka user kon ahe hech check hote jar token invalid kiva exxpired asel t 401 response send hoto 