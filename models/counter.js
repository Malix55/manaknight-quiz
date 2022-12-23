/*Powered By: Manaknightdigital Inc. https://manaknightdigital.com/ Year: 2021*/
/**
 * Counter Model
 * @copyright 2021 Manaknightdigital Inc.
 * @link https://manaknightdigital.com
 * @license Proprietary Software licensing
 * @author Ryan Wong
 *
 */

const { intersection } = require("lodash");
const coreModel = require("./../core/models");

module.exports = (sequelize, DataTypes) => {
  const Counter = sequelize.define("counter", {
    text: DataTypes.TEXT,
    time: DataTypes.INTEGER,
  });

  coreModel.call(this, Counter);

  Counter._preCreateProcessing = function (data) {
    return data;
  };
  Counter._postCreateProcessing = function (data) {
    return data;
  };
  Counter._customCountingConditions = function (data) {
    return data;
  };

  Counter._filterAllowKeys = function (data) {
    let cleanData = {};
    let allowedFields = Counter.allowFields();
    allowedFields.push(Counter._primaryKey());

    for (const key in data) {
      if (allowedFields.includes(key)) {
        cleanData[key] = data[key];
      }
    }
    return cleanData;
  };

  Counter.timeDefaultMapping = function () {
    let results = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j++) {
        let hour = i < 10 ? "0".i : i;
        let min = j < 10 ? "0".j : j;
        results[i * 60 + j] = `${hour}:${min}`;
      }
    }
    return results;
  };

  Counter.allowFields = function () {
    return ["text", "time"];
  };

  Counter.labels = function () {
    return [TEXT, TIME];
  };

  Counter.validationRules = function () {
    return [
      ["text", "Text", "required"],
      ["time", "Time", "required"],
    ];
  };

  Counter.validationEditRules = function () {
    return [
      ["text", "Text", "required"],
      ["time", "Time", "required"],
    ];
  };

  Counter.intersection = function (fields) {
    if (fields) {
      return intersection(["text", "time"], Object.keys(fields));
    } else return [];
  };

  return Counter;
};
