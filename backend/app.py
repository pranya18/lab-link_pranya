
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({"message": "LabLink Backend is running!"})


@app.route("/test-db")
def test_db():
    db = get_db_connection()

    if db:
        db.close()
        return jsonify({
            "success": True,
            "message": "Database connected!"
        })

    return jsonify({"success": False}), 500


# STUDENT AND FACULTY REGISTRATION
@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    department = data.get("department")

    if not name or not email or not password or not role:
        return jsonify({"message": "Please fill all required fields"}), 400

    if role not in ["student", "faculty"]:
        return jsonify({"message": "Invalid role"}), 400

    hashed_password = generate_password_hash(password)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({"message": "Email already registered"}), 409

        cursor.execute(
            """INSERT INTO users
            (name, email, password, role, department)
            VALUES (%s, %s, %s, %s, %s)""",
            (name, email, hashed_password, role, department)
        )

        db.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful!"
        }), 201

    except Exception as error:
        db.rollback()
        return jsonify({"message": str(error)}), 500

    finally:
        cursor.close()
        db.close()


# LOGIN
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        if user and check_password_hash(user["password"], password):
            return jsonify({
                "success": True,
                "message": "Login successful!",
                "user": {
                    "user_id": user["user_id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "department": user["department"]
                }
            })

        return jsonify({"message": "Invalid email or password"}), 401

    finally:
        cursor.close()
        db.close()
# GET ALL EQUIPMENT
@app.route("/equipment", methods=["GET"])
def get_equipment():

    db = get_db_connection()

    if not db:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM equipment WHERE status = 'active'"
        )

        equipment = cursor.fetchall()

        return jsonify({
            "success": True,
            "equipment": equipment
        })

    finally:
        cursor.close()
        db.close()



# =====================================
# STUDENT BOOKING API
# =====================================

@app.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}

    user_id = data.get("student_id")
    equipment_id = data.get("equipment_id")
    project_name = data.get("project_name", "College Laboratory Project")
    purpose = data.get("purpose", "")
    booking_date = data.get("booking_date")
    start_time = data.get("start_time", "10:00:00")
    end_time = data.get("end_time", "11:00:00")

    if not all([user_id, equipment_id, booking_date]):
        return jsonify({"message": "Fill all required fields"}), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id=%s AND role='student'",
            (user_id,)
        )
        if not cursor.fetchone():
            return jsonify({"message": "Student not found"}), 404

        cursor.execute(
            "SELECT equipment_id FROM equipment WHERE equipment_id=%s AND status='active'",
            (equipment_id,)
        )
        if not cursor.fetchone():
            return jsonify({"message": "Equipment not found"}), 404

        cursor.execute("""
            INSERT INTO bookings
            (user_id, equipment_id, project_name, purpose,
             booking_date, start_time, end_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, equipment_id, project_name, purpose,
              booking_date, start_time, end_time))

        db.commit()

        return jsonify({
            "success": True,
            "message": "Booking request submitted!",
            "booking_id": cursor.lastrowid
        }), 201

    except Exception as error:
        db.rollback()
        return jsonify({"message": str(error)}), 500

    finally:
        cursor.close()
        db.close()

@app.route("/faculty/bookings", methods=["GET"])
def faculty_bookings():
    faculty_id = request.args.get("faculty_id")

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id=%s AND role='faculty'",
            (faculty_id,)
        )

        if not cursor.fetchone():
            return jsonify({"message": "Faculty not found"}), 403

        cursor.execute("""
            SELECT b.booking_id, b.user_id, b.equipment_id,
                   b.project_name, b.purpose, b.booking_date,
                   TIME_FORMAT(b.start_time, '%H:%i:%s') AS start_time,
                   TIME_FORMAT(b.end_time, '%H:%i:%s') AS end_time,
                   b.status, b.created_at,
                   u.name AS student_name,
                   e.name AS equipment_name
            FROM bookings b
            JOIN users u ON b.user_id=u.user_id
            JOIN equipment e ON b.equipment_id=e.equipment_id
            ORDER BY b.created_at DESC
        """)

        bookings = cursor.fetchall()

        return jsonify({
            "success": True,
            "bookings": bookings
        })

    finally:
        cursor.close()
        db.close()


# FACULTY APPROVE OR REJECT BOOKING

@app.route("/bookings/<int:booking_id>/decision", methods=["POST"])
def booking_decision(booking_id):

    data = request.get_json() or {}

    faculty_id = data.get("faculty_id")
    decision = data.get("decision")

    if not faculty_id or decision not in ["approve", "reject"]:
        return jsonify({"message": "Invalid request"}), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id=%s AND role='faculty'",
            (faculty_id,)
        )

        if not cursor.fetchone():
            return jsonify({"message": "Faculty not found"}), 403

        cursor.execute(
            "SELECT status FROM bookings WHERE booking_id=%s",
            (booking_id,)
        )

        booking = cursor.fetchone()

        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        if booking["status"] != "pending":
            return jsonify({"message": "Booking already processed"}), 400

        status = "approved" if decision == "approve" else "rejected"

        cursor.execute(
            "UPDATE bookings SET status=%s WHERE booking_id=%s",
            (status, booking_id)
        )

        db.commit()

        return jsonify({
            "success": True,
            "message": f"Booking {status} successfully!"
        })

    except Exception as error:
        db.rollback()
        return jsonify({"message": str(error)}), 500

    finally:
        cursor.close()
        db.close()

# START FLASK SERVER

if __name__ == "__main__":
    app.run(debug=True)
