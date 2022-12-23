"use strict";

/*Powered By: Manaknightdigital Inc. https://manaknightdigital.com/ Year: 2021*/
/**
 * Questions Add View Model
 *
 * @copyright 2021 Manaknightdigital Inc.
 * @link https://manaknightdigital.com
 * @license Proprietary Software licensing
 * @author Ryan Wong
 */

module.exports = function (
  entity,
  pageName = "",
  success,
  error,
  base_url = ""
) {
  this._entity = entity;
  this.session = null;

  this.success = success || null;
  this.error = error || null;

  this._base_url = base_url;

  this.get_page_name = () => pageName;

  this.endpoint = "/admin/counter";

  this.heading = "Add Counter";

  this.action = "/admin/counter-add";

  this.form_fields = {
    text: "",
    time: "",
  };

  this.type_mapping = function () {
    return this._entity.type_mapping();
  };

  this.target_mapping = function () {
    return this._entity.target_mapping();
  };

  this.note_type_mapping = function () {
    return this._entity.note_type_mapping();
  };

  return this;
};
