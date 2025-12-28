import React from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { getRecipeFromChefClaude, getRecipeFromMistral } from "../ai";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [error, setError] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
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
    const recipeMarkdown = await getRecipeFromChefClaude(ingredients);
    setRecipe(recipeMarkdown);
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

      {error && (
        <p id="ingredient-error" className="error">
          {error}
        </p>
      )}

      {ingredients.length > 0 && (
        <IngredientsList
          ref={recipeSection}
          ingredients={ingredients}
          getRecipe={getRecipe}
        />
      )}

      {recipe && <ClaudeRecipe recipe={recipe} />}
    </main>
  );
}
