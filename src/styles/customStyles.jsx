/**
 * Custom CSS styles for enhanced UX
 * Contains utility classes for line clamping and backdrop blur
 */

export const customStyles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .backdrop-blur {
    backdrop-filter: blur(10px);
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
