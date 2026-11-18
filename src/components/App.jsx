import React, { useEffect, useState } from "react";

import Header from "./Header";
import ToyForm from "./ToyForm";
import ToyContainer from "./ToyContainer";

const TOYS_URL = "http://localhost:3001/toys";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [toys, setToys] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchToys() {
      try {
        const response = await fetch(TOYS_URL);
        if (!response.ok) {
          throw new Error("Unable to load toys.");
        }

        const fetchedToys = await response.json();
        if (!Array.isArray(fetchedToys)) {
          throw new Error("The toys response was not a list.");
        }

        if (isMounted) {
          setToys(fetchedToys);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      }
    }

    fetchToys();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleClick() {
    setShowForm((showForm) => !showForm);
  }

  async function handleCreateToy(toyDetails) {
    setError("");

    try {
      const response = await fetch(TOYS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toyDetails, likes: 0 }),
      });
      if (!response.ok) {
        throw new Error("Unable to create the toy.");
      }

      const newToy = await response.json();
      setToys((currentToys) => [...currentToys, newToy]);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    }
  }

  async function handleLikeToy(toy) {
    setError("");

    try {
      const response = await fetch(`${TOYS_URL}/${toy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: toy.likes + 1 }),
      });
      if (!response.ok) {
        throw new Error("Unable to like the toy.");
      }

      setToys((currentToys) =>
        currentToys.map((currentToy) =>
          currentToy.id === toy.id
            ? { ...currentToy, likes: toy.likes + 1 }
            : currentToy,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDonateToy(toy) {
    setError("");

    try {
      const response = await fetch(`${TOYS_URL}/${toy.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to donate the toy.");
      }

      setToys((currentToys) =>
        currentToys.filter((currentToy) => currentToy.id !== toy.id),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <Header />
      {showForm ? <ToyForm onCreateToy={handleCreateToy} /> : null}
      <div className="buttonContainer">
        <button onClick={handleClick}>Add a Toy</button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <ToyContainer
        toys={toys}
        onLikeToy={handleLikeToy}
        onDonateToy={handleDonateToy}
      />
    </>
  );
}

export default App;
