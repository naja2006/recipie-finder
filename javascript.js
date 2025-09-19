const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOK_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultGrid = document.getElementById("result-grid");
const messageArea = document.getElementById("message-area");
const randomButton = document.getElementById("select-button");
const modal = document.getElementById("recipe-model");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseButton = document.getElementById("close-button");


searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerms = searchInput.value.trim();

    if (searchTerms) {
        searchRecipes(searchTerms);
    } else {
        showMessage("Please enter a search term", true);
    }
});


async function searchRecipes(query) {
    resultGrid.innerHTML = "";
    clearMessage();

    try {
        const response = await fetch(`${SEARCH_API_URL}${query}`);
        if (!response.ok) throw new Error("Network error");

        const data = await response.json();
        console.log("data:", data);

        if (data.meals) {
            displayRecipe(data.meals);
        } else {
            showMessage(`No recipe found for "${query}"`);
        }
    } catch (error) {
        showMessage("Something went wrong, please try again", true);
    }
}


function showMessage(message, isError = false) {
    messageArea.textContent = message;
    messageArea.className = "message";
    if (isError) messageArea.classList.add("error");
}

function clearMessage() {
    messageArea.textContent = "";
    messageArea.className = "message";
}


function displayRecipe(recipes) {
    if (!recipes || recipes.length === 0) {
        showMessage("No recipes found");
        return;
    }

    recipes.forEach(recipe => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipe-item");
        recipeDiv.dataset.id = recipe.idMeal;

        recipeDiv.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
            <h3>${recipe.strMeal}</h3>
        `;

        resultGrid.appendChild(recipeDiv);
    });
}


randomButton.addEventListener("click", getRandomRecipe);

async function getRandomRecipe() {
    resultGrid.innerHTML = "";
    clearMessage();

    try {
        const response = await fetch(RANDOM_API_URL);
        if (!response.ok) throw new Error("Something is wrong");

        const data = await response.json();
        console.log("data:", data);

        if (data.meals && data.meals.length > 0) {
            displayRecipe(data.meals);
        } else {
            showMessage("Could not fetch a random recipe.. Try again", true);
        }
    } catch (error) {
        showMessage("Failed to fetch a random recipe. Please check your connection", true);
    }
}


function showModal() {
    modal.classList.remove("hidden");
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.style.overflow = "";
}

modalCloseButton.addEventListener("click", closeModal);
modal.addEventListener("click", e => {
    if (e.target === modal) {
        closeModal();
    }
});


resultGrid.addEventListener("click", e => {
    const card = e.target.closest(".recipe-item");
    if (card) {
        const recipeId = card.dataset.id;
        console.log("Recipe ID:", recipeId);
        getRecipeDetails(recipeId);
    }
});

async function getRecipeDetails(id) {
    showModal();
    modalContent.innerHTML = "<p>Loading recipe details...</p>"; // temporary placeholder

    try {
        const response = await fetch(`${LOOK_API_URL}${id}`);
        const data = await response.json();
        console.log("Recipe details response:", data);

        if (data.meals && data.meals.length > 0) {
            displayRecipeDetails(data.meals[0]);
        } else {
            modalContent.innerHTML = '<p class="message error">Could not load recipe</p>';
        }
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        modalContent.innerHTML = "<p class='message error'>Failed to load recipe details</p>";
    }
}


function displayRecipeDetails(recipe) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.trim();
        const measure = recipe[`strMeasure${i}`]?.trim();

        if (ingredient) {
            ingredients.push(`<li>${measure ? `${measure}` : ""} ${ingredient}</li>`);
        } else {
            break;
        }
    }

    const categoryHTML = recipe.strCategory ? `<h3>Category: ${recipe.strCategory}</h3>` : "";
    const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
    const ingredientsHTML = ingredients.length
        ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>`
        : "";
    const instructionsHTML = `<h3>Instructions</h3><p>${
        recipe.strInstructions
            ? recipe.strInstructions.replace(/\r?\n/g, "<br>")
            : "Instructions not available."
    }</p>`;

    // ✅ Insert everything into modal
    modalContent.innerHTML = `
        <h2>${recipe.strMeal}</h2>
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        ${categoryHTML}
        ${areaHTML}
        ${ingredientsHTML}
        ${instructionsHTML}
    `;
}

