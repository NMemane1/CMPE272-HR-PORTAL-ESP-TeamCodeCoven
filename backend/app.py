from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/healthz")
def health():
    return "ok", 200

@app.get("/api/employees")
def employees():
    return jsonify([{"emp_no": 10001, "first_name": "Mock", "last_name": "User"}])
