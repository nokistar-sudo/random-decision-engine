# RANDOM

A clean, playful decision platform powered by the browser's cryptographic random number generator.

## Features
- Random Wheel
- Yes or No
- Random Generator (numbers, colors, letters, coin flip, teams)
- Daily Challenge
- This or That

## Run locally
Open `index.html` in a modern browser, or serve this folder with any static file server.

## Randomness
Selections use `crypto.getRandomValues()` with rejection sampling to avoid modulo bias. The wheel result is selected before its animation begins; the animation only visualizes that result. This is cryptographically strong pseudorandomness provided by the browser, not physical randomness.

No account or backend is required. The Daily Challenge preference is stored locally in the browser.
