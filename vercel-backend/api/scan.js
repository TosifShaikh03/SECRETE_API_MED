export default async function handler(req, res) {
    try {
        const { text } = req.body;

        if (!text)
            return res.status(400).json({ error: "Missing text" });

        const openaiRes = await fetch(""https://vercel-backend.vercel.app/api/scan",", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{
                    role: "user",
                    content: `
Extract medicine details from this text:

${text}

Return JSON array:
[
  {"name":"","expiry":"","category":""}
]
                    `
                }]
            })
        });

        const data = await openaiRes.json();

        res.status(200).json({ result: data.choices[0].message.content });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

