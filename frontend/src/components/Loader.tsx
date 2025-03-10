import React from "react";
import "../loader.css"; // Import the CSS

const Loader: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
