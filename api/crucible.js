// api/crucible.js
// Serverless function (runs on Vercel). It holds your secret GROQ_API_KEY
// so it never touches the public webpage. The browser talks only to this,
// same-origin, so there are no CORS problems and no key to steal.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Server is missing GROQ_API_KEY." });
    return;
  }

  // Vercel parses JSON bodies automatically; fall back just in case.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const decision = (body && body.decision || "").toString().slice(0, 2000).trim();
  const options = Array.isArray(body && body.options)
    ? body.options.map(o => String(o).slice(0, 300).trim()).filter(Boolean).slice(0, 5)
    : [];
  const lean = (body && body.lean || "").toString().slice(0, 2000).trim();

  if (!decision || options.length < 2) {
    res.status(400).json({ error: "Need a decision and at least two options." });
    return;
  }

  const prompt = `You are the Crucible: a severe but fair tribunal for a person who keeps dodging a decision. Be blunt, specific, and useful. No hedging, no "it depends", no flattery. Speak in second person ("you").

THE DECISION: ${decision}
THE OPTIONS: ${options.map((o, i) => `(${i + 1}) ${o}`).join("  ")}
THEIR LEANING / STAKES: ${lean || "(not stated)"}

Respond with ONLY a JSON object, no markdown, with exactly these keys:
{
  "avoiding": "Name the real thing they are avoiding - the uncomfortable truth, fear, or fact under the dithering. One or two sentences, sharp.",
  "counter": "The single strongest argument AGAINST the option they are leaning toward (or against the safest/default option if no lean is stated). Concrete, not generic.",
  "question": "The one piercing question they have not honestly answered yet. A real question, ending in a question mark.",
  "nudge": "One short line: what committing now actually buys them, and what more delay costs."
}
Keep each value under ~40 words.`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      res.status(502).json({ error: "The model refused the request.", detail: detail.slice(0, 300) });
      return;
    }

    const data = await r.json();
    let text = (data.choices && data.choices[0] && data.choices[0].message.content) || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let brief;
    try { brief = JSON.parse(text); }
    catch { res.status(502).json({ error: "Could not read the model's reply." }); return; }

    res.status(200).json({
      avoiding: brief.avoiding || "",
      counter: brief.counter || "",
      question: brief.question || "",
      nudge: brief.nudge || ""
    });
  } catch (e) {
    res.status(500).json({ error: "The crucible stalled. Try again." });
  }
};
