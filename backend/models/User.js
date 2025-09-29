module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'dark',
      validate: {
        isIn: [[ 'dark', 'light' ]],
      },
    },
    backgroundUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return User;
};
