//Used in BMI calc to get from API
document.getElementById("calculator-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const age = document.getElementById("age").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;

    //Add parameters to url for BMI calc
    const bmiUrl = new URL("https://fitness-calculator.p.rapidapi.com/bmi");
    bmiUrl.searchParams.append("age", age);
    bmiUrl.searchParams.append("weight", weight);
    bmiUrl.searchParams.append("height", height);

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
            const bmiResponse = await fetch(bmiUrl, options);
            const bmiData = await bmiResponse.json();

            const bmiResultElement = document.getElementById('bmi');

            bmiResultElement.style.display = 'block';

            const bmiElement = document.createElement("div");
            bmiElement.classList.add("alert", "alert-primary");
            bmiElement.innerHTML = `<ul style="list-style: none">
            <li><strong>BMI:</strong> ${bmiData.data.bmi}</li>
            <li><strong>Health Category:</strong> ${bmiData.data.health}</li>
            <li><strong>Healthy Range:</strong> ${bmiData.data.healthy_bmi_range}</li>
          </ul>`

          bmiResultElement.appendChild(bmiElement);

            //Show bmi result
            bmiResultElement.style.display = 'block';
        } catch (error) {
            console.error(error);
        }
    }

    getResults();
});