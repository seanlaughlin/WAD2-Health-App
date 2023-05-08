//Used in calorie and BMI calc to get from API
document.getElementById("calculator-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const activityLevel = document.getElementById("activitylevel").value;


    //Add parameters to url for calorie calc
    const calorieUrl = new URL("https://fitness-calculator.p.rapidapi.com/dailycalorie");
    calorieUrl.searchParams.append("age", age);
    calorieUrl.searchParams.append("gender", gender);
    calorieUrl.searchParams.append("height", height);
    calorieUrl.searchParams.append("weight", weight);
    calorieUrl.searchParams.append("activitylevel", activityLevel);

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '9e3324bf83msh34dc07c79189889p1f8c13jsn975dfb9aa4c5',
            'X-RapidAPI-Host': 'fitness-calculator.p.rapidapi.com'
        }
    };

    //Get the data from API and display
    async function getResults() {
        //
        try {
            // Fetch daily calorie result
            const calorieResponse = await fetch(calorieUrl, options);
            const calorieData = await calorieResponse.json();

            const calorieResultElement = document.getElementById("result");

            calorieResultElement.style.display = 'block';
            calorieResultElement.classList.add('overflow-scroll');
            calorieResultElement.style.maxHeight = "400px";

            // Display the BMR
            const bmrElement = document.createElement("div");
            bmrElement.classList.add("alert", "alert-primary");
            bmrElement.innerHTML = `<strong>BMR (Basal Metabolic Rate): </strong> ${calorieData.data.BMR}`;
            calorieResultElement.appendChild(bmrElement);

            // Display the calorie goals
            const goalsElement = document.createElement("div");
            goalsElement.innerHTML = `<h5>Goals:</h5>`;
            for (const goal in calorieData.data.goals) {
                const subGoal = calorieData.data.goals[goal];
                const subGoalElement = document.createElement("div");
                subGoalElement.classList.add("alert", "alert-success");
                subGoalElement.innerHTML = `
              <h5>${goal}</h5>
              <ul style="list-style: none">
                <li><strong>Weight Loss/Gain:</strong> ${subGoal["loss weight"] || subGoal["gain weight"]}</li>
                <li><strong>Daily Calories:</strong> ${subGoal.calory}</li>
              </ul>
            `;
                goalsElement.appendChild(subGoalElement);
            }

            calorieResultElement.appendChild(goalsElement);

            //Show calorie result
            calorieResultElement.style.display = 'block';
        } catch (error) {
            console.error(error);
        }
    }

    getResults();
});