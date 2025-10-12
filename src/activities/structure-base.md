{
  "id": "activity-X",
  "title": "Título corto y claro de la actividad",
  "description": "Breve descripción de lo que se va a practicar (2–3 líneas).",
  "activityContext": "Una mini-historia o situación en la que ocurre la actividad. Debe ser clara, simple y contextualizada. Sirve de marco narrativo para las preguntas.",
  "level": "Nivel CEFR (ejemplo: A2, B1, etc.)",
  "questions": [
    {
      "id": "q1",
      "type": "text",
      "question": "Texto de la pregunta que el estudiante debe responder.",
      "hint": "Una pista corta para ayudar al estudiante a contestar.",
      "evaluatePoints": [
        "Criterio 1 de evaluación",
        "Criterio 2 de evaluación",
        "Criterio 3 de evaluación"
      ]
    }
    // Puedes añadir más preguntas (q2, q3, q4...) siguiendo este mismo formato
  ],
  "metadata": {
    "duration": "Duración estimada en minutos (número entero)",
    "difficulty": "Nivel de dificultad (ejemplo: elementary, pre-intermediate, etc.)",
    "tags": ["palabras clave relacionadas con la actividad"]
  }
}

✅ Reglas para generar nuevas actividades

id: usa un identificador único como "activity-5".

title: debe ser breve y relacionado con la situación.

description: explica qué se practica (ejemplo: saludos, pedir direcciones, hacer compras).

activityContext: redacta un mini-escenario narrativo (5–6 líneas máximo) que justifique las preguntas.

level: especifica el nivel (ejemplo: "A2").

questions:

Cada pregunta debe tener:

"id" (q1, q2, q3...).

"type" (ejemplo: "text").

"question": formulada claramente.

"hint": pista breve para orientar.

"evaluatePoints": lista de criterios para evaluar la respuesta.

metadata: incluye duración estimada, nivel de dificultad y etiquetas (tags).

👉 Con este prompt, cada vez que lo uses puedes pedir:
"Genera una nueva actividad de nivel A2 sobre [tema] siguiendo la estructura del JSON anterior."