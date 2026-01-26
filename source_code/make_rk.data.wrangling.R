local({
  # =========================================================================================
  # 1. Package Definition and Metadata
  # =========================================================================================
  require(rkwarddev)
  rkwarddev.required("0.08-1")

  plugin_name <- "rk.data.wrangling"
  plugin_ver <- "0.1.3"

  package_about <- rk.XML.about(
    name = plugin_name,
    author = person(
      given = "Alfonso",
      family = "Cano",
      email = "alfonso.cano@correo.buap.mx",
      role = c("aut", "cre")
    ),
    about = list(
      desc = "A suite of plugins for modern data manipulation using 'dplyr'. Includes batch transformations, recoding multiple variables, and creating composite scores.",
      version = plugin_ver,
      date = format(Sys.Date(), "%Y-%m-%d"),
      url = "https://github.com/AlfCano/rk.data.wrangling",
      license = "GPL (>= 3)"
    )
  )

  # =========================================================================================
  # 2. JS Helpers
  # =========================================================================================

  js_common_helper <- '
    function getCol(id) {
        var raw = getValue(id);
        if (!raw) return [];
        return raw.split("\\n").filter(function(n){ return n != "" }).map(function(item) {
            if (item.indexOf("[[") > -1) {
                var m = item.match(/\\[\\[\\"(.*?)\\"\\]\\]/);
                return m ? m[1] : item;
            } else if (item.indexOf("$") > -1) {
                return item.substring(item.lastIndexOf("$") + 1);
            }
            return item;
        });
    }

    function getDfName(raw_vars_string) {
        if (!raw_vars_string) return "";
        var first_var = raw_vars_string.split("\\n")[0];
        if (first_var.indexOf("[[") > -1) {
            return first_var.substring(0, first_var.indexOf("[["));
        } else if (first_var.indexOf("$") > -1) {
            return first_var.split("$")[0];
        } else {
            return first_var;
        }
    }
  '

  # =========================================================================================
  # 3. Component A: Batch Transform
  # =========================================================================================
  tr_selector <- rk.XML.varselector(id.name = "sel_tr")
  tr_vars <- rk.XML.varslot(label = "Variables to transform", source = "sel_tr", multi = TRUE, required = TRUE, id.name = "vars_tr")
  tr_group <- rk.XML.varslot(label = "Grouping variable(s) (Optional)", source = "sel_tr", multi = TRUE, id.name = "vars_group_tr")

  tr_func_drop <- rk.XML.dropdown(label = "Function", id.name = "func_tr", options = list(
      "Logarithm (log)" = list(val = "log", chk = TRUE),
      "Log10 (log10)" = list(val = "log10"),
      "Exponential (exp)" = list(val = "exp"),
      "Square Root (sqrt)" = list(val = "sqrt"),
      "Abs (abs)" = list(val = "abs"),
      "Standardize (scale)" = list(val = "scale"),
      "Mean (mean)" = list(val = "mean"),
      "Median (median)" = list(val = "median"),
      "Sum (sum)" = list(val = "sum"),
      "Standard Deviation (sd)" = list(val = "sd"),
      "Variance (var)" = list(val = "var"),
      "Min (min)" = list(val = "min"),
      "Max (max)" = list(val = "max"),
      "Convert to Numeric" = list(val = "as.numeric"),
      "Convert to Factor" = list(val = "as.factor"),
      "Custom..." = list(val = "custom")
  ))
  tr_narm <- rk.XML.cbox(label = "Ignore NAs (na.rm = TRUE)", value = "1", chk = TRUE, id.name = "tr_narm_cbox")
  tr_cust_input <- rk.XML.input(label = "Custom function (e.g., function(x) x^2)", id.name = "func_cust")
  attr(tr_cust_input, "dependencies") <- list(active = list(string = "func_tr.string == 'custom'"))

  tr_naming <- rk.XML.input(label = "Naming pattern (glue syntax)", initial = "{.col}_{.fn}", id.name = "names_tr")
  tr_help_label <- rk.XML.text("Use <b>{.col}</b> for original name and <b>{.fn}</b> for function name.<br>Leave empty to overwrite original variables.")

  tr_append <- rk.XML.cbox(label = "Append to original dataset (mutate)", value = "1", chk = TRUE, id.name = "tr_append")

  tr_save <- rk.XML.saveobj(label="Save to (overwrite or new object)", initial="data_tr", chk=TRUE, id.name="save_tr")
  tr_preview <- rk.XML.preview(label="Preview data", id.name="preview_tr", mode="data")
  tr_preview_note <- rk.XML.text("<i>Note: Preview limited to the first selected variable and 50 rows.<br><b>Warning:</b> Aggregation functions (sum, mean) in preview will only reflect the 50 sampled rows, not the full dataset.</i>")

  tr_dialog <- rk.XML.dialog(label = "Batch Transform Variables", child = rk.XML.tabbook(tabs = list(
      "Variable Selection" = rk.XML.row(
          rk.XML.col(tr_selector),
          rk.XML.col(tr_vars, rk.XML.stretch(), rk.XML.frame(tr_group, label = "Grouped Calculation"))
      ),
      "Transformation" = rk.XML.col(tr_func_drop, tr_narm, tr_cust_input, rk.XML.stretch()),
      "Output Options" = rk.XML.col(tr_naming, tr_help_label, tr_append, rk.XML.stretch(), tr_preview, tr_preview_note, tr_save)
  )))

  js_gen_tr <- function(is_preview) {
    paste0(js_common_helper, '
      var vars = getCol("vars_tr");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_tr");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      ', if(is_preview) '
      echo("require(dplyr)\\n");
      vars = vars.slice(0, 1);
      input_df = df_name + " %>% head(50)";
      ', '

      var func = getValue("func_tr");
      var func_cust = getValue("func_cust");
      var use_na_rm = getValue("tr_narm_cbox") == "1";
      var naming = getValue("names_tr");
      var groups = getCol("vars_group_tr");
      var append = getValue("tr_append");
      var dplyr_verb = (append == "1") ? "mutate" : "transmute";

      var group_start = "";
      var group_end = "";
      if (groups.length > 0) {
          group_start = " %>% dplyr::group_by(" + groups.join(", ") + ")";
          group_end = " %>% dplyr::ungroup()";
      }

      var fn_call = "";
      if (func == "custom") {
          fn_call = func_cust;
      } else {
          if (use_na_rm && ["mean","median","sum","sd","var","min","max"].indexOf(func) > -1) {
             fn_call = "list(" + func + " = ~ " + func + "(., na.rm = TRUE))";
          } else {
             fn_call = func;
          }
      }
      var name_arg = (naming == "") ? "" : ", .names = \\"" + naming + "\\"";

      ', if(is_preview) '
      echo("preview_data <- " + input_df + group_start + " %>% dplyr::" + dplyr_verb + "(dplyr::across(c(" + vars.join(", ") + "), " + fn_call + name_arg + "))" + group_end + "\\n");
      ' else '
      echo("data_tr <- " + input_df + group_start + " %>% dplyr::" + dplyr_verb + "(dplyr::across(c(" + vars.join(", ") + "), " + fn_call + name_arg + "))" + group_end + "\\n");
      '
    )
  }
  js_print_tr <- 'if(getValue("save_tr.active")) { echo("rk.header(\\"Batch Transform Created: " + getValue("save_tr") + "\\", level=3, toc=FALSE)\\n"); }'

  # =========================================================================================
  # 4. Component B: Batch Recode
  # =========================================================================================
  rc_selector <- rk.XML.varselector(id.name = "sel_rc")
  rc_vars <- rk.XML.varslot(label = "Variables to recode", source = "sel_rc", multi = TRUE, required = TRUE, id.name = "vars_rc")

  rc_matrix <- rk.XML.matrix(label = "Mapping Rules", id.name = "matrix_rules", columns = 2, min = 0, horiz_headers = c("Old Value", "New Value"), mode = "string")

  rc_in_type <- rk.XML.dropdown(label = "Input Data Type (Old Value)", id.name = "type_rc_in", options = list("Numeric / Integer" = list(val = "numeric", chk = TRUE), "Character / Factor" = list(val = "character")))
  rc_else_radio <- rk.XML.radio(label = "Unmatched values (Else)", id.name = "rad_else_mode", options = list("Copy original values (Default)" = list(val = "copy", chk = TRUE), "Set to NA" = list(val = "na"), "Specific value..." = list(val = "specific")))
  rc_else_custom <- rk.XML.input(label = "Value", id.name = "inp_else_custom", initial = "Other")
  attr(rc_else_custom, "dependencies") <- list(active = list(string = "rad_else_mode.string == 'specific'"))

  rc_out_type <- rk.XML.dropdown(label = "Output Data Type (New Value)", id.name = "type_rc_out", options = list("Numeric / Integer" = list(val = "numeric"), "Character / Factor" = list(val = "character", chk = TRUE)))
  rc_suffix <- rk.XML.input(label = "Suffix", id.name = "suffix_rc", initial = "_rec")
  rc_as_factor <- rk.XML.cbox(label = "Convert output to factor", id.name = "as_factor_rc", value = "1", chk=TRUE)

  rc_save <- rk.XML.saveobj(label="Save result object", initial="data_rec", chk=TRUE, id.name="save_rc")
  rc_preview <- rk.XML.preview(label="Preview data", id.name="preview_rc", mode="data")
  rc_preview_note <- rk.XML.text("<i>Note: Preview limited to the first selected variable and 50 rows.</i>")

  rc_dialog <- rk.XML.dialog(label = "Batch Recode Variables", child = rk.XML.tabbook(tabs = list(
      "Variable Selection" = rk.XML.row(rk.XML.col(rc_selector), rk.XML.col(rc_vars, rk.XML.stretch())),
      "Recode Rules" = rk.XML.col(rc_in_type, rc_matrix, rk.XML.frame(rc_else_radio, rc_else_custom, label="Default Behavior")),
      "Output Options" = rk.XML.col(rc_out_type, rc_suffix, rc_as_factor, rk.XML.stretch(), rc_preview, rc_preview_note, rc_save)
  )))

  js_gen_rc <- function(is_preview) {
    paste0(js_common_helper, '
      var vars = getCol("vars_rc");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_rc");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      ', if(is_preview) '
      echo("require(dplyr)\\n");
      vars = vars.slice(0, 1);
      input_df = df_name + " %>% head(50)";
      ', '

      var in_type = getValue("type_rc_in");
      var out_type = getValue("type_rc_out");
      var suffix = getValue("suffix_rc");
      var as_fac = getValue("as_factor_rc");
      var else_mode = getValue("rad_else_mode");
      var else_custom = getValue("inp_else_custom");
      var save_name = getValue("save_rc");

      var olds = getList("matrix_rules.0");
      var news = getList("matrix_rules.1");
      var args = [];

      for (var i = 0; i < olds.length; i++) {
          var lhs = String(olds[i]).trim();
          var rhs = String(news[i]).trim();
          if (lhs === "" || rhs === "") continue;

          if (in_type == "character") {
             if (lhs != "NA" && !lhs.startsWith("\\"") && !lhs.startsWith("\\\'")) lhs = "\\"" + lhs + "\\"";
          }
          if (out_type == "character") {
             if (rhs != "NA" && !rhs.startsWith("\\"") && !rhs.startsWith("\\\'")) rhs = "\\"" + rhs + "\\"";
          }
          args.push(lhs + " ~ " + rhs);
      }

      if (else_mode == "copy") {
          if (in_type == out_type) {
             args.push(".default = .");
          } else {
             if (out_type == "character") args.push(".default = as.character(.)");
             else args.push(".default = as.numeric(.)");
          }
      }
      else if (else_mode == "na") { args.push(".default = NA"); }
      else if (else_mode == "specific") {
          var def_val = else_custom;
          if (out_type == "character" && def_val != "NA" && !def_val.startsWith("\\"")) { def_val = "\\"" + def_val + "\\""; }
          args.push(".default = " + def_val);
      }

      var match_args = args.join(", ");
      var name_arg = (suffix == "") ? "" : ", .names = \\"{.col}" + suffix + "\\"";

      // FIX: Check for Input Type. If Character, wrap input in as.character(.)
      var input_wrapper = ".";
      if (in_type == "character") {
          input_wrapper = "as.character(.)";
      }

      var func_call = "dplyr::case_match(" + input_wrapper + ", " + match_args + ")";
      if (as_fac == "1") { func_call = "as.factor(" + func_call + ")"; }

      ', if(is_preview) '
      echo("preview_data <- " + input_df + " %>% dplyr::mutate(dplyr::across(c(" + vars.join(", ") + "), ~ " + func_call + name_arg + "))\\n");
      ' else '
      echo("data_rec <- " + input_df + " %>% dplyr::mutate(dplyr::across(c(" + vars.join(", ") + "), ~ " + func_call + name_arg + "))\\n");
      '
    )
  }

  js_print_rc <- '
    if(getValue("save_rc.active")) {
      var save_name = getValue("save_rc").replace(/"/g, "\\\\\\"");
      echo("rk.header(\\"Recoded Variables Created in: " + save_name + "\\", level=3, toc=FALSE)\\n");
    }
  '

  # =========================================================================================
  # 5. Component C: Composite Score
  # =========================================================================================
  cp_selector <- rk.XML.varselector(id.name = "sel_cp")
  cp_vars <- rk.XML.varslot(label = "Items to aggregate", source = "sel_cp", multi = TRUE, required = TRUE, id.name = "vars_cp")
  cp_method <- rk.XML.dropdown(label = "Aggregation Method", id.name = "method_cp", options = list("Mean (Average)" = list(val = "rowMeans", chk = TRUE), "Sum (Total)" = list(val = "rowSums"), "Median" = list(val = "median"), "Minimum" = list(val = "pmin"), "Maximum" = list(val = "pmax"), "Standard Deviation (SD)" = list(val = "sd"), "Variance" = list(val = "var"), "Count (N valid)" = list(val = "count")))
  cp_na <- rk.XML.cbox(label = "Remove NAs (na.rm = TRUE)", value = "1", chk = TRUE, id.name = "na_cp")
  cp_newname <- rk.XML.input(label = "Name of new variable", initial = "new_score", required = TRUE, id.name = "name_cp")
  cp_append <- rk.XML.cbox(label = "Append to original dataset", value = "1", chk = TRUE, id.name = "append_cp")

  cp_save <- rk.XML.saveobj(label="Save result as", initial="data_score", chk=TRUE, id.name="save_cp")
  cp_preview <- rk.XML.preview(label="Preview data", id.name="preview_cp", mode="data")
  cp_preview_note <- rk.XML.text("<i>Note: Preview limited to 50 rows.</i>")

  cp_dialog <- rk.XML.dialog(label = "Create Composite Score", child = rk.XML.tabbook(tabs = list(
      "Variable Selection" = rk.XML.row(rk.XML.col(cp_selector), rk.XML.col(cp_vars, rk.XML.stretch())),
      "Settings" = rk.XML.col(cp_method, cp_na, rk.XML.stretch()),
      "Output Options" = rk.XML.col(cp_newname, cp_append, rk.XML.stretch(), cp_preview, cp_preview_note, cp_save)
  )))

  js_gen_cp <- function(is_preview) {
    paste0(js_common_helper, '
      var vars = getCol("vars_cp");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_cp");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      ', if(is_preview) '
      echo("require(dplyr)\\n");
      input_df = df_name + " %>% head(50)";
      ', '

      var method = getValue("method_cp");
      var newname = getValue("name_cp");
      var use_na = getValue("na_cp") == "1";
      var na_arg = use_na ? "TRUE" : "FALSE";
      var append = getValue("append_cp");
      var vars_str = "dplyr::pick(c(" + vars.join(", ") + "))";
      var calc_code = "";
      var save_name = getValue("save_cp");

      if (method == "rowMeans") { calc_code = "rowMeans(" + vars_str + ", na.rm = " + na_arg + ")"; }
      else if (method == "rowSums") { calc_code = "rowSums(" + vars_str + ", na.rm = " + na_arg + ")"; }
      else if (method == "pmin") { calc_code = "do.call(pmin, c(" + vars_str + ", list(na.rm = " + na_arg + ")))"; }
      else if (method == "pmax") { calc_code = "do.call(pmax, c(" + vars_str + ", list(na.rm = " + na_arg + ")))"; }
      else if (method == "sd") { calc_code = "apply(" + vars_str + ", 1, sd, na.rm = " + na_arg + ")"; }
      else if (method == "median") { calc_code = "apply(" + vars_str + ", 1, median, na.rm = " + na_arg + ")"; }
      else if (method == "var") { calc_code = "apply(" + vars_str + ", 1, var, na.rm = " + na_arg + ")"; }
      else if (method == "count") { calc_code = "rowSums(!is.na(" + vars_str + "))"; }

      ', if(is_preview) '
      echo("preview_data <- " + input_df + " %>% dplyr::mutate(" + newname + " = " + calc_code + ")\\n");
      ' else '
      if (append == "1") {
          echo("data_score <- " + input_df + " %>% dplyr::mutate(" + newname + " = " + calc_code + ")\\n");
      } else {
          echo("data_score <- " + input_df + " %>% dplyr::transmute(" + newname + " = " + calc_code + ")\\n");
      }
      '
    )
  }

  js_print_cp <- '
    if(getValue("save_cp.active")) {
      var save_name = getValue("save_cp").replace(/"/g, "\\\\\\"");
      echo("rk.header(\\"Composite Score Created: " + save_name + "\\", level=3, toc=FALSE)\\n");
    }
  '

  # =========================================================================================
  # 6. Final Skeleton Generation
  # =========================================================================================

  comp_recode <- rk.plugin.component("Batch Recode", xml = list(dialog = rc_dialog), js = list(require = c("dplyr"), calculate = js_gen_rc(FALSE), preview = js_gen_rc(TRUE), printout = js_print_rc), hierarchy = list("data", "Data Wrangling"), rkh = list(summary = rk.rkh.summary("Recode multiple variables using a grid of Old/New values.")))
  comp_composite <- rk.plugin.component("Create Composite Score", xml = list(dialog = cp_dialog), js = list(require = c("dplyr"), calculate = js_gen_cp(FALSE), preview = js_gen_cp(TRUE), printout = js_print_cp), hierarchy = list("data", "Data Wrangling"), rkh = list(summary = rk.rkh.summary("Calculate row-wise scores (Mean/Sum) from multiple variables.")))

  rk.plugin.skeleton(
    about = package_about,
    path = ".",
    xml = list(dialog = tr_dialog),
    js = list(calculate = js_gen_tr(FALSE), preview = js_gen_tr(TRUE), printout = js_print_tr),
    rkh = list(summary = rk.rkh.summary("Apply a function to multiple variables simultaneously using dplyr::across.")),
    pluginmap = list(name = "Batch Transform", hierarchy = list("data", "Data Wrangling")),
    components = list(comp_recode, comp_composite),
    create = c("pmap", "xml", "js", "desc", "rkh"),
    load = TRUE, overwrite = TRUE, show = FALSE
  )

  cat("\nPlugin 'rk.data.wrangling' (v0.1.3) generated successfully.\n")
})
