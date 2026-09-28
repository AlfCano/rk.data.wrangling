# rk.data.wrangling: Tidy Data Manipulation for RKWard

![Version](https://img.shields.io/badge/Version-0.1.5-blue.svg)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![RKWard](https://img.shields.io/badge/Platform-RKWard-green)
[![R Linter](https://github.com/AlfCano/rk.data.wrangling/actions/workflows/lintr.yml/badge.svg)](https://github.com/AlfCano/rk.data.wrangling/actions/workflows/lintr.yml)

**rk.data.wrangling** brings modern, "tidy" data manipulation tools to the RKWard GUI. It provides a user-friendly interface for the powerful `dplyr` package, allowing users to perform complex batch operations—transformations, recoding, and scoring—on multiple variables simultaneously without writing complex code.

## 🚀 What's New in Version 0.1.5

*   **Attribute & Label Preservation:** Fixed an issue where recoding or coercing variables to factors destroyed their metadata. The generated R code now uses a safe wrapper that automatically preserves `label` and `.rk.meta` attributes, ensuring your dataset remains properly documented within the RKWard environment.

## 🚀 What's New in Version 0.1.4

*   **Extreme Variable Name Safety:** Fixed a critical bug where variables containing reserved R symbols (like `$`, e.g., `filter_$`) would break the generated script. All variable names are now safely wrapped in backticks (`` ` ``) during code generation.
*   **Smart `NA` Handling in Recode:** The plugin now automatically detects `NA` text inputs and intelligently translates them to `NA_character_` when the output type is Character/Factor, preventing strict type-matching errors in `dplyr::case_match`.
*   **UI Enhancements:** Added explicit on-screen instructions in the Batch Recode dialog for setting missing values (fully translatable across all supported languages).

## 🚀 What's New in Version 0.1.3

*   **Recode Fix for Factors:** Resolved a strict type error in `dplyr::case_match` when recoding Factor variables. The plugin now automatically handles the necessary type conversions (to character) when defining text-based rules, preventing "loss of generality" errors during batch recoding.

## 🚀 What's New in Version 0.1.2

This maintenance release focuses on stability and code generation accuracy:

*   **Composite Score Fix:** Resolved a syntax error in the "Create Composite Score" component that occurred when saving results to complex object paths (e.g., `survey_list[["score"]]`). The generated R code now correctly escapes these names.
*   **Internal Stability:** Enforced strict separation between internal calculation variables and user-defined output names across all components, preventing potential naming collisions.

## 🚀 What's New in Version 0.1.1

*   **Robust Variable Handling:** Fixed issues where variables with spaces or special characters (e.g., `Mucha confianza`) caused syntax errors. Variable names are now correctly quoted in generated R code.
*   **Complex Object Output:** Fixed bugs when saving results to complex object paths. Quotes in object names are now properly escaped.
*   **Recode Matrix Improvements:** The spreadsheet interface for recoding now correctly accepts mixed data types (text/numbers) without blocking the "Submit" button or showing validation errors.

## ✨ Features

### 1. Batch Transform Variables
*   **Multi-Column Operations:** Apply functions like Log, Exponential, Z-score (`scale`), or custom formulas to $N$ variables instantly using `dplyr::across()`.
*   **Grouped Calculations:** Automatically calculate statistics *per group* (e.g., group means) and append them to the dataset.
*   **Smart Naming:** Customize output variable names using glue syntax (e.g., `{.col}_{.fn}` -> `variable_mean`).
*   **NA Handling:** Toggle `na.rm` with a single click.

### 2. Batch Recode Variables
*   **Spreadsheet Interface:** Define recoding rules ("Old Value" -> "New Value") in a clean grid.
*   **Type Safety:** Strict handling of Numeric vs. Character/Factor types to prevent R errors.
*   **Default Behavior:** Choose how to handle unmatched values: Copy original, set to NA, or use a specific fallback value.
*   **Output Control:** Convert results to Factors automatically and add suffixes to prevent overwriting raw data.

### 3. Create Composite Score
*   **Row-wise Aggregation:** Calculate scores for each subject/row based on a selection of items (e.g., survey scales).
*   **Methods:** Supports Mean (`rowMeans`), Sum (`rowSums`), Median, SD, Variance, Min/Max, and Valid Count.
*   **Safety:** Explicit control over Missing Value removal (`na.rm`).

### 🛡️ Universal Features
*   **Live Preview:** All plugins include a data preview window that shows the result of the operation on the first 50 rows, allowing you to verify logic before processing the full dataset.
*   **Non-Destructive:** By default, operations create new variables or new objects, preserving your original data unless you explicitly choose to overwrite.
*   **Internationalization:** Fully localized interface available in:
    *   🇺🇸 English (Default)
    *   🇪🇸 Spanish (`es`)
    *   🇫🇷 French (`fr`)
    *   🇩🇪 German (`de`)
    *   🇧🇷 Portuguese (Brazil) (`pt_BR`)

## 📦 Installation

This plugin is not yet on CRAN. To install it, use the `remotes` or `devtools` package in RKWard.

1.  **Open RKWard**.
2.  **Run the following command** in the R Console:

    ```R
    # If you don't have remotes installed:
    # install.packages("remotes")
    
    local({
      require(remotes)
      install_github("AlfCano/rk.data.wrangling", force = TRUE)
    })
    ```
3.  **Restart RKWard** to load the new menu entries.

## 💻 Usage

Once installed, the tools are organized under:

**`Data` -> `Data Wrangling`**

1.  **Batch Transform**
2.  **Batch Recode**
3.  **Create Composite Score**

## 🛠️ Dependencies

This plugin relies on the following R packages:
*   `dplyr` (Core logic)
*   `rkwarddev` (Plugin generation)

#### Troubleshooting: Errors installing `devtools` or missing binary dependencies (Windows)

If you encounter errors mentioning "non-zero exit status", "namespace is already loaded", or requirements for compilation (compiling from source) when installing packages, it is likely because the R version bundled with RKWard is older than the current CRAN standard.

**Workaround:**
Until a new, more recent version of R (current bundled version is 4.3.3) is packaged into the RKWard executable, these issues will persist. To fix this:

1.  Download and install the latest version of R (e.g., 4.5.2 or newer) from [CRAN](https://cloud.r-project.org/).
2.  Open RKWard and go to the **Settings** (or Preferences) menu.
3.  Run the **"Installation Checker"**.
4.  Point RKWard to the newly installed R version.

This "two-step" setup (similar to how RStudio operates) ensures you have access to the latest pre-compiled binaries, avoiding the need for RTools and manual compilation.

## ✍️ Author & License

*   **Author:** Alfonso Cano (<alfonso.cano@correo.buap.mx>)
*   **Assisted by:** Gemini, a large language model from Google.
*   **License:** GPL (>= 3)
