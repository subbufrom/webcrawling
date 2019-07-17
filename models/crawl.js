'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Crawl', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    url: DataTypes.STRING,
    params: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    referenceCout: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  return Category;
};
