/**
 * Custom CSS styles for enhanced UX
 * Contains utility classes for line clamping and backdrop blur
 */

export const customStyles = `
  /* Removed animations and complex styles */
  .simple-button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .simple-card {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    box-shadow: none;
  }
`;

/**
 * Function to inject custom styles into the document
 * Should be called once in the main component
 */
export const injectCustomStyles = () => {
  if (typeof document !== "undefined") {
    // Check if styles are already injected
    if (!document.querySelector("#custom-task-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "custom-task-styles";
      styleElement.textContent = customStyles;
      document.head.appendChild(styleElement);
    }
  }
};
