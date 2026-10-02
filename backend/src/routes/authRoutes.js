const express = require("express");
const { login } = require("../controllers/authController");
const { validateLogin } = require("../validators/authValidator");

const router = express.Router();

router.post("/login", validateLogin, login);

module.exports = router;



// flow - samja user ne login karyla mail id passworrd takle mang jevha login requiest yeil tevha authRoutes.js file madhhun validataeLogin call hoil mahnje authValidator.js yete imput valid ahe ka nahi check krel mahnje email password etc jar barobar asel t authcontroller call hoil ani tithun user ne delele email id password aapan geu  mang mongodvb madhe aapan check krto ki tya mail cha user ahe ka nahi jar asel tar tyche acc active ahe ka nahi check krte ani aapan database madhe passowrd plain text madhe tevt nahi hash krun tevto tysathi bycrypt use krto jar passord and mail correct asel t jwt token generate hhote (authController.js) madhe jwt ch logic ahe ani jwt secret env madhun yete mang jar succssfull login zale t {
//   "success": true,
//   "message": "Login successful",
//   "data": {
//     "token": "JWT_TOKEN_HERE",
//     "user": {
//       "id": "...",
//       "name": "Roshan",
//       "email": "roshan@gmail.com",
//       "role": "Employee",
//       "status": "Active"
//     }
//   }
// } 
// asa response frontend la jato