// Getting HTML elements for later use
const authModal = document.getElementById('authModal'); // Authentication modal
const recipeModal = document.getElementById('recipeDetailModal'); // Recipe detail modal
const searchBar = document.querySelector('.search-bar'); // Search bar for ingredients
const recipesGrid = document.getElementById('recipesGrid'); // Grid to display recipes
const selectedIngredientsContainer = document.getElementById('selectedIngredients'); // Container for selected ingredients
const categorySelect = document.getElementById('categorySelect'); // Dropdown for category selection
const closeModalBtn = document.getElementById('closeModal'); // Close button for auth modal
const closeRecipeModalBtn = document.getElementById('closeRecipeModal'); // Close button for recipe detail modal
const authButton = document.getElementById('authButton'); // Authentication button

// Define variables for later use
let currentPage = 1; // Current page for pagination
const mealsPerPage = 8; // Number of meals per page
let meals = []; // Array to store fetched meals
const selectedIngredients = new Set(); // Set to store selected ingredients uniquely

// Event listener to handle page load logic
document.addEventListener('DOMContentLoaded', () => {
    loadCategories(); // Load meal categories on page load
    setupAuthListeners(); // Set up authentication listeners
    setupRecipeListeners(); // Set up recipe-related listeners
    fetchMeals(); // Fetch meals based on selected ingredients and category
});

// Event listener to close the authentication modal
closeModalBtn.addEventListener('click', () => {
    authModal.classList.add('hidden'); // Hide auth modal when close button is clicked
});

// Event listener to close the recipe detail modal
closeRecipeModalBtn.addEventListener('click', () => {
    recipeDetailModal.classList.add('hidden'); // Hide recipe modal when close button is clicked
});

// Event listener to show the authentication modal when the 'authButton' is clicked
authButton.addEventListener('click', () => {
    authModal.classList.remove('hidden'); // Show the auth modal
});

// Event listener to close the modal if clicked outside of the modal content
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.add('hidden'); // Hide auth modal if clicked outside
    }
});

// Event listener to close the recipe modal if clicked outside
recipeDetailModal.addEventListener('click', (e) => {
    if (e.target === recipeDetailModal) {
        recipeDetailModal.classList.add('hidden'); // Hide recipe modal if clicked outside
    }
});

// Search functionality: Add ingredients when Enter is pressed in the search bar
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        const ingredient = e.target.value.trim().toLowerCase(); // Get the ingredient from the search bar
        selectedIngredients.add(ingredient); // Add the ingredient to selected ingredients
        renderSelectedIngredients(); // Render the selected ingredients list
        searchBar.value = ''; // Clear the search bar
        currentPage = 1; // Reset to the first page
        fetchMeals(); // Fetch meals based on updated selected ingredients
    }
});

// Function to render the selected ingredients as tags
function renderSelectedIngredients() {
    selectedIngredientsContainer.innerHTML = Array.from(selectedIngredients)
        .map(ingredient => `
            <div class="ingredient-tag">
                ${ingredient} 
                <button class="remove-ingredient" onclick="removeIngredient('${ingredient}')">×</button> <!-- Remove ingredient button -->
            </div>
        `).join('');
}

// Function to remove an ingredient from the selected list
function removeIngredient(ingredient) {
    selectedIngredients.delete(ingredient); // Remove the ingredient from the set
    renderSelectedIngredients(); // Re-render the selected ingredients list
    currentPage = 1; // Reset to the first page
    fetchMeals(); // Fetch meals based on updated selected ingredients
}

// Auth functions to handle user sign-in and sign-up
function setupAuthListeners() {
    const authButton = document.getElementById('authButton');
    const authForm = document.getElementById('authForm');
    const closeModalBtn = document.getElementById('closeModal');
    const switchModeBtn = document.getElementById('switchAuthMode');
    let isLogin = true; // Initially set to login mode

    authButton.addEventListener('click', () => authModal.classList.remove('hidden')); // Show auth modal on button click
    closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden')); // Hide auth modal when close button is clicked
    
    // Switch between sign-in and sign-up modes
    switchModeBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        document.querySelector('.username-group').classList.toggle('hidden'); // Toggle username input for register
        document.getElementById('authTitle').textContent = isLogin ? 'Sign In' : 'Register'; // Change title based on mode
        switchModeBtn.textContent = isLogin ? 'Need an account? Register' : 'Already registered? Sign in'; // Change button text
    });

    // Form submission for authentication
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        try {
            if (isLogin) {
                await auth.signInWithEmailAndPassword(email, password); // Sign in user
            } else {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password); // Register user
                await userCredential.user.updateProfile({ displayName: username }); // Set the display name for the user
            }
            authModal.classList.add('hidden'); // Hide the modal after authentication
            authForm.reset(); // Reset the form fields
        } catch (error) {
            showError(error.message); // Show error if authentication fails
        }
    });

    // Auth state change listener to update UI based on user login status
    auth.onAuthStateChanged(user => {
        const authButton = document.getElementById('authButton');
        const authContainer = document.getElementById('auth-container');
        const authModal = document.getElementById('authModal');
        
        if (user) {
            authButton.textContent = 'Sign Out'; // Change button text to 'Sign Out' when logged in
            let userNameDisplay = document.querySelector('.user-name');
            if (!userNameDisplay) {
                userNameDisplay = document.createElement('span'); // Create a span for username display
                userNameDisplay.className = 'user-name';
                authContainer.insertBefore(userNameDisplay, authButton); // Insert username before the auth button
            }
            userNameDisplay.textContent = user.displayName; // Display the user's name
            
            authButton.onclick = () => {
                auth.signOut(); // Sign out the user
                authModal.classList.add('hidden'); // Hide the modal on sign out
            };
        } else {
            authButton.textContent = 'Sign In'; // Change button text to 'Sign In' when logged out
            const userNameDisplay = document.querySelector('.user-name');
            if (userNameDisplay) {
                userNameDisplay.remove(); // Remove the username display when logged out
            }
            
            authButton.onclick = () => {
                authModal.classList.remove('hidden'); // Show the modal when the user clicks 'Sign In'
            };
        }
    });
}

// Recipe Functions
function setupRecipeListeners() {
    searchBar.addEventListener('keypress', handleSearchKeyPress); // Handle ingredient search when Enter is pressed
    categorySelect.addEventListener('change', handleCategoryChange); // Handle category change
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1)); // Handle previous page navigation
    document.getElementById('nextPage').addEventListener('click', () => changePage(1)); // Handle next page navigation
}

async function loadCategories() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php'); // Fetch meal categories
        const data = await response.json();
        categorySelect.innerHTML = '<option value="">All Categories</option>' +
            data.categories.map(category => 
                `<option value="${category.strCategory}">${category.strCategory}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading categories:', error); // Log any errors while fetching categories
    }
}

async function fetchMeals() {
    try {
        let finalMeals = [];
        // If there are selected ingredients, fetch meals that match all selected ingredients
        if (selectedIngredients.size > 0) {
            const promises = Array.from(selectedIngredients).map(ingredient =>
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
                    .then(res => res.json())
            );
            const results = await Promise.all(promises);
            const commonMealIds = findCommonMeals(results); // Find common meal IDs based on selected ingredients
            finalMeals = await Promise.all(
                commonMealIds.map(id =>
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                        .then(res => res.json())
                        .then(data => data.meals[0])
                )
            );
        } else {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='); // Fetch all meals if no ingredients selected
            const data = await response.json();
            finalMeals = data.meals || [];
        }

        // Filter meals by category if selected
        const category = categorySelect.value;
        if (category) {
            finalMeals = finalMeals.filter(meal => meal.strCategory === category);
        }

        meals = finalMeals;
        renderMeals(); // Render the meals based on the fetched data
        updatePagination(); // Update pagination controls
    } catch (error) {
        console.error('Error fetching meals:', error); // Log any errors while fetching meals
    }
}

// Function to render meals as cards
function renderMeals() {
    const startIndex = (currentPage - 1) * mealsPerPage;
    const endIndex = startIndex + mealsPerPage;
    const currentMeals = meals.slice(startIndex, endIndex); // Slice the meals for the current page

    recipesGrid.innerHTML = currentMeals.length > 0 
        ? currentMeals.map(createMealCard).join('') // Render meal cards if meals exist
        : '<div class="no-recipes"><h2>No Recipes Found</h2><p>Try different ingredients or clear your search filters</p></div>'; // Show no recipes message if no meals found

    // Add event listeners for recipe detail modals on card click
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const mealId = card.dataset.mealId; // Get the meal ID from the card
            const meal = meals.find(m => m.idMeal === mealId); // Find the meal based on the ID
            showRecipeModal(meal); // Show the recipe modal
        });
    });
}

// Helper Functions
function createMealCard(meal) {
    return `
        <div class="recipe-card" data-meal-id="${meal.idMeal}"> <!-- Create meal card -->
            <div class="recipe-image">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}"> <!-- Meal image -->
            </div>
            <div class="recipe-content">
                <h2 class="recipe-title">${meal.strMeal}</h2> <!-- Meal title -->
                <div class="recipe-category">${meal.strCategory}</div> <!-- Meal category -->
            </div>
        </div>
    `;
}

function showRecipeModal(meal) {
    document.getElementById('modalRecipeImage').src = meal.strMealThumb; // Set modal image
    document.getElementById('modalRecipeTitle').textContent = meal.strMeal; // Set modal title
    document.getElementById('modalRecipeCategory').textContent = meal.strCategory; // Set modal category
    document.getElementById('modalInstructions').textContent = meal.strInstructions; // Set modal instructions
    document.getElementById('modalIngredientsList').innerHTML = getIngredientsList(meal); // Set modal ingredients list
    
    recipeModal.classList.remove('hidden'); // Show the recipe modal
    document.getElementById('closeRecipeModal').onclick = () => {
        recipeModal.classList.add('hidden'); // Hide the recipe modal when close button is clicked
    };
}

function handleSearchKeyPress(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
        selectedIngredients.add(e.target.value.trim().toLowerCase()); // Add ingredient on Enter press
        renderSelectedIngredients(); // Re-render selected ingredients
        e.target.value = ''; // Clear search bar
        currentPage = 1; // Reset to the first page
        fetchMeals(); // Fetch meals based on updated ingredients
    }
}

function handleCategoryChange() {
    currentPage = 1; // Reset to the first page when category changes
    fetchMeals(); // Fetch meals based on the selected category
}

function changePage(delta) {
    const newPage = currentPage + delta; // Calculate the new page number
    const totalPages = Math.ceil(meals.length / mealsPerPage); // Calculate total pages
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage; // Set the new page number
        renderMeals(); // Render the meals for the new page
        updatePagination(); // Update pagination controls
    }
}

// Utility Functions
function findCommonMeals(results) {
    return results.reduce((acc, curr) => {
        const mealIds = curr.meals?.map(meal => meal.idMeal) || []; // Get the meal IDs from the current result
        if (acc.length === 0) return mealIds; // If this is the first result, return all meal IDs
        return acc.filter(id => mealIds.includes(id)); // Filter to find common meal IDs across all results
    }, []);
}

function getIngredientsList(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && measure) {
            ingredients += `<li>${measure} ${ingredient}</li>`; // List ingredients with their measures
        }
    }
    return ingredients; // Return the ingredients list
}

function updatePagination() {
    const totalPages = Math.ceil(meals.length / mealsPerPage); // Calculate total pages
    document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`; // Display current page and total pages
    document.getElementById('prevPage').disabled = currentPage === 1; // Disable 'prev' button on first page
    document.getElementById('nextPage').disabled = currentPage === totalPages; // Disable 'next' button on last page
}

function showError(message) {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = message); // Display error message
}
