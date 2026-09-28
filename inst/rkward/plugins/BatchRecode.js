// this code was generated using the rkwarddev package.
// perhaps don't make changes here, but in the rkwarddev script instead!

function preview(){
	
    function getCol(id) {
        var raw = getValue(id);
        if (!raw) return [];
        return raw.split("\n").filter(function(n){ return n != "" }).map(function(item) {
            if (item.indexOf("[[") > -1) {
                var m = item.match(/\[\[\"(.*?)\"\]\]/);
                return m ? m[1] : item;
            } else if (item.indexOf("$") > -1) {
                return item.substring(item.lastIndexOf("$") + 1);
            }
            return item;
        });
    }

    function getDfName(raw_vars_string) {
        if (!raw_vars_string) return "";
        var first_var = raw_vars_string.split("\n")[0];
        if (first_var.indexOf("[[") > -1) {
            return first_var.substring(0, first_var.indexOf("[["));
        } else if (first_var.indexOf("$") > -1) {
            return first_var.split("$")[0];
        } else {
            return first_var;
        }
    }
  
      var vars = getCol("vars_rc");
      if (vars.length === 0) return;

      // Aplicar backticks a todas las variables para evitar errores con símbolos como $
      var safe_vars = vars.map(function(v) { return "\`" + v + "\`"; });

      var raw_vars = getValue("vars_rc");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      
      echo("require(dplyr)\n");
      safe_vars = safe_vars.slice(0, 1);
      input_df = df_name + " %>% head(50)";
      

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
             var is_na_lhs = (lhs === "NA" || lhs === "NA_character_");
             if (!is_na_lhs && !lhs.startsWith("\"") && !lhs.startsWith("\'")) lhs = "\"" + lhs + "\"";
          }

          if (out_type == "character") {
             if (rhs === "NA") rhs = "NA_character_";
             var is_na_rhs = (rhs === "NA_character_" || rhs === "NA_real_" || rhs === "NA_integer_");
             if (!is_na_rhs && !rhs.startsWith("\"") && !rhs.startsWith("\'")) {
                 rhs = "\"" + rhs + "\"";
             }
          }
          args.push(lhs + " ~ " + rhs);
      }

      if (else_mode == "copy") {
          if (out_type == "character") {
             args.push(".default = as.character(.)");
          } else {
             args.push(".default = .");
          }
      }
      else if (else_mode == "na") { args.push(".default = NA"); }
      else if (else_mode == "specific") {
          var def_val = else_custom;
          if (out_type == "character" && def_val != "NA" && def_val != "NA_character_" && !def_val.startsWith("\"")) {
              def_val = "\"" + def_val + "\"";
          }
          args.push(".default = " + def_val);
      }

      var match_args = args.join(", ");
      var name_arg = (suffix == "") ? "" : ", .names = \"{.col}" + suffix + "\"";

      var input_wrapper = ".";
      if (in_type == "character") {
          input_wrapper = "as.character(.)";
      }

      var input_wrapper = ".";
      if (in_type == "character") {
          input_wrapper = "as.character(.)";
      }

      var func_call = "dplyr::case_match(" + input_wrapper + ", " + match_args + ")";
      if (as_fac == "1") { func_call = "as.factor(" + func_call + ")"; }

      var final_formula = "~ { .res <- " + func_call + "; attr(.res, \"label\") <- attr(., \"label\"); attr(.res, \".rk.meta\") <- attr(., \".rk.meta\"); .res }";

      
      echo("preview_data <- " + input_df + " %>% dplyr::mutate(dplyr::across(c(" + safe_vars.join(", ") + "), " + final_formula + name_arg + "))\n");
      
}

function preprocess(is_preview){
	// add requirements etc. here
	if(is_preview) {
		echo("if(!base::require(dplyr)){stop(" + i18n("Preview not available, because package dplyr is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(dplyr)\n");
	}
}

function calculate(is_preview){
	// read in variables from dialog


	// the R code to be evaluated

    function getCol(id) {
        var raw = getValue(id);
        if (!raw) return [];
        return raw.split("\n").filter(function(n){ return n != "" }).map(function(item) {
            if (item.indexOf("[[") > -1) {
                var m = item.match(/\[\[\"(.*?)\"\]\]/);
                return m ? m[1] : item;
            } else if (item.indexOf("$") > -1) {
                return item.substring(item.lastIndexOf("$") + 1);
            }
            return item;
        });
    }

    function getDfName(raw_vars_string) {
        if (!raw_vars_string) return "";
        var first_var = raw_vars_string.split("\n")[0];
        if (first_var.indexOf("[[") > -1) {
            return first_var.substring(0, first_var.indexOf("[["));
        } else if (first_var.indexOf("$") > -1) {
            return first_var.split("$")[0];
        } else {
            return first_var;
        }
    }
  
      var vars = getCol("vars_rc");
      if (vars.length === 0) return;

      // Aplicar backticks a todas las variables para evitar errores con símbolos como $
      var safe_vars = vars.map(function(v) { return "\`" + v + "\`"; });

      var raw_vars = getValue("vars_rc");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      

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
             var is_na_lhs = (lhs === "NA" || lhs === "NA_character_");
             if (!is_na_lhs && !lhs.startsWith("\"") && !lhs.startsWith("\'")) lhs = "\"" + lhs + "\"";
          }

          if (out_type == "character") {
             if (rhs === "NA") rhs = "NA_character_";
             var is_na_rhs = (rhs === "NA_character_" || rhs === "NA_real_" || rhs === "NA_integer_");
             if (!is_na_rhs && !rhs.startsWith("\"") && !rhs.startsWith("\'")) {
                 rhs = "\"" + rhs + "\"";
             }
          }
          args.push(lhs + " ~ " + rhs);
      }

      if (else_mode == "copy") {
          if (out_type == "character") {
             args.push(".default = as.character(.)");
          } else {
             args.push(".default = .");
          }
      }
      else if (else_mode == "na") { args.push(".default = NA"); }
      else if (else_mode == "specific") {
          var def_val = else_custom;
          if (out_type == "character" && def_val != "NA" && def_val != "NA_character_" && !def_val.startsWith("\"")) {
              def_val = "\"" + def_val + "\"";
          }
          args.push(".default = " + def_val);
      }

      var match_args = args.join(", ");
      var name_arg = (suffix == "") ? "" : ", .names = \"{.col}" + suffix + "\"";

      var input_wrapper = ".";
      if (in_type == "character") {
          input_wrapper = "as.character(.)";
      }

      var input_wrapper = ".";
      if (in_type == "character") {
          input_wrapper = "as.character(.)";
      }

      var func_call = "dplyr::case_match(" + input_wrapper + ", " + match_args + ")";
      if (as_fac == "1") { func_call = "as.factor(" + func_call + ")"; }

      var final_formula = "~ { .res <- " + func_call + "; attr(.res, \"label\") <- attr(., \"label\"); attr(.res, \".rk.meta\") <- attr(., \".rk.meta\"); .res }";

      
      echo("data_rec <- " + input_df + " %>% dplyr::mutate(dplyr::across(c(" + safe_vars.join(", ") + "), " + final_formula + name_arg + "))\n");
      
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Batch Recode results")).print();	
	}
    if(getValue("save_rc.active")) {
      var save_name = getValue("save_rc").replace(/"/g, "\\\"");
      echo("rk.header(\"Recoded Variables Created in: " + save_name + "\", level=3, toc=FALSE)\n");
    }
  
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var saveRc = getValue("save_rc");
		var saveRcActive = getValue("save_rc.active");
		var saveRcParent = getValue("save_rc.parent");
		// assign object to chosen environment
		if(saveRcActive) {
			echo(".GlobalEnv$" + saveRc + " <- data_rec\n");
		}	
	}

}

