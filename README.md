# Live Twitter Sentiment Streaming Application Using Spark

An academic Big Data project demonstrating real-time sentiment analysis through simulated tweet streams, micro-batch processing, and an interactive analytics dashboard.

**Live Demo:** https://live-twitter-sentiment-streaming.vercel.app  
**GitHub Repository:** https://github.com/rishav-del/live-twitter-sentiment-streaming

---

## 1. Project Overview

This project demonstrates the concepts of real-time stream processing and sentiment analysis using a simulated Twitter data stream.

The application generates simulated tweets, processes incoming records in micro-batches, classifies their sentiment, and presents the results through an interactive dashboard.

It demonstrates important Big Data concepts such as streaming ingestion, schema validation, duplicate detection, sentiment classification, event-time windowing, watermarking, checkpointing, and real-time monitoring.

**Important:** The processing engine is a TypeScript implementation that mirrors Apache Spark Structured Streaming concepts inside the browser. It is not actual Apache Spark, and all tweets are simulated.

## 2. Objectives

- Generate and process a continuous stream of simulated tweets.
- Perform real-time sentiment classification.
- Identify positive, negative, and neutral opinions.
- Extract and analyse frequently used hashtags.
- Display streaming metrics through an interactive dashboard.
- Demonstrate micro-batch processing, event-time windows, and checkpointing.

## 3. Architecture

The application follows this processing pipeline:

```text
Tweet Producer
      |
      v
Incoming Queue
      |
      v
Streaming Engine
(Validation & Deduplication)
      |
      v
Sentiment Analysis
      |
      v
Windowed Aggregations
      |
      v
Checkpoint / State
      |
      v
Interactive Dashboard
```

## 4. Key Features

- Simulated tweet generation at regular intervals.
- Micro-batch processing with configurable batch limits.
- Schema validation and malformed-record rejection.
- Duplicate tweet detection.
- Text normalisation and hashtag extraction.
- Lexicon-based VADER-style sentiment scoring.
- Positive, negative, and neutral classification.
- One-minute tumbling event-time windows.
- Two-minute watermark handling.
- Browser localStorage checkpointing and recovery.
- Live sentiment charts and distribution visualisations.
- Top hashtag ranking.
- Recent processed tweets and micro-batch logs.
- Start, Pause, Resume, Stop, and Reset controls.

## 5. Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Application logic and streaming simulation |
| Vite | Development server and build tooling |
| Tailwind CSS | Styling and responsive design |
| TanStack Router | Application navigation |
| Recharts | Data visualisation |
| Lucide Icons | Interface icons |
| localStorage | Checkpoint persistence |

## 6. Sentiment Classification

The application uses a VADER-style lexicon-based approach to calculate sentiment scores between -1 and +1.

| Score | Classification |
|---|---|
| Score >= 0.05 | Positive |
| Score <= -0.05 | Negative |
| Between -0.05 and 0.05 | Neutral |

The sentiment calculation considers word weights, negation, and intensifiers.

## 7. Processing Configuration

| Parameter | Configuration |
|---|---|
| Producer interval | 2 seconds |
| Records per batch | 4–8 |
| Engine interval | 3 seconds |
| Maximum batches per micro-batch | 5 |
| Event-time window | 1 minute |
| Watermark | 2 minutes |
| Malformed record rate | Approximately 3% |
| Data source | Simulated tweets |

## 8. Project Structure

```text
live-twitter-sentiment-streaming/
│
├── public/
├── src/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

## 9. Installation and Setup

### Prerequisites

- Node.js
- npm
- Visual Studio Code (recommended)

### Clone the repository

```bash
git clone https://github.com/rishav-del/live-twitter-sentiment-streaming.git
```

### Navigate to the project directory

```bash
cd live-twitter-sentiment-streaming
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal to access the application.

## 10. Application Pages

**Dashboard:** Displays streaming status, sentiment statistics, charts, hashtag rankings, recent tweets, and micro-batch logs.

**Project Overview:** Explains the research context, objectives, project scope, applications, and limitations.

**Methodology:** Presents the processing architecture and explains the streaming pipeline, event-time windows, watermarks, and checkpointing.

**Viva Q&A:** Provides 15 questions and answers related to Big Data and the project implementation.

## 11. Limitations

- Tweets are generated from predefined simulated templates.
- The application does not connect to the real Twitter/X API.
- Sentiment classification may not accurately identify sarcasm, slang, or mixed opinions.
- The streaming engine runs inside a browser and does not provide distributed execution.
- Browser localStorage is not equivalent to a production fault-tolerant distributed checkpoint system.
- The application is intended for academic demonstration rather than production-scale processing.

## 12. Future Scope

- Integrate an authorised Twitter/X data source.
- Implement real Apache Spark Structured Streaming.
- Introduce distributed message ingestion using Apache Kafka.
- Improve sentiment analysis using machine learning and NLP models.
- Add persistent server-side storage.
- Support larger data streams and advanced analytics.

## 13. Research Context

**Real-Time Stream Processing with Spark Streaming: A Case Study on Twitter Data**

This project is an independent academic demonstration inspired by real-time Big Data stream-processing concepts.

Actual Apache Spark execution and real Twitter/X integration are not included in this implementation.

---

**Disclaimer:** Independent academic project, not affiliated with Twitter/X or Apache Spark. All tweets displayed in this application are simulated.
