import os
import json
import re
import spacy
import pdfplumber
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from groq import Groq

# ─────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB

# Load spaCy for text cleaning only
nlp = spacy.load("en_core_web_sm")

# Groq client — reads GROQ_API_KEY from environment variable
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


# ─────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(filepath):
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_text_from_docx(filepath):
    doc = Document(filepath)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()


def extract_text(filepath):
    ext = filepath.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    elif ext in {"doc", "docx"}:
        return extract_text_from_docx(filepath)
    return ""


def clean_text(text):
    """Clean and truncate resume text before sending to Groq."""
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    # Truncate to 3000 words to stay within Groq token limits
    words = text.split()
    if len(words) > 3000:
        text = " ".join(words[:3000])
    return text.strip()


def call_groq(prompt):
    """Send prompt to Groq Llama 3 and return response text."""
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert resume analyst and career coach with 15 years of experience. "
                    "You provide detailed, honest, and actionable feedback. "
                    "Always respond ONLY with valid JSON — no extra text, no markdown, no explanation outside the JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.4,
        max_tokens=1024,
    )
    return chat_completion.choices[0].message.content.strip()


def parse_json_response(raw):
    """Safely parse JSON from Groq response, stripping any accidental markdown fences."""
    raw = re.sub(r"```json|```", "", raw).strip()
    return json.loads(raw)


# ─────────────────────────────────────────
#  Route: POST /analyze
#  Receives: resume (file) + job_description (text)
#  Returns:  score, matched_keywords, missing_keywords, tips
# ─────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided."}), 400
    if "job_description" not in request.form or not request.form["job_description"].strip():
        return jsonify({"error": "No job description provided."}), 400

    file = request.files["resume"]
    job_desc = request.form["job_description"].strip()

    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file. Please upload a PDF or DOCX."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        resume_text = extract_text(filepath)
        if not resume_text:
            return jsonify({"error": "Could not extract text from the resume."}), 422

        resume_text = clean_text(resume_text)

        prompt = f"""
You are analyzing a resume against a job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_desc}

Analyze the resume against the job description and return a JSON object with exactly these fields:

{{
  "score": <integer 0-100 representing how well the resume matches the job description>,
  "matched_keywords": [<list of up to 15 relevant skills, technologies, or qualifications found in BOTH the resume and job description>],
  "missing_keywords": [<list of up to 10 important skills, technologies, or qualifications mentioned in the job description but MISSING from the resume>],
  "tips": [<list of 3 to 5 specific and actionable improvement suggestions tailored to this exact resume and job description>]
}}

Scoring guide:
- 80-100: Strong match, most requirements are met
- 60-79: Good match, minor gaps
- 40-59: Partial match, significant gaps
- 0-39: Weak match, major gaps

Be specific in your tips — reference actual content from the resume and job description.
Return ONLY the JSON object, nothing else.
"""

        raw = call_groq(prompt)
        result = parse_json_response(raw)

        return jsonify({
            "score":            int(result.get("score", 0)),
            "matched_keywords": result.get("matched_keywords", []),
            "missing_keywords": result.get("missing_keywords", []),
            "tips":             result.get("tips", []),
        })

    except json.JSONDecodeError:
        return jsonify({"error": "AI returned an unexpected response. Please try again."}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


# ─────────────────────────────────────────
#  Route: POST /score
#  Receives: resume (file)
#  Returns:  overall_score, categories, tips
# ─────────────────────────────────────────
@app.route("/score", methods=["POST"])
def score():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided."}), 400

    file = request.files["resume"]

    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file. Please upload a PDF or DOCX."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        resume_text = extract_text(filepath)
        if not resume_text:
            return jsonify({"error": "Could not extract text from the resume."}), 422

        resume_text = clean_text(resume_text)

        prompt = f"""
You are a professional resume reviewer. Carefully analyze the following resume and score it across 4 categories.

RESUME:
{resume_text}

Return a JSON object with exactly these fields:

{{
  "overall_score": <integer 0-100, weighted average of all 4 category scores>,
  "categories": [
    {{
      "label": "Formatting & Structure",
      "score": <integer 0-100>,
      "color": "#63d2aa"
    }},
    {{
      "label": "Clarity & Language",
      "score": <integer 0-100>,
      "color": "#4f8ef7"
    }},
    {{
      "label": "Impact & Achievements",
      "score": <integer 0-100>,
      "color": "#f5a623"
    }},
    {{
      "label": "ATS Compatibility",
      "score": <integer 0-100>,
      "color": "#a78bfa"
    }}
  ],
  "tips": [<list of 3 to 5 specific and actionable tips to improve this resume>]
}}

Scoring criteria:
- Formatting & Structure: Clear sections, consistent layout, contact info present, dates included, appropriate length
- Clarity & Language: Strong action verbs, no grammatical errors, concise bullet points, no first-person pronouns
- Impact & Achievements: Quantified results with numbers or percentages, specific accomplishments, outcome-focused language
- ATS Compatibility: Standard section headings, no tables or images, relevant keywords present, clean readable format

Be honest — do not inflate scores. Return ONLY the JSON object, nothing else.
"""

        raw = call_groq(prompt)
        result = parse_json_response(raw)

        return jsonify({
            "overall_score": int(result.get("overall_score", 0)),
            "categories":    result.get("categories", []),
            "tips":          result.get("tips", []),
        })

    except json.JSONDecodeError:
        return jsonify({"error": "AI returned an unexpected response. Please try again."}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


# ─────────────────────────────────────────
#  Run
# ─────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)