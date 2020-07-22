const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
class User extends Model {
    static init(connection) {
        super.init(
            {
                name: DataTypes.STRING,
                email: DataTypes.STRING,
                password_hash: DataTypes.STRING,
                admin: DataTypes.BOOLEAN,
            },

            {
                sequelize: connection,
            }
        );
    }
}

module.exports = User;
