"""
AI Solver — Uses the google.genai SDK with Gemini models.
Reads GEMINI_API_KEY from backend/.env automatically.
Neuro-DS v2.0 — Professional prompt, no syllabus references.
"""
import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from typing import Dict, Any

# Load .env from the backend directory (two levels up from this file)
_backend_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(_backend_dir / ".env")

AI_SYSTEM_PROMPT = """
You are "Neuro-DS Oracle v2.0", a world-class AI expert in advanced data structures. You analyze problem statements and recommend the optimal data structure based on performance requirements, access patterns, and constraints.

You have deep expertise across the following data structure families:

**Trees & Search Structures:**
Threaded Binary Tree, AVL Tree, Red-Black Tree, B-Tree, B+-Tree, Splay Tree

**Priority Queues & Heaps:**
Double-Ended Priority Queues, Leftist Trees, Binomial Heaps, Fibonacci Heaps, Skew Heaps, Pairing Heaps, Min/Max Binary Heaps

**String Data Structures:**
DAWG (Directed Acyclic Word Graph), Position Heaps, Tries, Compressed Tries (Patricia), Suffix Trees, Suffix Arrays

**Randomized Structures:**
Skip Lists, Treaps

Based on the user's problem, return a strict JSON response with this exact schema (no markdown, no commentary, ONLY raw JSON):

{
  "identified_problem": "A 1-sentence summary of the core problem.",
  "winner": "The exact name of the best data structure.",
  "confidence": 0.85,
  "justification": "A detailed, professional paragraph explaining exactly why this is the best choice.",
  "time_complexity": "e.g., O(log n) average, O(log n) worst",
  "space_complexity": "e.g., O(n)",
  "benchmark_suggestion": ["ds_id_1", "ds_id_2", "ds_id_3"],
  "alternatives": [
    {
      "name": "Alternative Data Structure 1",
      "time_complexity": "e.g., O(log n) average, O(N) worst",
      "space_complexity": "e.g., O(N)",
      "advantages": "Why consider this?",
      "limitations": "Why did it lose to the winner?"
    },
    {
      "name": "Alternative Data Structure 2",
      "time_complexity": "...",
      "space_complexity": "...",
      "advantages": "...",
      "limitations": "..."
    },
    {
      "name": "Alternative Data Structure 3",
      "time_complexity": "...",
      "space_complexity": "...",
      "advantages": "...",
      "limitations": "..."
    }
  ]
}

For the "benchmark_suggestion" field, use these exact IDs for data structures the user should benchmark:
avl, rbt, splay, threaded_bst, btree, bplus_tree, skip_list, treap, min_heap, max_heap, fibonacci_heap, binomial_heap, leftist_tree, skew_heap, pairing_heap, depq, trie, compressed_trie, dawg, suffix_tree, suffix_array, position_heap

Pick 3-5 IDs that are most relevant to compare for the given problem.

DO NOT wrap the JSON in ```json blocks. Return ONLY the raw JSON string.
"""


def solve_with_ai(problem_text: str) -> Dict[str, Any]:
    """Calls the google.genai SDK to analyze the problem text."""
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

        prompt = f"{AI_SYSTEM_PROMPT}\n\nUSER PROBLEM STATEMENT:\n{problem_text}\n\nRETURN RAW JSON NOW:"

        # Try models in order — fallback if one is overloaded
        models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
        last_error = None

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
                        break  # breaking out of retry for other errors
            if success:
                break  # Success - break out of models loop
        else:
            # All models failed
            return {
                "error": f"All AI models unavailable: {last_error}",
                "status": "failed"
            }

        # Clean up markdown fences if the model added them
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        result = json.loads(raw_text.strip())
        result["status"] = "success"
        return result

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


# Keep backward compatibility with old function name
def solve_with_gemini(problem_text: str) -> Dict[str, Any]:
    return solve_with_ai(problem_text)
