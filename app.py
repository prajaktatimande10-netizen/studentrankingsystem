from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configure SQLite database URI using SQLAlchemy standards
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the ORM engine
db = SQLAlchemy(app)

# ==========================================================================
# 1. ORM DATA MODELS (Replaces Raw SQL Table Schemas)
# ==========================================================================

class Student(db.Model):
    __tablename__ = 'students'
    
    student_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    academic_score = db.Column(db.Float, default=0.0)
    attendance_score = db.Column(db.Float, default=0.0)
    
    # FIX: Changed backref to back_populates for modern, safe serialization
    achievements = db.relationship('Achievement', back_populates='student', cascade='all, delete-orphan', lazy='joined')

class Achievement(db.Model):
    __tablename__ = 'achievements'
    
    achievement_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    points = db.Column(db.Float, default=0.0)
    
    # FIX: Explicitly link back without triggering recursion loops
    student = db.relationship('Student', back_populates='achievements')

# ==========================================================================
# 2. PAGE ROUTING PATHS (Webpage Views Layout Panel)
# ==========================================================================

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analysis')
def analysis_page():
    return render_template('analysis.html')

# NEW ROUTE: Academic Analytics Sub-View
@app.route('/academics')
def academics_hub():
    return render_template('academics.html')

# NEW ROUTE: Attendance Monitoring Threshold View
@app.route('/attendance')
def attendance_radar():
    return render_template('attendance.html')

# NEW ROUTE: Extracurricular Activity Footprint View
@app.route('/achievements')
def achievements_footprint():
    return render_template('achievements.html')

# ==========================================================================
# 3. ADVANCED BUSINESS LOGIC / SERVICE ENDPOINTS
# ==========================================================================

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    try:
        # Create an instance of the Student Object model
        new_student = Student(
            name=data['name'],
            roll_number=data['roll_number'],
            academic_score=float(data['academic_score']),
            attendance_score=float(data['attendance_score'])
        )
        db.session.add(new_student)
        db.session.commit() # Pure object-oriented commit! No SQL strings.
        return jsonify({"message": "Student registered successfully using ORM!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Roll number already exists or invalid data entry."}), 400

@app.route('/api/achievements', methods=['POST'])
def add_achievement():
    data = request.json
    
    # Use standard object querying to check for records
    student = Student.query.filter_by(roll_number=data['roll_number']).first()
    
    if not student:
        return jsonify({"error": "Student roll number not found!"}), 404
        
    new_achievement = Achievement(
        student_id=student.student_id,
        title=data['title'],
        category=data['category'],
        points=float(data['points'])
    )
    db.session.add(new_achievement)
    db.session.commit()
    return jsonify({"message": "Achievement tracked and matched successfully!"}), 201

@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    # Fetch all students cleanly
    all_students = Student.query.all()
    
    # Static Configuration Weights 
    w_academic = 0.50
    w_attendance = 0.20
    w_extra = 0.30
    
    ranked_list = []
    for s in all_students:
        # Bypassing object relationship tracking entirely to prevent any loop recursion:
        extra_pts_query = Achievement.query.filter_by(student_id=s.student_id).all()
        total_extra_pts = sum(ach.points for ach in extra_pts_query)
        
        # Calculate Multi-Attribute Composite Score
        final_score = (s.academic_score * w_academic) + \
                      (s.attendance_score * w_attendance) + \
                      (total_extra_pts * w_extra)
        
        ranked_list.append({
            "name": s.name,
            "roll_number": s.roll_number,
            "academic_score": s.academic_score,
            "attendance_score": s.attendance_score,
            "extracurricular_score": total_extra_pts,
            "final_score": round(final_score, 2)
        })
        
    # Order our list records descending based on evaluations
    ranked_list.sort(key=lambda x: x['final_score'], reverse=True)
    
    for index, record in enumerate(ranked_list):
        record['rank'] = index + 1
        
    return jsonify(ranked_list)


if __name__ == '__main__':
    # Context helper snippet to automatically provision standard SQLite structures from models
    with app.app_context():
        db.create_all()
    app.run(debug=True)