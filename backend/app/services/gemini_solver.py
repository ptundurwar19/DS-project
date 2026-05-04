"""
Gemini Solver — Uses the new google.genai SDK with gemini-2.5-flash model.
Reads GEMINI_API_KEY from backend/.env automatically.
"""
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from typing import Dict, Any

# Load .env from the backend directory (two levels up from this file)
_backend_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(_backend_dir / ".env")

SYLLABUS_CONTEXT = """
You are "Neuro-DS Oracle", an expert Data Structures AI designed to analyze problem statements and recommend the absolute best data structure from a specific Computer Science college syllabus.

Here is the ALLOWED SYLLABUS of Data Structures. You MUST choose the winner and alternatives ONLY from this list:

- Unit 1: Threaded Binary Tree, AVL Tree, Red-Black Tree, Heap Tree, Huffman Tree, B-Tree, B+-Tree, Splay Tree, Van Emde Boas Tree, Fusion Tree, Dynamic Finger Search Trees.
- Unit 2: Double Ended Priority queues, Leftist Trees, Binomial Heaps, Fibonacci Heaps, Skew Heaps, Pairing Heaps.
- Unit 3: DAWG, Position Heaps, Tries, Compressed Tries, Suffix Trees, Suffix Arrays.
- Unit 4: Skip Lists, Treap.
- Unit 5: Quad Trees, Octrees, Interval Trees, Segment Trees, Range Trees, Priority Search Trees, BSP Trees, R-Trees.
- Unit 6: Big Table, Disjoint Set Union-Find, Concurrent Data Structures, Succinct Dictionaries, Persistent Data Structures, Cache-Oblivious Data Structures.

Based on the user's problem statement, you must return a strict JSON response with the following schema exactly (no markdown, no commentary, just raw JSON):

{
  "identified_problem": "A 1-sentence summary of what the user is trying to solve.",
  "winner": "The EXACT name of the best data structure from the syllabus.",
  "justification": "A detailed, professional paragraph explaining exactly why this is the best choice for this specific problem.",
  "alternatives": [
    {
      "name": "Alternative Data Structure 1 (from syllabus)",
      "time_complexity": "e.g., O(log N) average, O(N) worst",
      "space_complexity": "e.g., O(N)",
      "advantages": "Why consider this?",
      "limitations": "Why did it lose to the winner?"
    },
    {
      "name": "Alternative Data Structure 2 (from syllabus)",
      "time_complexity": "...",
      "space_complexity": "...",
      "advantages": "...",
      "limitations": "..."
    },
    {
      "name": "Alternative Data Structure 3 (from syllabus)",
      "time_complexity": "...",
      "space_complexity": "...",
      "advantages": "...",
      "limitations": "..."
    }
  ]
}

DO NOT wrap the JSON in ```json blocks. Return ONLY the raw JSON string.
"""


def solve_with_gemini(problem_text: str) -> Dict[str, Any]:
    """Calls the new google.genai SDK to analyze the problem text against the syllabus."""
    raw_text = ""
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {
                "error": "GEMINI_API_KEY not found. Please add it to backend/.env file.",
                "status": "failed"
            }

        # Initialize the new client
        client = genai.Client(api_key=api_key)

        prompt = f"{SYLLABUS_CONTEXT}\n\nUSER PROBLEM STATEMENT:\n{problem_text}\n\nRETURN RAW JSON NOW:"

        # Try models in order — fallback if one is overloaded
        models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
        last_error = None
        import time

        for model_name in models:
            success = False
            for attempt in range(3):
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    raw_text = response.text.strip()
                    success = True
                    break  # Success — break out of retry loop
                except Exception as model_err:
                    last_error = model_err
                    if "503" in str(model_err) or "429" in str(model_err):
                        time.sleep(1)  # brief pause before retry
                    else:
                        break  # breaking out of retry for other errors (like 404)
            if success:
                break  # Success - break out of models loop
        else:
            # All models failed
            return {
                "error": f"All Gemini models unavailable: {last_error}",
                "status": "failed"
            }

        # Clean up markdown fences if the model added them
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        return json.loads(raw_text.strip())

    except json.JSONDecodeError:
        return {
            "error": f"AI returned invalid JSON. Raw output: {raw_text[:500]}",
            "status": "failed"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }
