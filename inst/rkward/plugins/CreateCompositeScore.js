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
  
      var vars = getCol("vars_cp");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_cp");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      
      echo("require(dplyr)\n");
      input_df = df_name + " %>% head(50)";
      

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
      
      
      echo("preview_data <- " + input_df + " %>% dplyr::mutate(" + newname + " = " + calc_code + ")\n");
      
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
  
      var vars = getCol("vars_cp");
      if (vars.length === 0) return;
      var raw_vars = getValue("vars_cp");
      var df_name = getDfName(raw_vars);
      var input_df = df_name;

      

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
      
      
      if (append == "1") {
          echo(save_name + " <- " + input_df + " %>% dplyr::mutate(" + newname + " = " + calc_code + ")\n");
      } else {
          echo(save_name + " <- " + input_df + " %>% dplyr::transmute(" + newname + " = " + calc_code + ")\n");
      }
      
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Create Composite Score results")).print();	
	}
    if(getValue("save_cp.active")) { 
      var save_name = getValue("save_cp").replace(/"/g, "\\\"");
      echo("rk.header(\"Composite Score Created: " + getValue("name_cp") + "\", level=3, toc=FALSE)\n"); 
    }
  
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var saveCp = getValue("save_cp");
		var saveCpActive = getValue("save_cp.active");
		var saveCpParent = getValue("save_cp.parent");
		// assign object to chosen environment
		if(saveCpActive) {
			echo(".GlobalEnv$" + saveCp + " <- data_score\n");
		}	
	}

}

