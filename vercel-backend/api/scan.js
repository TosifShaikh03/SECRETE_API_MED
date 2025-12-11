export default async function handler(req, res) {
    try {
        // Allow only POST
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed. Use POST." });
        }

        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Missing OCR text in request body." });
        }

        // Call OpenAI API using the secure server-side key
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `
Extract medicine details from this OCR text:

"${text}"

Return a JSON array only, like:
[
  {
    "name": "",
    "expiry": "",
    "category": ""
  }
]

Rules:
- Category must be one of: Tablet, Syrup, Capsule, Injection, Drops, Ointment, Inhaler, Other.
- Try to detect expiry in formats like: MM/YY, MM/YYYY, YY/MM, YYYY-MM.
- If expiry missing, leave it blank ("").
- Clean the medicine names.
`
                    }
                ]
            })
        });

        const data = await openaiRes.json();

        if (!data.choices || !data.choices[0]) {
            return res.status(500).json({ error: "Invalid AI response", raw: data });
        }

        // Extract the model response
        const result = data.choices[0].message.content;

        // Respond back to frontend
        return res.status(200).json({ result });

    } catch (err) {
        console.error("SCAN API ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
}
