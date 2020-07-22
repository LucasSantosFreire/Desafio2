const { Model, DataTypes } = require("sequelize");
class Recipient extends Model {
    static init(connection) {
        super.init(
            {
                name: DataTypes.STRING,
                address: DataTypes.STRING,
                number: DataTypes.INTEGER,
                complement: DataTypes.STRING,
                state: DataTypes.STRING,
                city: DataTypes.STRING,
                cep: DataTypes.INTEGER,
            },

            {
                sequelize: connection,
            }
        );
    }
}

module.exports = Recipient;
