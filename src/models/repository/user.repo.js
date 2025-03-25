"use strict";

const User = require("../user.model");

const createUser = async ({
  user_id,
  user_name,
  user_email,
  user_password,
  user_role,
  user_status,
}) => {
  const user_slug = user_email.split("@")[0].toLowerCase();

  return await User.create({
    user_id,
    user_name,
    user_slug,
    user_email,
    user_password,
    user_role,
    user_status,
  });
};

module.exports = createUser;

// "use strict";

// const User = require("../user.model");

// const createUser = async ({
//   user_id,
//   user_name,
//   user_slug,
//   user_email,
//   user_password,
//   user_role,
//   user_phone = null,
//   user_sex = "male",
//   user_date_of_birth = null,
//   user_address = null,
// }) => {
//   return await User.create({
//     user_id,
//     user_name,
//     user_slug,
//     user_email,
//     user_password,
//     user_role,
//     user_phone,
//     user_sex,
//     user_date_of_birth,
//     user_address,
//   });
// };

// const findUserById = async (userId) => {
//   return await User.findById(userId)
//     .populate('user_role', 'role_name')
//     .lean();
// };

// module.exports = {
//   createUser,
//   findUserById
// };
