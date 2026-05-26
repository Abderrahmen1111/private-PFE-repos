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

  const modelChain = [
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'llama-3.1-8b-instant'
  ]

  const systemPrompt = `Tu es un expert en modération de commentaires pour une marketplace tunisienne (Ro2ya).
Le commentaire peut être en Darija tunisien, Français ou Arabe.
Analyse le texte et réponds UNIQUEMENT avec un objet JSON valide:
{
  "sentiment": "positive" | "neutral" | "negative",
  "is_spam": boolean,
  "is_toxic": boolean,
  "language": "fr" | "darija" | "ar",
  "suggested_reply_fr": "une suggestion de réponse courte et polie en français"
}

Consignes pour le Darija tunisien phonétique :
- "yaatikom el saha" (ou "ya3tikom el sa7a") signifie "merci beaucoup / bravo" (sentiment positif).
- "bnina barcha" signifie "très délicieuse" (sentiment positif).
- "yhebel" (ou "yhabal") signifie "incroyable/magnifique/extraordinaire" (sentiment positif, ce n'est PAS toxique).
- Les insultes graves comme "khra", "kléb" sont toxiques et négatives.`

  let lastErr = null
  for (const model of modelChain) {
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
        throw new Error(`Groq API error (${model}): ${res.status} - ${await res.text()}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (content) {
        return JSON.parse(content) as CommentAnalysis
      }
    } catch (err: any) {
      console.warn(`[CommentAI] Model ${model} failed, trying next... Error:`, err.message || err)
      lastErr = err
    }
  }

  console.error('[CommentAI] All models failed in analyzeComment:', lastErr)
  return null
}
