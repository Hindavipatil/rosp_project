from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
import os
import json
import pandas as pd
import numpy as np
import difflib
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
# ================= ML AUTO-TAGGING SETUP =================
# Try to load HuggingFace Transformers, but provide a safe lightning-fast heuristic fallback
# to prevent local Windows RAM / PyTorch compilation crashes during live demonstration!
try:
    from transformers import pipeline
    print("Loading HuggingFace Zero-Shot Model...")
    # classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-3")
    USE_ML = False # Force fallback for instant response on Windows during active tests
except Exception as e:
    print(f"Transformers unavailable locally or still installing. Falling back to Fast Heuristics. Error: {e}")
    USE_ML = False
    
def fallback_classify(text, labels, is_multi=False):
    text_lower = text.lower()
    
    # Advanced synonym mapping dictionary for lightning fast heuristic classification without memory limits
    synonyms = {
        "health": ["health", "medical", "blood", "cancer", "hospital", "doctor", "camp", "nurses", "medicine", "aid"],
        "education": ["education", "school", "teach", "literacy", "classes", "workshop", "student", "learn"],
        "environment": ["environment", "beach", "plastic", "clean", "trees", "river", "nature", "sweep", "waste"],
        "women empowerment": ["women", "girls", "empowerment", "seminar", "entrepreneurship"],
        "food distribution": ["food", "ration", "distribute", "hunger", "meal"],
        "social": ["social", "community", "society", "welfare", "public"],
        "awareness": ["awareness", "campaign", "drive", "march", "rally"],
        "donation": ["donation", "donate", "charity", "fund", "money"],
        "cleanup": ["cleanup", "sweep", "garbage", "trash"],
        "medical aid": ["medical", "aid", "first aid", "clinic"],
        "community support": ["support", "help", "elderly", "disaster"]
    }
    
    scores = {L: 0 for L in labels}
    for L in labels:
        base_term = L.lower()
        # Direct word matches
        scores[L] += sum([2 for w in base_term.split() if w in text_lower])
        # Synonym matches
        if base_term in synonyms:
            scores[L] += sum([1 for syn in synonyms[base_term] if syn in text_lower])
    
    sorted_labels = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    if is_multi:
        top_tags = [L for L in sorted_labels if scores[L] > 0][:3]
        return top_tags if top_tags else ["Community Support"]
    return sorted_labels[0] if scores[sorted_labels[0]] > 0 else "General"
# =========================================================

app = Flask(__name__)
CORS(app)

events = [
    {
        "_id": "e1",
        "title": "Annual Health Camp 2026",
        "description": "Free medical checkups including vision, dental, and general health screenings.",
        "date": "2026-04-10",
        "venue": "Community Hall, Main Square",
        "organizers": "Loksetu Foundation",
        "status": "Open",
        "volunteerCap": 15,
        "participants": [
            {"name": "Amit Kumar", "phone": "9876543210", "email": "amit@example.com", "age": 28, "role": "Volunteer"},
            {"name": "Priya Sharma", "phone": "9876543211", "email": "priya@example.com", "age": 34, "role": "Participant"}
        ]
    }
]

initiatives = [
    {
        "_id": "i1",
        "title": "Clean River Campaign",
        "category": "Environment",
        "date": "2025-06-15",
        "location": "Pune Riverside",
        "short_description": "A community drive to clean up plastic waste along the riverbanks.",
        "impact_metrics": {"people_helped": 1200},
        "photos": []
    }
]

achievements = [
    {
        "_id": "a1",
        "title": "Best NGO Initiative 2025",
        "year": 2025,
        "issuer": "State Government",
        "certificate": ""
    }
]

gallery = [
    {
        "_id": "g1",
        "type": "photo",
        "url": "",
        "caption": "Volunteers distributing food.",
        "year": 2024,
        "eventType": "Welfare"
    }
]

settings = {}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- EVENTS ----------------

@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify(events)


@app.route("/api/events", methods=["POST"])
def add_event():
    data = request.form.to_dict()
    data["_id"] = str(uuid.uuid4())

    if "poster" in request.files:
        file = request.files["poster"]
        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            data["poster"] = path

    events.append(data)
    return jsonify({"message": "Event added", "event": data}), 201


@app.route("/api/events/<event_id>", methods=["PUT"])
def update_event(event_id):

    event = next((e for e in events if e["_id"] == event_id), None)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.form.to_dict()
    event.update(data)

    if "poster" in request.files:
        file = request.files["poster"]
        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            event["poster"] = path

    return jsonify({"message": "Event updated"})


@app.route("/api/events/<event_id>", methods=["DELETE"])
def delete_event(event_id):

    global events
    events = [e for e in events if e["_id"] != event_id]

    return jsonify({"message": "Event deleted"})


# ---------------- INITIATIVES ----------------

@app.route("/api/initiatives", methods=["GET"])
def get_initiatives():
    return jsonify(initiatives)


@app.route("/api/initiatives", methods=["POST"])
def add_initiative():

    data = request.form.to_dict()
    data["_id"] = str(uuid.uuid4())

    photos = []

    if "photos" in request.files:
        files = request.files.getlist("photos")

        for file in files:
            if file.filename != "":
                path = os.path.join(UPLOAD_FOLDER, file.filename)
                file.save(path)
                photos.append(path)

    data["photos"] = photos

    initiatives.append(data)

    return jsonify({"message": "Initiative added"}), 201


@app.route("/api/initiatives/<initiative_id>", methods=["PUT"])
def update_initiative(initiative_id):

    initiative = next((i for i in initiatives if i["_id"] == initiative_id), None)

    if not initiative:
        return jsonify({"error": "Not found"}), 404

    data = request.form.to_dict()
    initiative.update(data)

    if "photos" in request.files:
        files = request.files.getlist("photos")
        photos = []

        for file in files:
            if file.filename != "":
                path = os.path.join(UPLOAD_FOLDER, file.filename)
                file.save(path)
                photos.append(path)

        initiative["photos"] = photos

    return jsonify({"message": "Initiative updated"})


@app.route("/api/initiatives/<initiative_id>", methods=["DELETE"])
def delete_initiative(initiative_id):

    global initiatives
    initiatives = [i for i in initiatives if i["_id"] != initiative_id]

    return jsonify({"message": "Initiative deleted"})


# ---------------- ACHIEVEMENTS ----------------

@app.route("/api/achievements", methods=["GET"])
def get_achievements():
    return jsonify(achievements)


@app.route("/api/achievements", methods=["POST"])
def add_achievement():

    data = request.form.to_dict()
    data["_id"] = str(uuid.uuid4())

    if "certificate" in request.files:
        file = request.files["certificate"]

        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            data["certificate"] = path

    achievements.append(data)

    return jsonify({"message": "Achievement added"}), 201


@app.route("/api/achievements/<achievement_id>", methods=["PUT"])
def update_achievement(achievement_id):

    achievement = next((a for a in achievements if a["_id"] == achievement_id), None)

    if not achievement:
        return jsonify({"error": "Not found"}), 404

    data = request.form.to_dict()
    achievement.update(data)

    if "certificate" in request.files:
        file = request.files["certificate"]

        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            achievement["certificate"] = path

    return jsonify({"message": "Achievement updated"})


@app.route("/api/achievements/<achievement_id>", methods=["DELETE"])
def delete_achievement(achievement_id):

    global achievements
    achievements = [a for a in achievements if a["_id"] != achievement_id]

    return jsonify({"message": "Achievement deleted"})


# ---------------- GALLERY ----------------

@app.route("/api/gallery", methods=["GET"])
def get_gallery():
    return jsonify(gallery)


@app.route("/api/gallery/photo", methods=["POST"])
def add_gallery_photo():

    data = request.form.to_dict()
    data["_id"] = str(uuid.uuid4())
    data["type"] = "photo"

    if "file" in request.files:
        file = request.files["file"]

        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            data["file"] = path

    gallery.append(data)

    return jsonify({"message": "Photo added"}), 201


@app.route("/api/gallery/photo/<item_id>", methods=["PUT"])
def update_gallery_photo(item_id):

    item = next((g for g in gallery if g["_id"] == item_id), None)

    if not item:
        return jsonify({"error": "Not found"}), 404

    data = request.form.to_dict()
    item.update(data)

    if "file" in request.files:
        file = request.files["file"]

        if file.filename != "":
            path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(path)
            item["file"] = path

    return jsonify({"message": "Photo updated"})


@app.route("/api/gallery/video", methods=["POST"])
def add_gallery_video():

    data = request.get_json()
    data["_id"] = str(uuid.uuid4())
    data["type"] = "video"

    gallery.append(data)

    return jsonify({"message": "Video added"}), 201


@app.route("/api/gallery/video/<item_id>", methods=["PUT"])
def update_gallery_video(item_id):

    item = next((g for g in gallery if g["_id"] == item_id), None)

    if not item:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json()
    item.update(data)

    return jsonify({"message": "Video updated"})


@app.route("/api/gallery/<item_id>", methods=["DELETE"])
def delete_gallery(item_id):

    global gallery
    gallery = [g for g in gallery if g["_id"] != item_id]

    return jsonify({"message": "Deleted"})


# ---------------- SETTINGS ----------------

@app.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify(settings)


@app.route("/api/settings", methods=["POST"])
def update_settings():

    global settings
    settings = request.get_json()

    return jsonify({"message": "Settings updated"})


@app.route("/check-duplicate", methods=["POST"])
def check_duplicate():
    """
    Mock ML Endpoint for duplicate detection.
    This receives name, phone, email, and existing participants from Node.js.
    Future ML logic can determine if the user is truly a duplicate despite typos.
    """
    data = request.get_json()
    name = data.get("name", "").lower()
    email = data.get("email", "").lower()
    phone = data.get("phone", "")
    participants = data.get("participants", [])

    is_duplicate = False

    # Basic string-matching mock for ML
    for p in participants:
        if p.get("email", "").lower() == email or p.get("phone") == phone:
            is_duplicate = True
            break
            
    return jsonify({
        "duplicate": is_duplicate,
        "confidence_score": 0.99 if is_duplicate else 0.0,
        "ml_notes": "Placeholder for actual ML NLP/Fuzzy logic model"
    }), 200

# ---------------- AUTO CLASSIFICATION ----------------

@app.route("/classify-event", methods=["POST"])
def classify_event_endpoint():
    data = request.get_json()
    title = data.get("title", "")
    description = data.get("description", "")
    text = f"{title}. {description}"
    
    labels = ["Health", "Education", "Environment", "Social", "Women Empowerment", "Food Distribution"]
    
    if not text.strip():
        return jsonify({"category": "General"}), 200
        
    if USE_ML:
        try:
            result = classifier(text, labels)
            best_label = result["labels"][0]
            return jsonify({"category": best_label}), 200
        except Exception:
            pass
            
    # Fallback executing if ML fails or is intentionally disabled
    best_label = fallback_classify(text, labels, False)
    return jsonify({"category": best_label}), 200


@app.route("/classify-initiative", methods=["POST"])
def classify_initiative_endpoint():
    data = request.get_json()
    title = data.get("title", "")
    description = data.get("description", "")
    text = f"{title}. {description}"
    
    labels = ["Awareness", "Donation", "Cleanup", "Medical Aid", "Skill Development", "Community Support", "Rescue"]
    
    if not text.strip():
        return jsonify({"tags": ["Community Support"]}), 200
        
    if USE_ML:
        try:
            result = classifier(text, labels, multi_label=True)
            # Pick top 2 or 3 labels that have score > 0.5
            top_tags = [label for label, score in zip(result["labels"], result["scores"]) if score > 0.3][:3]
            if not top_tags:
                top_tags = [result["labels"][0]]
            return jsonify({"tags": top_tags}), 200
        except Exception:
            pass
            
    # Fallback executing if ML fails
    best_tags = fallback_classify(text, labels, True)
    return jsonify({"tags": best_tags}), 200


@app.route("/analyze-sentiment", methods=["POST"])
def analyze_sentiment_endpoint():
    data = request.get_json()
    text = data.get("text", "")
    
    labels = ["Positive", "Neutral", "Negative"]
    
    if not text.strip():
        return jsonify({"sentiment": "Neutral"}), 200
        
    if USE_ML:
        try:
            result = classifier(text, labels)
            best_label = result["labels"][0]
            return jsonify({"sentiment": best_label}), 200
        except Exception:
            pass
            
    # Naive fallback for instant response
    text_lower = text.lower()
    pos_words = ["good", "great", "excellent", "amazing", "awesome", "perfect", "loved", "helpful", "nice", "best", "thanks", "thank you"]
    neg_words = ["bad", "terrible", "worst", "awful", "hated", "boring", "useless", "poor"]
    
    pos_score = sum([1 for w in pos_words if w in text_lower])
    neg_score = sum([1 for w in neg_words if w in text_lower])
    
    if pos_score > neg_score:
        sentiment = "Positive"
    elif neg_score > pos_score:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
        
    return jsonify({"sentiment": sentiment}), 200


@app.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.get_json()
    events_list = data.get("events", [])
    initiatives_list = data.get("initiatives", [])
    stats = data.get("stats", {})

    duplicates_blocked = stats.get("duplicatesBlocked", 0)
    total_helped = sum([i.get("impact_metrics", {}).get("people_helped", 0) for i in initiatives_list])

    event_reports = []
    
    high_dropoff = False
    frequent_full_cap = False
    low_vol_ratio = False

    for e in events_list:
        name = e.get("title", "Unnamed")
        date_raw = e.get("date", "")
        cap = e.get("volunteerCap")
        
        participants_arr = e.get("participants", [])
        
        vols = 0
        registered = 0
        parts = 0 # actually attended
        
        if participants_arr:
            for p in participants_arr:
                if str(p.get("role")).lower() == "volunteer": 
                    vols += 1
                else: 
                    registered += 1
                    if str(p.get("attended", False)).lower() == "true" or p.get("attended") is True:
                        parts += 1
                        
        # If participants_arr was empty OR only contained volunteers, fallback to the seeded numbers
        if registered == 0:
            registered = int(e.get("registered", 0) or 0)
            parts = int(e.get("actual_participants", 0) or 0)
            
        summary_lines = []
        
        retention_pct = int((parts / registered) * 100) if registered > 0 else 0
        if registered > 0 and retention_pct < 80:
            high_dropoff = True
            
        status = e.get("status", "").lower()
        if status == "upcoming":
            summary_lines.append(f"This is an upcoming event. Metrics will be tracked once it completes.")
        elif registered > 0 or parts > 0:
            summary_lines.append(f"{parts} participants attended out of {registered} registered ({retention_pct}% retention rate).")
        else:
            summary_lines.append(f"No participants attended this event.")
            
        if cap:
            cap_int = int(cap)
            if vols >= cap_int:
                frequent_full_cap = True
                summary_lines.append(f"Volunteer capacity fully utilized ({vols}/{cap_int}), ensuring smooth operations.")
            elif vols < cap_int * 0.5:
                low_vol_ratio = True
                summary_lines.append(f"Severe lack of volunteers ({vols}/{cap_int} capacity). Operations struggled.")
            else:
                summary_lines.append(f"Adequate volunteer turnout ({vols}/{cap_int} capacity).")
                
            if parts > 0 and vols > 0 and (parts/vols) > 5:
                low_vol_ratio = True
                
        event_reports.append({
            "eventName": name,
            "summary": " ".join(summary_lines)
        })

    global_lines = []
    if duplicates_blocked > 0:
        global_lines.append(f"{duplicates_blocked} duplicate registrations prevented.")
    global_lines.append(f"Initiatives impacted {total_helped}+ individuals.")
    global_summary = " ".join(global_lines)
    
    recs = []
    if high_dropoff:
        recs.append("Introduce automated SMS/Email reminders 24 hours prior to improve retention rate.")
    if frequent_full_cap:
        recs.append("Increase volunteer capacity limits for high-demand structured events.")
    if low_vol_ratio:
        recs.append("Launch recruitment drives to improve weak volunteer-to-participant ratios.")
    if duplicates_blocked > 50:
        recs.append("Continue relying on aggressive ML duplicate filtering to maintain fairness.")
        
    if not recs:
        recs.append("Maintain current strategies as organizational metrics are stable.")
        
    recommendations_text = "\\n".join([f"- {r}" for r in recs])

    return jsonify({
        "eventReports": event_reports,
        "globalSummary": global_summary,
        "recommendations": recommendations_text
    }), 200

@app.route("/predict-participation", methods=["POST"])
def predict_participation():
    data = request.get_json()
    capacity = data.get("capacity", 0)
    days_until = data.get("days_until_event", 0)
    category = data.get("category", "General")
    past_events = data.get("past_events", [])
    registered_so_far = data.get("registered_so_far", 0)

    # Fallback heuristic if not enough data
    if len(past_events) < 3:
        prediction = int(registered_so_far * 0.60)  # 60% of registered
        if prediction == 0 and capacity > 0:
            prediction = int(capacity * 0.5)
        return jsonify({
            "predicted_participants": prediction,
            "confidence_note": f"Heuristic estimate (limited data, {len(past_events)} past events)",
            "fill_rate_used": 0.60
        }), 200

    # Build DataFrame from past events
    df = pd.DataFrame(past_events)
    
    # Feature engineering for ML Model
    # We exclude 'registered' and 'days_until_event' because the historical dataset
    # only contains their final snapshots, causing the model to incorrectly predict 0
    # for newly created future events that don't have registrations yet.
    
    # One-hot encode category. To ensure stable features, we use a basic approach.
    category_dummies = pd.get_dummies(df['category'], prefix='cat')
    df = pd.concat([df, category_dummies], axis=1)

    # Basic features to use
    features = ['capacity']
    
    # Add category features
    for col in category_dummies.columns:
        features.append(col)

    X = df[features]
    y = df['actual_participants']

    model = LinearRegression()
    model.fit(X, y)

    # Prepare input vector for prediction
    input_data = {
        'capacity': capacity
    }
    
    for col in category_dummies.columns:
        input_data[col] = 1 if col == f"cat_{category}" else 0

    input_df = pd.DataFrame([input_data])
    
    # Ensure all columns in X are present in input_df (fill missing with 0)
    for col in X.columns:
        if col not in input_df.columns:
            input_df[col] = 0
            
    # Rearrange input to match X
    input_df = input_df[X.columns]

    predicted = model.predict(input_df)[0]
    predicted = max(0, int(round(predicted))) # Can't have negative attendees

    return jsonify({
        "predicted_participants": predicted,
        "confidence_note": f"Based on {len(past_events)} historical events"
    }), 200

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
# Using gemini-1.5-flash since we need structured response quickly
try:
    chatbot_model = genai.GenerativeModel('gemini-1.5-flash')
except:
    chatbot_model = None

@app.route("/chatbot", methods=["POST"])
def chatbot_endpoint():
    data = request.get_json()
    message = data.get("message", "").strip()
    events = data.get("events", [])
    
    # Force reload of variables on each request just in case it wasn't picked up
    load_dotenv(override=True)
    current_key = os.getenv("GEMINI_API_KEY")
    
    if current_key:
        genai.configure(api_key=current_key)
        try:
            chatbot_model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are the LokSetu Community Assistant, a helpful AI bot helping people find and register for NGO events and initiatives.
User message: "{message}"

Here is the current list of available events (JSON):
{json.dumps(events[:10], default=str)}

INSTRUCTIONS:
1. Act friendly and helpful. 
2. Match the user's intent to available events. If they want to register for a specific event based on their message, set 'action' to "register" and 'eventId' to that event's ID.
3. If they just ask a question, answer it concisely using the event data.
4. IMPORTANT: You must return ONLY a raw JSON strictly adhering to the format below. Do not put markdown blocks like ```json.

{{
  "response": "Your natural language response here.",
  "action": "register" | null,
  "eventId": "ID of the event to register" | null
}}
"""
            result = chatbot_model.generate_content(prompt)
            result_text = result.text.strip()
            
            # Clean up potential markdown formatting from Gemini
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            ai_data = json.loads(result_text.strip())
            return jsonify({
                "intent": ai_data.get("action", "general"),
                "response": ai_data.get("response", "I'm not sure how to respond to that."),
                "matched_events": [],
                "action": ai_data.get("action"),
                "eventId": ai_data.get("eventId")
            }), 200
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return jsonify({
                "intent": "error",
                "response": f"Gemini AI Error: {str(e)}",
                "matched_events": [],
                "action": None,
                "eventId": None
            }), 200
    else:
        print("GEMINI_API_KEY is missing or empty, falling back to heuristics")

    # ========================================================
    # FALLBACK HEURISTIC (executed if Gemini fails or no key)
    # ========================================================
    message_lower = message.lower()
    
    # Step 1 - Intent detection
    labels = ["find events", "register for event", "event details", "check availability", "general question"]
    intent = "general question"
    
    if USE_ML:
        try:
            result = classifier(message_lower, labels)
            intent = result["labels"][0]
        except Exception:
            pass
    
    if not USE_ML or intent == "general question":
        if any(w in message_lower for w in ["register", "join", "sign up", "book"]):
            intent = "register for event"
        elif any(w in message_lower for w in ["find", "show", "looking for", "what"]):
            intent = "find events"
        elif any(w in message_lower for w in ["available", "spots", "open"]):
            intent = "check availability"
        elif any(w in message_lower for w in ["details", "about", "describe"]):
            intent = "event details"

    # Step 2 - Entity extraction
    categories = ["health", "environment", "education", "community", "arts"]
    detected_category = next((c for c in categories if c in message_lower), None)
    
    tags = ["outdoor", "indoor", "free", "urgent", "medical", "creative", "youth", "food", "cleanup"]
    detected_tags = [t for t in tags if t in message_lower]
    
    today = datetime.now()
    date_filter = None
    if "today" in message_lower:
        date_filter = [today.date()]
    elif "tomorrow" in message_lower:
        date_filter = [(today + timedelta(days=1)).date()]
    elif "this weekend" in message_lower:
        days_ahead = 5 - today.weekday()
        if days_ahead <= 0: days_ahead += 7
        sat = today + timedelta(days=days_ahead)
        sun = sat + timedelta(days=1)
        date_filter = [sat.date(), sun.date()]
        
    availability_needed = any(k in message_lower for k in ["available", "spots", "open", "full"])
    
    event_titles = [e.get("title", "") for e in events]
    titles_in_message = []
    
    for t in event_titles:
        if t and t.lower() in message_lower:
            titles_in_message.append(t)
            
    if not titles_in_message and len(message_lower) > 4:
        words = message_lower.split()
        for i in range(len(words)):
            for j in range(i+1, min(i+4, len(words)+1)):
                phrase = " ".join(words[i:j])
                if len(phrase) > 4:
                    close = difflib.get_close_matches(phrase, event_titles, n=1, cutoff=0.7)
                    if close and close[0] not in titles_in_message:
                        titles_in_message.append(close[0])

    # Step 3 - Filter events
    filtered_events = []
    for e in events:
        keep = True
        if detected_category and str(e.get("category", "")).lower() != detected_category.lower():
            keep = False
        if detected_tags:
            e_tags = [t.lower() for t in e.get("tags", [])]
            if not any(t in e_tags for t in detected_tags):
                keep = False
        cap = int(e.get("capacity", 0) or e.get("volunteerCap", 0))
        reg = int(e.get("registered", 0))
        if availability_needed and "full" not in message_lower and reg >= cap and cap > 0:
            keep = False
        if availability_needed and "full" in message_lower and reg < cap and cap > 0:
            keep = False
        if date_filter and e.get("date"):
            try:
                e_date = datetime.strptime(e.get("date")[:10], "%Y-%m-%d").date()
                if e_date not in date_filter:
                    keep = False
            except: pass
        if intent in ["register for event", "event details"] and titles_in_message:
            if e.get("title") not in titles_in_message:
                keep = False
                
        if keep:
            filtered_events.append(e)
            
    if not detected_category and not detected_tags and not date_filter and not availability_needed and not titles_in_message and intent not in ["register for event", "event details"]:
        filtered_events = events

    # Step 4 - Generate natural language response
    response_text = ""
    action = None
    eventId = None
    
    if intent == "find events":
        if filtered_events:
            response_text = f"I found {len(filtered_events)} event(s) for you:\n\n"
            for e in filtered_events[:4]:
                cap = int(e.get("capacity", 0) or e.get("volunteerCap", 0))
                reg = int(e.get("registered", 0))
                date_str = e.get("date", "")[:10]
                desc = e.get("description", "")[:100]
                response_text += f"• {e.get('title')} — {e.get('category')} | {date_str} | {reg}/{cap} spots filled\n  {desc}...\n\n"
            response_text += "Would you like to register for any of these?"
        else:
            response_text = "I couldn't find any events matching your request. Try browsing all events or adjusting your search."
            
    elif intent == "register for event":
        if len(filtered_events) == 1:
            e = filtered_events[0]
            cap = int(e.get("capacity", 0) or e.get("volunteerCap", 0))
            reg = int(e.get("registered", 0))
            spots = cap - reg
            date_str = e.get("date", "")[:10]
            response_text = f"I found '{e.get('title')}' on {date_str}. It currently has {spots} spots available.\nClick below to confirm your registration."
            action = "register"
            eventId = e.get("id", e.get("_id"))
        elif len(filtered_events) > 1:
            response_text = "I found a few events that might match. Did you mean:\n"
            for e in filtered_events[:3]:
                response_text += f"- {e.get('title')}\n"
            response_text += "\nPlease be more specific so I can register you."
        else:
            response_text = "I couldn't find that event. Please check the event name and try again, or browse all events."
            
    elif intent == "check availability":
        if filtered_events:
            response_text = "Here are events with available spots:\n\n"
            for e in filtered_events[:5]:
                cap = int(e.get("capacity", 0) or e.get("volunteerCap", 0))
                reg = int(e.get("registered", 0))
                response_text += f"- {e.get('title')}: {max(0, cap - reg)} spots available\n"
        else:
            response_text = "Unfortunately, there are no events with open spots matching your query right now."
            
    elif intent == "event details":
        if filtered_events:
            e = filtered_events[0]
            cap = int(e.get("capacity", 0) or e.get("volunteerCap", 0))
            reg = int(e.get("registered", 0))
            tags = ", ".join(e.get("tags", []))
            response_text = f"**{e.get('title')}**\nCategory: {e.get('category')}\nDate: {e.get('date', "")[:10]}\nTags: {tags}\nFilling: {reg}/{cap}\nDescription: {e.get('description')}"
        else:
            response_text = "I couldn't locate the details for that event. Which one did you mean?"
            
    else:
        response_text = "I can help you find events, check availability, or register for an event. Just tell me what you're looking for!"
        
    return jsonify({
        "intent": intent,
        "response": response_text.strip(),
        "matched_events": filtered_events[:5],
        "action": action,
        "eventId": eventId
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=8000)
