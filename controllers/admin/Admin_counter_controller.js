const SessionService = require("../../services/SessionService");
const Sequelize = require("sequelize");
const logger = require("../../services/LoggingService");
let pagination = require("../../services/PaginationService");
let JwtService = require("../../services/JwtService");
const ValidationService = require("../../services/ValidationService");
const PermissionService = require("../../services/PermissionService");
const UploadService = require("../../services/UploadService");
const AuthService = require("../../services/AuthService");
const db = require("../../models");
const helpers = require("../../core/helpers");
const role = 1;
const app = require("express").Router();

app.get(
  "/admin/counter/",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    try {
      let session = req.session;
      let paginateListViewModel = require("../../view_models/users_admin_list_paginate_view_model");

      var viewModel = new paginateListViewModel(
        db.counter,
        "Counter",
        session.success,
        session.error,
        "/admin/counter"
      );

      const format = req.query.format ? req.query.format : "view";
      const direction = req.query.direction ? req.query.direction : "ASC";
      const per_page = req.query.per_page ? req.query.per_page : 10;
      let order_by = req.query.order_by
        ? req.query.order_by
        : viewModel.get_field_column()[0];
      let orderAssociations = [];
      viewModel.set_order_by(order_by);
      let joins = order_by.includes(".") ? order_by.split(".") : [];
      order_by = order_by.includes(".") ? joins[joins.length - 1] : order_by;
      if (joins.length > 0) {
        for (let i = joins.length - 1; i > 0; i--) {
          orderAssociations.push(`${joins[i - 1]}`);
        }
      }
      // Check for flash messages
      const flashMessageSuccess = req.flash("success");
      if (flashMessageSuccess && flashMessageSuccess.length > 0) {
        viewModel.success = flashMessageSuccess[0];
      }
      const flashMessageError = req.flash("error");
      if (flashMessageError && flashMessageError.length > 0) {
        viewModel.error = flashMessageError[0];
      }

      viewModel.set_id(req.query.id ? req.query.id : "");
      viewModel.set_credential_email(
        req.query.credential_email ? req.query.credential_email : ""
      );
      viewModel.set_first_name(
        req.query.first_name ? req.query.first_name : ""
      );
      viewModel.set_last_name(req.query.last_name ? req.query.last_name : "");

      let where = helpers.filterEmptyFields({
        id: viewModel.get_id(),
        first_name: viewModel.get_first_name(),
        last_name: viewModel.get_last_name(),
      });

      let associatedWhere = helpers.filterEmptyFields({
        email: viewModel.get_credential_email(),
      });
      const isAssociationRequired =
        Object.keys(associatedWhere).length > 0 ? true : false;

      const count = await db.user._count(where, [
        {
          model: db.credential,
          where: associatedWhere,
          required: isAssociationRequired,
          as: "credential",
        },
      ]);

      viewModel.set_total_rows(count);
      viewModel.set_per_page(+per_page);
      viewModel.set_page(+req.params.num);
      viewModel.set_query(req.query);
      viewModel.set_sort_base_url(`/admin/counter/`);
      viewModel.set_sort(direction);

      const list = await db.user.get_credential_paginated(
        db,
        associatedWhere,
        viewModel.get_page() - 1 < 0 ? 0 : viewModel.get_page(),
        viewModel.get_per_page(),
        where,
        order_by,
        direction,
        orderAssociations
      );

      viewModel.set_list(list);

      viewModel.credential = await db.credential;

      if (format == "csv") {
        const csv = viewModel.to_csv();
        return res
          .set({
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="export.csv"',
          })
          .send(csv);
      }

      // if (format != 'view') {
      //   res.json(viewModel.to_json());
      // } else {
      // }

      const { text, time } = req.body;
      console.log(text, time);

      return res.render("admin/counter", viewModel);
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/counter", viewModel);
    }
  }
);

app.post(
  "/admin/counter-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }
    const CounterAddViewModel = require("../../view_models/counter_admin_add_view_model");

    const viewModel = new CounterAddViewModel(
      db.counter,
      "Add Counter",
      "",
      "",
      "/admin/counter"
    );
    // viewModel.quizzes = await db.quiz.getAll();
    // viewModel.questions = await db.question.getAll();
    // viewModel.outputVariables = await db.output_variable.getAll();

    // // TODO use separate controller for image upload
    //  {{{upload_field_setter}}}

    const { text, time } = req.body;
    console.log(text, time);

    viewModel.form_fields = {
      ...viewModel.form_fields,
      text,
      time,
    };

    try {
      viewModel.session = req.session;

      const data = await db.counter.insert({
        text,
        time,
      });

      if (!data) {
        viewModel.error = "Something went wrong";
        return res.render("admin/counter", viewModel);
      }

      req.flash("success", "counter created successfully");
      return res.redirect("/admin/dashboard");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/counter", viewModel);
    }
  }
);

module.exports = app;
