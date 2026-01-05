# rk.data.wrangling: Tidy Data Manipulation for RKWard

![Version](https://img.shields.io/badge/Version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![RKWard](https://img.shields.io/badge/Platform-RKWard-green)
[![R Linter](https://github.com/AlfCano/rk.data.wrangling/actions/workflows/lintr.yml/badge.svg)](https://github.com/AlfCano/rk.data.wrangling/actions/workflows/lintr.yml)

**rk.data.wrangling** brings modern, "tidy" data manipulation tools to the RKWard GUI. It provides a user-friendly interface for the powerful `dplyr` package, allowing users to perform complex batch operations—transformations, recoding, and scoring—on multiple variables simultaneously without writing complex code.

## 🚀 What's New in Version 0.1.0

This is the first major release of the package, introducing three core components designed to cover the most common data preparation tasks in research:

1.  **Batch Transform:** Apply mathematical functions to many columns at once (with grouping support).
2.  **Batch Recode:** Map old values to new values across multiple variables using a spreadsheet interface.
3.  **Composite Score:** Calculate row-wise aggregates (sums, means, reliability scales).

### 🌍 Internationalization
The interface is fully localized in:
*   🇺🇸 English (Default)
*   🇪🇸 Spanish (`es`)
*   🇫🇷 French (`fr`)
*   🇩🇪 German (`de`)
*   🇧🇷 Portuguese (Brazil) (`pt_BR`)

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

## 📦 Installation

This plugin is not yet on CRAN. To install it, use the `remotes` or `devtools` package in RKWard.

1.  **Open RKWard**.
2.  **Run the following command** in the R Console:

    ```R
    # If you don't have devtools installed:
    # install.packages("devtools")
    
    local({
      require(devtools)
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

## ✍️ Author & License

*   **Author:** Alfonso Cano (<alfonso.cano@correo.buap.mx>)
*   **Assisted by:** Gemini, a large language model from Google.
*   **License:** GPL (>= 3)
