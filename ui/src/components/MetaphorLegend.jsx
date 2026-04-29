// MetaphorLegend.jsx — A sleek, professional UI showing the conceptual mapping
import { useState } from "react";

const MAPPINGS = [
  { term: "Variable", metaphor: "Container" },
  { term: "Value", metaphor: "Item in the container" },
  { term: "Data Type", metaphor: "Label/Shape of container" },
  { term: "Constant", metaphor: "Sealed container" },
  { term: "Operator", metaphor: "Action tool (+, -, *, /)" },
  { term: "Expression", metaphor: "Mathematical phrase" },
  { term: "Boolean", metaphor: "Light switch (On/Off)" },
  { term: "Conditional (If/Else)", metaphor: "Fork in the road" },
  { term: "Loop", metaphor: "Treadmill / Repeating cycle" },
  { term: "Array/List", metaphor: "Row of lockers" },
  { term: "Index", metaphor: "Position number / Address" },
  { term: "Function", metaphor: "Recipe / Instruction manual" },
  { term: "Argument/Parameter", metaphor: "Ingredients" },
  { term: "Return", metaphor: "Finished product" },
  { term: "Object", metaphor: "Real-world entity" },
  { term: "Class", metaphor: "Blueprint / Template" },
  { term: "API", metaphor: "Waiter / Messenger" },
  { term: "Library/Framework", metaphor: "Toolbox" },
  { term: "Compiler/Interpreter", metaphor: "Translator" },
  { term: "Bug / Exception", metaphor: "Error / Glitch" },
  { term: "Debugging", metaphor: "Detective work" },
];

export default function MetaphorLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`metaphor-legend ${isOpen ? "open" : "closed"}`}>
      <button className="ml-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "▼ CONCEPTUAL MAPPING" : "▲ CONCEPTUAL MAPPING"}
      </button>

      {isOpen && (
        <div className="ml-content">
          <div className="ml-grid">
            {MAPPINGS.map((m, i) => (
              <div key={i} className="ml-row">
                <span className="ml-term">{m.term}</span>
                <span className="ml-arrow">→</span>
                <span className="ml-metaphor">{m.metaphor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
