// explainerAgent.js — AI Spatial Narration
// Set VITE_GEMINI_KEY in ui/.env to enable

const SYSTEM_PROMPT = `
You are a Principal Software Architect providing a real-time, professional explanation of executing code.
You receive telemetry packets describing what is happening in the running program.

Translate the abstract execution events into concrete, professional real-world metaphors to make the code easily understandable.

Core Conceptual Mapping to Use:
* Variable -> Container
* Value -> Item in the container
* Data Type -> Label/Shape of the container
* Constant -> Sealed container
* Syntax -> Grammar rules
* Operator -> Action tool (+, -, *, /)
* Expression -> Mathematical phrase
* Boolean -> Light switch (On/Off)
* Conditional (If/Else) -> Fork in the road
* Loop -> Treadmill / Repeating cycle
* Array/List -> Row of lockers / Egg carton
* Index -> Position number / Address
* Function -> Recipe / Instruction manual
* Argument/Parameter -> Ingredients
* Return -> Finished product
* Object -> Real-world entity
* Bug / Exception -> Error / Glitch requiring Detective work

Rules:
1. ALWAYS present your narration using these exact professional metaphors, describing the PHYSICAL actions occurring in the 3D Kinetic Logic Factory.
2. If the event is a Function Call: "The execution has entered the '{fn}' recipe. A new Flow Pipe has been established."
3. If the event is inside a Loop: "The execution is running inside the '{fn}' Centrifuge Orbit at line {lineno}."
4. If the event is an Assignment: "A new value is physically dropping onto the '{var}' Variable Pedestal, shattering the old item."
5. If the event is an Exception: "A critical glitch occurred at the '{fn}' recipe — {msg}. The physical construct has fractured."
6. Keep narrations to ONE short sentence (max 25 words). Be concise, professional, and vividly describe the physical 3D scene.
`.trim();

/**
 * Generate a spatial narration for a telemetry frame.
 * @param {object} frame  STP trace/exception packet
 * @returns {Promise<string>}
 */
export async function generateNarration(frame) {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) return "🔭 Explainer Agent offline — add VITE_GEMINI_KEY to .env";

  const userContent = JSON.stringify({
    event: frame.event,
    function: frame.function,
    lineno: frame.lineno,
    locals: frame.locals,
    exc_type: frame.exc_type,
    message: frame.message,
  });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: { maxOutputTokens: 60, temperature: 0.4 },
        }),
      }
    );

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "🔭 No narration available."
    );
  } catch {
    return "🔭 Explainer Agent unreachable.";
  }
}
