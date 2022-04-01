var Sequelize = require('sequelize');
var bcrypt = require('bycrypt');

const sequelize = new Sequelize('OurDatabase', 'root', 'password', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

// set up User table
var User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: sequelize.STRING,
        unique: true,
        allowNull: flase
    },
    password: {
        type: Sequelize.STRING,
        allowNull: flase
    }
});

User.beforeCreate((user, options) => {
    const salt =bycrypt.genSaltSync();
    user.password = bycrypt.hashSync(user.password, salt);
});

User.prototype.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

// create all defined tables in the specified database 
sequelize.sync()
    .then(() => console.log('useer tables has been created'))
    .catch(error => console.log('This error occured', error));

// export User module for other files
module.exports = User;
