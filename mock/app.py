from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import hashlib
import datetime
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SECRET_KEY = "your-secret-key-for-testing"
app.config["SECRET_KEY"] = SECRET_KEY

# In-memory storage for testing
users_db = {
    "1": {
        "name": "Test User",
        "email": "i@aajax.top",
        "password_hash": hashlib.sha256("1".encode()).hexdigest(),
        "registration_password": "1",
        "group": None,
    },
    "2": {
        "name": "T2",
        "email": "a@b.com",
        "password_hash": hashlib.sha256("2".encode()).hexdigest(),
        "registration_password": "2",
        "group": None,
    },
}  # {student_id: {name, email, password_hash, registration_password, group}}
predefined_users = {}  # {student_id: registration_password}

# Group storage
groups_db = {}  # {code_name: {name, code_name, leader, members[]}}
invitations_db = {}  # {token: {group_code_name, inviter_id, invitee_id, type: 'invite'}}
join_requests_db = {}  # {token: {group_code_name, requester_id, type: 'join'}}

# Default admin registration password
DEFAULT_REGISTRATION_PASSWORD = (
    "registration_password_use_learn_2018_to_distribute"
)


def hash_password(password):
    """Hash password using SHA-256 (matching frontend)"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(student_id):
    """Generate JWT token"""
    payload = {
        "student_id": student_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def generate_notification_token(data):
    """Generate notification token for invitations and join requests"""
    import uuid

    token = str(uuid.uuid4())
    return token


def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["student_id"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Mock backend is running"})


@app.route("/admin/load_user", methods=["POST"])
def admin_load_users():
    """Admin endpoint to load predefined users"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    admin_student_id = verify_token(token)
    if not admin_student_id:
        return jsonify({"msg": "Invalid token"}), 401

    data = request.get_json()
    if not data or "users" not in data:
        return jsonify({"msg": "Users data required"}), 400

    for user in data["users"]:
        student_id = user.get("student_id")
        register_password = user.get("register_password")

        if student_id and register_password:
            predefined_users[student_id] = register_password

    return jsonify({"msg": f"Loaded {len(data['users'])} users", "ver": "1.0"})


@app.route("/register", methods=["POST"])
def register():
    """User registration endpoint"""
    data = request.get_json()

    # Validate required fields
    required_fields = ["student_id", "rPassword", "email", "password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing required field: {field}"}), 400

    student_id = data["student_id"]
    rPassword = data["rPassword"]
    email = data["email"]
    password = data["password"]  # Already hashed by frontend
    name = data.get(
        "name", f"User {student_id}"
    )  # Optional name field with default

    # Check if user already exists
    if student_id in users_db:
        return jsonify({"msg": "User already exists"}), 400

    # Validate registration password
    valid_rPassword = predefined_users.get(
        student_id, DEFAULT_REGISTRATION_PASSWORD
    )
    if rPassword != valid_rPassword:
        return jsonify({"msg": "Invalid registration password"}), 400

    # Store user (password is already hashed by frontend)
    users_db[student_id] = {
        "name": name,
        "email": email,
        "password_hash": password,  # Frontend already hashed it
        "registration_password": rPassword,
        "group": None,
    }

    return jsonify({"msg": "Registration successful", "ver": "1.0"})


@app.route("/login", methods=["POST"])
def login():
    """User login endpoint"""
    data = request.get_json()

    # Validate required fields
    if "student_id" not in data or "password" not in data:
        return jsonify({"msg": "Missing student_id or password"}), 400

    student_id = data["student_id"]
    password = data["password"]  # Already hashed by frontend

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "Invalid credentials"}), 401

    user = users_db[student_id]

    # Verify password (comparing hashed passwords)
    if user["password_hash"] != password:
        return jsonify({"msg": "Invalid credentials"}), 401

    # Generate token
    token = generate_token(student_id)

    return jsonify({"token": token, "msg": "Login successful"})


@app.route("/user", methods=["GET"])
def get_user_info():
    """Get user information endpoint"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    student_id = verify_token(token)
    if not student_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    user = users_db[student_id]

    return jsonify(
        {
            "student_id": student_id,
            "name": user.get("name", f"User {student_id}"),
            "email": user["email"],
            "group": user.get("group"),
        }
    )


@app.route("/recover_password", methods=["POST"])
def recover_password():
    """Password recovery endpoint (phase 1)"""
    data = request.get_json()

    if "student_id" not in data or "email" not in data:
        return jsonify({"msg": "Missing student_id or email"}), 400

    student_id = data["student_id"]
    email = data["email"]

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    user = users_db[student_id]
    if user["email"] != email:
        return jsonify({"msg": "Email does not match"}), 400

    # In a real app, you would send an email here
    # For testing, we'll just return a mock token
    reset_token = (
        f"reset_token_for_{student_id}_{datetime.datetime.utcnow().timestamp()}"
    )

    return jsonify(
        {
            "msg": "Reset link sent to email",
            "reset_token": reset_token,  # Only for testing - don't do this in production!
            "ver": "1.0",
        }
    )


@app.route("/recover_password/confirm", methods=["POST"])
def recover_password_confirm():
    """Password recovery endpoint (phase 2)"""
    data = request.get_json()

    if "token" not in data or "newPassword" not in data:
        return jsonify({"msg": "Missing token or newPassword"}), 400

    token = data["token"]
    new_password = data["newPassword"]  # Already hashed by frontend

    # In a real app, you would validate the reset token properly
    # For testing, we'll extract student_id from the mock token
    if not token.startswith("reset_token_for_"):
        return jsonify({"msg": "Invalid reset token"}), 400

    try:
        student_id = token.split("_")[3]  # Extract student_id from mock token
    except:
        return jsonify({"msg": "Invalid reset token"}), 400

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    # Update password
    users_db[student_id]["password_hash"] = new_password

    return jsonify({"msg": "Password reset successful", "ver": "1.0"})


@app.route("/admin/group_assign", methods=["POST"])
def admin_group_assign():
    """Admin endpoint to assign user to group"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    admin_student_id = verify_token(token)
    if not admin_student_id:
        return jsonify({"msg": "Invalid token"}), 401

    # In a real system, you'd check if user has admin privileges
    # For this mock, we'll assume any authenticated user can be admin

    data = request.get_json()
    if not data or "group_code_name" not in data or "student_id" not in data:
        return jsonify(
            {"msg": "Missing required fields: group_code_name, student_id"}
        ), 400

    group_code_name = data["group_code_name"]
    student_id = data["student_id"]

    # Check if group exists
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group not found"}), 404

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    # Check if user is already in a group
    if users_db[student_id].get("group"):
        return jsonify({"msg": "User already in a group"}), 400

    # Add user to group
    groups_db[group_code_name]["members"].append(student_id)
    users_db[student_id]["group"] = group_code_name

    return jsonify(
        {
            "msg": "User assigned to group successfully",
            "group": groups_db[group_code_name],
        }
    )


@app.route("/group/join", methods=["POST"])
def join_group():
    """Request to join a group"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    student_id = verify_token(token)
    if not student_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    data = request.get_json()
    if not data or "group_code_name" not in data:
        return jsonify({"msg": "Missing required field: group_code_name"}), 400

    group_code_name = data["group_code_name"]

    # Check if group exists
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group not found"}), 404

    # Check if user exists and not in a group
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    if users_db[student_id].get("group"):
        return jsonify({"msg": "User already in a group"}), 400

    # Check pending join requests for this user (max 5)
    pending_requests = [
        req
        for req in join_requests_db.values()
        if req["requester_id"] == student_id and req["type"] == "join"
    ]
    if len(pending_requests) >= 5:
        return jsonify({"msg": "User has too many pending join requests"}), 400

    # Generate join request token
    join_token = generate_notification_token({})

    # Store join request
    join_requests_db[join_token] = {
        "group_code_name": group_code_name,
        "requester_id": student_id,
        "type": "join",
    }

    return jsonify(
        {
            "msg": "Join request sent successfully",
            "join_token": join_token,  # For testing - normally sent via email to leader
        }
    )


@app.route("/group/join/accept", methods=["POST"])
def accept_join_request():
    """Accept join request (leader only)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    leader_id = verify_token(token)
    if not leader_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"msg": "Missing required field: token"}), 400

    join_token = data["token"]

    # Check if join request exists
    if join_token not in join_requests_db:
        return jsonify({"msg": "Invalid join request token"}), 400

    join_request = join_requests_db[join_token]
    if join_request["type"] != "join":
        return jsonify({"msg": "Invalid join request token"}), 400

    group_code_name = join_request["group_code_name"]
    requester_id = join_request["requester_id"]

    # Check if group exists and user is leader
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group no longer exists"}), 404

    group = groups_db[group_code_name]
    if group["leader"] != leader_id:
        return jsonify(
            {"msg": "Only group leader can accept join requests"}
        ), 403

    # Check if requester still exists and not in a group
    if requester_id not in users_db:
        return jsonify({"msg": "Requester not found"}), 404

    if users_db[requester_id].get("group"):
        return jsonify({"msg": "Requester already in a group"}), 400

    # Add user to group
    group["members"].append(requester_id)
    users_db[requester_id]["group"] = group_code_name

    # Remove join request
    del join_requests_db[join_token]

    return jsonify(
        {"msg": "Join request accepted successfully", "group": group}
    )


@app.route("/group/join/reject", methods=["POST"])
def reject_join_request():
    """Reject join request (leader only)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    leader_id = verify_token(token)
    if not leader_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"msg": "Missing required field: token"}), 400

    join_token = data["token"]

    # Check if join request exists
    if join_token not in join_requests_db:
        return jsonify({"msg": "Invalid join request token"}), 400

    join_request = join_requests_db[join_token]
    if join_request["type"] != "join":
        return jsonify({"msg": "Invalid join request token"}), 400

    group_code_name = join_request["group_code_name"]

    # Check if group exists and user is leader
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group no longer exists"}), 404

    group = groups_db[group_code_name]
    if group["leader"] != leader_id:
        return jsonify(
            {"msg": "Only group leader can reject join requests"}
        ), 403

    # Remove join request
    del join_requests_db[join_token]

    return jsonify({"msg": "Join request rejected successfully"})


@app.route("/group/invite", methods=["POST"])
def invite_user():
    """Invite a user to join group"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    student_id = verify_token(token)
    if not student_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    data = request.get_json()
    if (
        not data
        or "group_code_name" not in data
        or "invitee_student_id" not in data
    ):
        return jsonify(
            {
                "msg": "Missing required fields: group_code_name, invitee_student_id"
            }
        ), 400

    group_code_name = data["group_code_name"]
    invitee_student_id = data["invitee_student_id"]

    # Check if group exists
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group not found"}), 404

    group = groups_db[group_code_name]

    # Check if user is the leader of the group
    if group["leader"] != student_id:
        return jsonify({"msg": "Only group leader can invite users"}), 403

    # Check if invitee exists
    if invitee_student_id not in users_db:
        return jsonify({"msg": "Invitee not found"}), 404

    # Check if invitee is already in a group
    if users_db[invitee_student_id].get("group"):
        return jsonify({"msg": "Invitee already in a group"}), 400

    # Check pending invitations for this user (max 5)
    pending_invitations = [
        inv
        for inv in invitations_db.values()
        if inv["invitee_id"] == invitee_student_id and inv["type"] == "invite"
    ]
    if len(pending_invitations) >= 5:
        return jsonify({"msg": "Invitee has too many pending invitations"}), 400

    # Generate invitation token
    invitation_token = generate_notification_token({})

    # Store invitation
    invitations_db[invitation_token] = {
        "group_code_name": group_code_name,
        "inviter_id": student_id,
        "invitee_id": invitee_student_id,
        "type": "invite",
    }

    return jsonify(
        {
            "msg": "Invitation sent successfully",
            "invitation_token": invitation_token,  # For testing - normally sent via email
        }
    )


@app.route("/group/invite/accept", methods=["POST"])
def accept_invitation():
    """Accept group invitation"""
    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"msg": "Missing required field: token"}), 400

    token = data["token"]

    # Check if invitation exists
    if token not in invitations_db:
        return jsonify({"msg": "Invalid invitation token"}), 400

    invitation = invitations_db[token]
    if invitation["type"] != "invite":
        return jsonify({"msg": "Invalid invitation token"}), 400

    invitee_id = invitation["invitee_id"]
    group_code_name = invitation["group_code_name"]

    # Check if group still exists
    if group_code_name not in groups_db:
        return jsonify({"msg": "Group no longer exists"}), 404

    # Check if invitee still exists and not in a group
    if invitee_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    if users_db[invitee_id].get("group"):
        return jsonify({"msg": "User already in a group"}), 400

    # Add user to group
    groups_db[group_code_name]["members"].append(invitee_id)
    users_db[invitee_id]["group"] = group_code_name

    # Remove invitation
    del invitations_db[token]

    return jsonify(
        {
            "msg": "Invitation accepted successfully",
            "group": groups_db[group_code_name],
        }
    )


@app.route("/group/invite/reject", methods=["POST"])
def reject_invitation():
    """Reject group invitation"""
    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"msg": "Missing required field: token"}), 400

    token = data["token"]

    # Check if invitation exists
    if token not in invitations_db:
        return jsonify({"msg": "Invalid invitation token"}), 400

    invitation = invitations_db[token]
    if invitation["type"] != "invite":
        return jsonify({"msg": "Invalid invitation token"}), 400

    # Remove invitation
    del invitations_db[token]

    return jsonify({"msg": "Invitation rejected successfully"})


@app.route("/group/create", methods=["POST"])
def create_group():
    """Create a new group"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"msg": "Authorization required"}), 401

    token = auth_header.split(" ")[1]
    student_id = verify_token(token)
    if not student_id:
        return jsonify({"msg": "Invalid or expired token"}), 401

    # Check if user exists
    if student_id not in users_db:
        return jsonify({"msg": "User not found"}), 404

    # Check if user is already in a group
    if users_db[student_id].get("group"):
        return jsonify({"msg": "User already in a group"}), 400

    data = request.get_json()
    if not data or "name" not in data or "code_name" not in data:
        return jsonify({"msg": "Missing required fields: name, code_name"}), 400

    name = data["name"]
    code_name = data["code_name"]

    # Check if group code_name already exists
    if code_name in groups_db:
        return jsonify({"msg": "Group code name already exists"}), 400

    # Create group
    groups_db[code_name] = {
        "name": name,
        "code_name": code_name,
        "leader": student_id,
        "members": [student_id],
    }

    # Update user's group
    users_db[student_id]["group"] = code_name

    return jsonify(
        {
            "msg": "Group created successfully",
            "group": {
                "name": name,
                "code_name": code_name,
                "leader": student_id,
            },
        }
    )


@app.route("/users", methods=["GET"])
def list_users():
    """List users with pagination"""
    # Get pagination parameters
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))

    # Convert users to list format
    users_list = []
    for student_id, user_data in users_db.items():
        users_list.append(
            {
                "student_id": student_id,
                "name": user_data.get("name", f"User {student_id}"),
                "group": user_data.get("group"),
            }
        )

    # Calculate pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_users = users_list[start_idx:end_idx]

    return jsonify(
        {"page": page, "page_size": page_size, "users": paginated_users}
    )


@app.route("/groups", methods=["GET"])
def list_groups():
    """List groups with pagination"""
    # Get pagination parameters
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))

    # Convert groups to list format
    groups_list = []
    for code_name, group_data in groups_db.items():
        leader_id = group_data["leader"]
        leader_name = users_db.get(leader_id, {}).get(
            "name", f"User {leader_id}"
        )

        members_list = []
        for member_id in group_data["members"]:
            member_name = users_db.get(member_id, {}).get(
                "name", f"User {member_id}"
            )
            members_list.append({"student_id": member_id, "name": member_name})

        groups_list.append(
            {
                "name": group_data["name"],
                "code_name": code_name,
                "leader": {"student_id": leader_id, "name": leader_name},
                "members": members_list,
            }
        )

    # Calculate pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_groups = groups_list[start_idx:end_idx]

    return jsonify(
        {"page": page, "page_size": page_size, "groups": paginated_groups}
    )


@app.route("/debug/users", methods=["GET"])
def debug_users():
    """Debug endpoint to see registered users and groups"""
    return jsonify(
        {
            "users": {
                k: {**v, "password_hash": "***"} for k, v in users_db.items()
            },
            "predefined_users": predefined_users,
            "groups": groups_db,
            "invitations": invitations_db,
            "join_requests": join_requests_db,
        }
    )


if __name__ == "__main__":
    # Add some default predefined users for testing
    predefined_users.update(
        {
            "2022010001": DEFAULT_REGISTRATION_PASSWORD,
            "2022010002": DEFAULT_REGISTRATION_PASSWORD,
            "test001": "test_password",
        }
    )

    print("Mock Backend Starting...")
    print(f"Default registration password: {DEFAULT_REGISTRATION_PASSWORD}")
    print("Available predefined users:", list(predefined_users.keys()))
    print("Server running on http://localhost:8080")

    app.run(debug=True, host="0.0.0.0", port=8080)
