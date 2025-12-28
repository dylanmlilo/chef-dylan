import React from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { FaWindowClose } from "react-icons/fa";
import { getRecipeFromChefClaude, getRecipeFromMistral } from "../ai";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [error, setError] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const recipeSection = React.useRef(null);

  React.useEffect(() => {
    if (recipe !== "" && recipeSection.current !== null) {
      // recipeSection.current.scrollIntoView({behavior: "smooth"})
      const yCoord =
        recipeSection.current.getBoundingClientRect().top + window.scrollY;
      window.scroll({
        top: yCoord,
        behavior: "smooth",
      });
    }
  }, [recipe]);

  async function getRecipe() {
    setIsLoading(true);
    setRecipe("");
    setError("");

    try {
      const recipeMarkdown = await getRecipeFromChefClaude(ingredients);
      setRecipe(recipeMarkdown);
    } catch (err) {
      setError("Failed to generate recipe. Please try again.");
      console.error("Recipe generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function addIngredient(formData) {
    const newIngredient = formData
      .get("ingredient")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    if (!newIngredient) {
      return;
    }

    if (ingredients.includes(newIngredient)) {
      setError(`${newIngredient} already exists.`);
      return;
    }

    setIngredients((prev) => [...prev, newIngredient]);
    setInputValue("");
  }

  function clearIngredients() {
    setIngredients([]);
    setRecipe("");
    setInputValue("");
    setError("");
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. pasta"
          aria-label="Add ingredient"
          name="ingredient"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
        />
        <button className="add" disabled={!inputValue.trim()}>
          Add ingredient
        </button>
        {ingredients.length > 0 && (
          <button className="remove" type="button" onClick={clearIngredients}>
            Clear ingredients
          </button>
        )}
      </form>

      {error ? (
        <p id="ingredient-error" className="error">
          {error.replace(/\b\w/g, (c) => c.toUpperCase())}
          <FaWindowClose onClick={() => setError("")} />
        </p>
      ) : (
        <p className="error-placeholder">Placeholder</p>
      )}

      {ingredients.length > 0 && (
        <IngredientsList
          ref={recipeSection}
          ingredients={ingredients}
          getRecipe={getRecipe}
          isLoading={isLoading}
        />
      )}

      {isLoading && (
        <section
          className="loading-container"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="loading-spinner"></div>
          <p>Chef Dylan is cooking up a recipe...</p>
        </section>
      )}

      {recipe && !isLoading && <ClaudeRecipe recipe={recipe} />}
    </main>
  );
}
