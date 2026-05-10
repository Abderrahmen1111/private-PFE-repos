/**
 * Comment Analyzer — Analyse les commentaires via Groq (Llama 3.3 70B)
 * Détecte le sentiment et modère le contenu (Darija + Français)
 */

export interface CommentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  is_spam: boolean
  is_toxic: boolean
  language: string
  suggested_reply_fr?: string
}

export async function analyzeComment(text: string): Promise<CommentAnalysis | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[CommentAI] GROQ_API_KEY non configurée')
    return null
  }

  const model = 'llama-3.3-70b-versatile'
  
  const systemPrompt = `Tu es un expert en modération de commentaires pour une marketplace tunisienne (Ro2ya).
Le commentaire peut être en Darija tunisien, Français ou Arabe.
Analyse le texte et réponds UNIQUEMENT avec un objet JSON valide:
{
  "sentiment": "positive" | "neutral" | "negative",
  "is_spam": boolean,
  "is_toxic": boolean,
  "language": "fr" | "darija" | "ar",
  "suggested_reply_fr": "une suggestion de réponse courte et polie en français"
}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    })

    if (!res.ok) {
      console.error(`[CommentAI] Groq error: ${res.status}`)
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    return JSON.parse(content) as CommentAnalysis
  } catch (err) {
    console.error('[CommentAI] Exception:', err)
    return null
  }
}
