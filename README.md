# Bot Lesson Assistant

An interactive English language learning application built with Astro, featuring AI-powered feedback and conversational practice scenarios.

## Overview

This project is a web-based English learning assistant that guides students through structured conversation practice activities. It uses OpenAI's Assistant API to provide intelligent feedback on student responses, helping learners improve their English communication skills through contextual, story-based exercises.

## Features

- **Interactive Lessons**: Step-by-step conversation practice with story-based scenarios
- **AI-Powered Feedback**: Real-time evaluation using OpenAI Assistant API with detailed scoring and corrections
- **Progress Tracking**: Visual progress bar and navigation between questions
- **Hint System**: Contextual hints to help students when stuck
- **Try Again Functionality**: Reset individual questions to practice again
- **Speech-to-Text Input**: Voice input capability for pronunciation practice
- **State Persistence**: Saves progress locally, allowing users to resume lessons
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Framework**: Astro 5.14.1
- **Language**: TypeScript
- **AI Integration**: OpenAI Assistant API
- **Styling**: CSS Variables with custom design system
- **Build Tool**: Vite (via Astro)
- **Package Manager**: pnpm

## Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── activities/
│   │   ├── a1.json, a2.json, b2.json    # Lesson activities
│   │   └── structure-base.md           # Activity format guide
│   ├── components/
│   │   ├── BotLesson.astro             # Main lesson component
│   │   ├── Button.astro                # Reusable button
│   │   ├── Input.astro                 # Input components
│   │   ├── LessonControls.astro        # Control buttons
│   │   ├── MessageBubble.astro         # Chat message display
│   │   ├── ProgressBar.astro           # Progress indicator
│   │   └── SpeechToText.astro          # Voice input
│   ├── pages/
│   │   └── index.astro                 # Main page
│   ├── stores/
│   │   ├── ActivityStore.ts            # Activity state management
│   │   ├── ChatStore.ts                # Chat/message persistence
│   │   ├── OpenAIService.ts            # OpenAI API integration
│   │   └── StateMachine.ts             # Lesson flow control
│   ├── styles/
│   │   └── variables.css               # CSS custom properties
│   └── types/
│       └── index.ts                    # TypeScript definitions
├── .env                                # Environment variables
├── astro.config.mjs                   # Astro configuration
├── package.json                       # Dependencies and scripts
└── tsconfig.json                      # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- OpenAI API account with Assistant API access

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bot-home-click-class
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the root directory:
   ```env
   PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   PUBLIC_OPENAI_ASSISTANT_ID=your_assistant_id_here
   ```

   > **Note**: The assistant should be configured to evaluate English learning responses and return feedback in the expected JSON format.

4. **Start development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:4321`

## Usage

1. **Start a Lesson**: Click the "Iniciar" (Start) button to begin
2. **Answer Questions**: Respond to each question in the conversation scenario
3. **Receive Feedback**: Get AI-powered evaluation with scores, corrections, and tips
4. **Navigate**: Use Back/Next buttons to move between questions
5. **Use Hints**: Click the Hint button if you need help
6. **Try Again**: Reset a question to practice it again
7. **Reset Lesson**: Start over completely with the Reset button

## Activity Format

Activities are JSON files containing:

- **Metadata**: Title, description, level, duration
- **Context**: Story scenario for the conversation
- **Questions**: Array of questions with hints and evaluation criteria
- **Evaluation Points**: Specific aspects to assess in responses

Example activity structure:
```json
{
  "id": "activity-4",
  "title": "Lost in the School Hallway",
  "level": "A2",
  "activityContext": "...",
  "questions": [
    {
      "id": "q1",
      "type": "text",
      "question": "What polite question can you ask?",
      "hint": "Start with 'Excuse me...'",
      "evaluatePoints": ["Polite opening", "Correct form"]
    }
  ]
}
```

## OpenAI Assistant Configuration

The assistant should be set up to evaluate student responses and return feedback in this JSON format:

```json
{
  "score": 85,
  "decision": "Good effort, but needs improvement",
  "criteria": {
    "semanticRelevance": 80,
    "grammaticalCorrectness": 90,
    "vocabularyAppropriate": 85,
    "pronunciation": 0
  },
  "feedback": "Your response shows good understanding...",
  "corrections": "Consider using 'Could you tell me...' instead",
  "tips": "Remember to use polite forms when asking for help"
}
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm astro check` - Type checking

### Key Components

- **BotLesson.astro**: Main component orchestrating the lesson flow
- **StateMachine.ts**: Manages lesson states (ASK → EVALUATE → FEEDBACK → NEXT)
- **OpenAIService.ts**: Handles OpenAI API communication
- **ActivityStore.ts**: Manages current activity and question state
- **ChatStore.ts**: Persists chat messages and progress in localStorage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository.
