# Leeds Schools Web App

## Overview

The **Leeds Schools Web App** is an interactive mapping application designed to visualize and filter school data in Leeds. The app provides an engaging interface for users to explore school information, apply various filters, and view detailed statistics and charts related to the schools.

---

## Features

The application consists of three main components:

### 1. **Map**
   - Visualizes school locations on a map using point markers.
   - Click on a school marker to view detailed information about the school.
   - Automatically updates based on the applied filters.

### 2. **Top Menu**
   - Contains interactive inputs for filtering schools data:
     - **Extracurriculars**: Select extracurricular activities such as Music, Drama, Sports, Debate, Robotics, Art, and Coding.
     - **Average Grade**: Filter schools based on average grade.
     - **Country Ranking**: Filter by schools' country rankings.
     - **Eco Rate**: Filter by the schools' eco-friendly rating.
     - **School Type**: Filter by types of schools (e.g., Public, Private).
     - **IT Facilities**: Filter by the availability of IT resources.
     - **Grade**: Filter schools by grade levels.

### 3. **Side Menu**
   - Displays aggregated statistics:
     - **Total Capacity**: Combined capacity of the filtered schools.
     - **Total Served Population**: Total population served by the filtered schools.
     - **Number of Schools**: Total number of filtered schools.
   - Lists filtered schools with clickable rows:
     - Clicking a school opens a modal with detailed information.
   - **Charts**:
     - A **Capacity Chart** showing capacity vs. operating capacity for each school.
     - A **Country Ranking Chart** showing rankings of schools based on filters.

---

## Installation and Setup

To run the application locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/leeds-schools-web-app.git
   cd leeds-schools-web-app
   ```

2. Serve the application using a local HTTP server to avoid cross-origin errors. Examples:
    - (Option #1) Python HTTP Server:
        - Go to the main directory of the application and run the following command.
        ```bash
        python -m http.server 8000
        ```
        - Now you can access the application in:
        ```bash
        http://localhost:8000
        ```

    - (Option #2) IIS:
        - Copy the application folder to the wwroot folder.
        - And you can access the application in:
        ```bash
        http://localhost/application_folder_name
        ```
        
### Usage Instructions

1. Interact with the map:

    - View schools on the map.
        - Click on a marker to display detailed school information.
        - Apply filters:
            - Use the top menu to refine the displayed schools based on criteria such as extracurriculars, grades, eco rate, etc.
            - The map and side menu will dynamically update based on the selected filters.

2. View statistics and charts:

    - Check aggregated statistics in the side menu.
    - Explore charts for capacity and country rankings of schools.
    - Detailed school view:
    - Click on a school in the side menu list to open a modal with more details.


### Technical Details
1. Libraries Used:
    - ESRI ArcGIS JavaScript SDK
    - Chart.js for generating charts.
    - GeoJSON for storing and querying school data.
    - Data Handling:

2. The school data is stored in a GeoJSON file (schools.geojson).
    - Filters are applied using ESRI's definitionExpression.
    - Statistics and charts are updated dynamically based on the filtered data.