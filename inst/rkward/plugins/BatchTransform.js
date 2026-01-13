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
  
      var vars = getCol("vars_tr");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_tr");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      
      echo("require(dplyr)\n");
      vars = vars.slice(0, 1);
      input_df = df_name + " %>% head(50)";
      

      var func = getValue("func_tr");
      var func_cust = getValue("func_cust");
      var use_na_rm = getValue("tr_narm_cbox") == "1";
      var naming = getValue("names_tr");
      var groups = getCol("vars_group_tr");

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
      var name_arg = (naming == "") ? "" : ", .names = \"" + naming + "\"";
      var save_name = getValue("save_tr");

      
      echo("preview_data <- " + input_df + group_start + " %>% dplyr::mutate(dplyr::across(c(" + vars.join(", ") + "), " + fn_call + name_arg + "))" + group_end + "\n");
      
}

function preprocess(is_preview){
	// add requirements etc. here

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
  
      var vars = getCol("vars_tr");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_tr");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      

      var func = getValue("func_tr");
      var func_cust = getValue("func_cust");
      var use_na_rm = getValue("tr_narm_cbox") == "1";
      var naming = getValue("names_tr");
      var groups = getCol("vars_group_tr");

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
      var name_arg = (naming == "") ? "" : ", .names = \"" + naming + "\"";
      var save_name = getValue("save_tr");

      
      echo("data_tr <- " + input_df + group_start + " %>% dplyr::mutate(dplyr::across(c(" + vars.join(", ") + "), " + fn_call + name_arg + "))" + group_end + "\n");
      
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Batch Transform results")).print();	
	}
    if(getValue("save_tr.active")) {
      var save_name = getValue("save_tr").replace(/"/g, "\\\"");
      echo("rk.header(\"Batch Transform Created: " + save_name + "\", level=3, toc=FALSE)\n");
    }
  
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var saveTr = getValue("save_tr");
		var saveTrActive = getValue("save_tr.active");
		var saveTrParent = getValue("save_tr.parent");
		// assign object to chosen environment
		if(saveTrActive) {
			echo(".GlobalEnv$" + saveTr + " <- data_tr\n");
		}	
	}

}

