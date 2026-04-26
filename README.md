# RYMdle

RYMdle is a daily music guessing game inspired by other dle / daily games such as songless, scrandle, and wordle. Players are presented with pairs of albums and must choose the one with the higher RateYourMusic rating.

## Overview

Each day, you are given 5 rounds of head-to-head album comparisons. Your goal is to pick the higher-rated album in each pair.

At the end of the game, your score is revealed along with a breakdown of your picks and performance statistics.

## Features

- Daily puzzle format (same challenge for all players per day)
- 5-round gameplay with immediate feedback
- Persistent local statistics:
  - Games played
  - Win rate
  - Current streak
  - Max streak
- Result summary with per-round breakdown
- Shareable results (emoji grid format)
- Countdown timer to next puzzle
- Lightweight, responsive UI

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Framer Motion (animations)
- Tailwind CSS (styling)
- LocalStorage (state persistence)

## How It Works

Each day, a fixed set of albums is loaded and split into pairs. For each pair:

1. Two albums are displayed side by side.
2. The player selects the album they believe has the higher RateYourMusic score.
3. The correct rating is revealed after selection.
4. Score is updated and stored locally.

At the end of 5 rounds, the final score is calculated and stored in the player’s statistics.

## Persistence

RYMdle uses `localStorage` to store:

- Daily game progress
- Player statistics
- Past performance history

This ensures continuity across sessions while keeping the game fully client-side.

## Sharing

After completing a game, players can copy their results in a format like:

RYMdle 2026-04-25 4/5
🟩🟩🟥🟩🟩
https://rymdle.vercel.app