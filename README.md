# NutriTrack: Anganwadi Growth Monitor

Paper-based Anganwadi growth registers are prone to manual calculation errors and make it difficult to instantly identify malnourished children. 
This application digitizes the register, automatically deriving nutritional status to ensure trustworthy, actionable health data.

## How to Run the Application

1. Ensure you have Node.js and a MySQL server installed on your machine.
2. Open your MySQL client, create a database named `sih`, and execute your `CREATE TABLE` and `INSERT` SQL scripts to set up the `growth_measurements` table.
3. Open a terminal window in the root directory of your project folder.
4. Run `npm install express mysql2 cors` to install the required backend dependencies.
5. Run `node DB.js` to start the backend API server.
6. Double-click the `index.html` file to open it in any modern web browser.

## Data Dictionary

*   **Record ID**: A unique, required alphanumeric identifier for the measurement visit. It must begin with "REC" followed by numbers.
*   **Child Name**: The first name of the child being measured (minimum 2 characters).
*   **Age (Months)**: The child's age at the time of measurement, restricted to the ICDS target range of 0 to 72 months.
*   **Weight (kg)**: The child's body weight measured in kilograms. Must be a positive value up to 40kg. 
*   **Height (cm)**: The child's length or height measured in centimeters.
*   **Status**: The nutritional health category of the child, calculated automatically by the server.
*   **Visit Date**: The date the record was created or last updated, automatically stamped by the server.

## Derived Value Calculations

To ensure data integrity and prevent manual disputes, the **Status** field is never entered by the user. It is calculated entirely on the server using the following logic:

1.  **Baseline Calculation**: The system determines the standard healthy weight for the child based on their age using the formula: `Expected Weight = (Age in Months * 0.2) + 4`.
2.  **Comparison and Classification**: The system compares the actual entered `Weight (kg)` against this baseline:
    *   **SAM (Severe Acute Malnutrition)**: Actual weight is strictly less than 70% of the expected weight.
    *   **MAM (Moderate Acute Malnutrition)**: Actual weight is strictly less than 85% of the expected weight.
    *   **Underweight**: Actual weight is strictly less than 95% of the expected weight.
    *   **Normal**: Actual weight is 95% or greater than the expected weight (or if weight is left blank).

The `visit_date` is also derived server-side. The server grabs the current `YYYY-MM-DD` upon submission, preventing backdating or manual entry errors.

## What is Not Finished

*   **Authentication**: There is no login system or role-based access control to differentiate between what an Anganwadi Worker can edit versus what a Supervisor can view.
*   **Longitudinal Tracking**: The dashboard currently shows the latest individual records but does not plot historical growth curves for a single child over time.
*   **Stunting Metrics**: The health status is currently calculated using weight-for-age. Height-for-age (stunting) calculations are not yet integrated into the algorithmic logic.
*   **Production Deployment**: The database and API endpoints are hardcoded to `localhost`, requiring local setup rather than being accessible via a live public URL.