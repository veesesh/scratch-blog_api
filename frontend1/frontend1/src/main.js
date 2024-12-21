import "./style.css";

document
  .getElementById("uploadForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Show a loading message
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "<p>Generating blog... Please wait.</p>";
      resultDiv.style.display = "block";

      // Send the file to the backend
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate content.");
      }

      const data = await response.json();

      // Update the result section with the generated blog and prompt
      resultDiv.innerHTML = `
        <h2>Generated Blog</h2>
        <p>${data.blog || "No blog content generated."}</p>
        <h3>Prompt Used</h3>
        <p>${data.prompt || "No prompt provided."}</p>
      `;
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while generating the blog.");
    }
  });
