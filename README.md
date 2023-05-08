# Web Application Development 2: CW2 - Greenfields Health #
## Overview ##

This application provides users information and functionality related to three health areas: Nutrition and Diet, Fitness, and Lifestyle.
It has been designed to allow users to easily, intuitively and effectively track different health-related goals, and view records of these achievements.

### Features ###
There are 3 different feature types used in the application:
* Goal Trackers: These are used by users to track specific health related metrics. They come in 3 types:
    * Line Chart: Users can create line charts that track the metric of their choice using the units of their choice. They're able to set goals based on chart values, and mark these as complete, edit or delete them.
    * Progress Bar: This shows the user a progress bar when working towards a goal using a cumulative metric. For example, number of days gone to the gym in a month, or pieces of fruit and veg eaten in a week. Once this goal is complete, the user can mark it and view it in their achievements.
    * Goal List: This is designed as a to-do style list for health related goals. Users can define any arbitrary or less numerically measureable goals in a list, and modify, delete or tick them off to add it to their achievements.

    These trackers all allow the user to choose a custom metric to track, or list name.

* Health Guides: For each of the three health categories mentioned, a health guide has been produced that outlines some useful general information.
* Health Related Calculators: A calorie calculator, and BMI calculator have been provided in the application. Users may wish to use these as reference when planning their goals or making an entry in one of their goal trackers.

### Authentication ###
In order to provide easy access to as many users as possible, this application includes both Google auth and a local authorisation strategy using Passport js.
Please note, however, that only localhost:3000 is authorised to be used for Google Auth, as it does not accept subdomains. Please download and run locally to log in with Google.

### How to Run ###

The site can be run by running npm install from a terminal opened in the project root directory. This should install all neccessary dependencies.
After this, npm start will begin the program running, and it will be accessible from localhost:3000.
