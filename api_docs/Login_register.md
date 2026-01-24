## Admin_load_predefined_users

POST /admin/load_user

with Authorization header

```jsonc
{"users": [
    {
        "student_id": "2022010001",
        "name": "User1",
        "register_password": "registration_password_use_learn_2018_to_distribute"
    } // User (invitation object)
]}
```

## Register

Use student ID and register password to register a user

POST /register

```jsonc
{
    "student_id": "2022010001",
    "rPassword": "registration_password_use_learn_2018_to_distribute",
    "email": "primary_email",
    "password": "frontend_sha256_of_input_password" // Backend should NOT store this directly
}
```

## Recover password

Use student ID and primary email to recover password, backend should send a reset link to the email address.

POST /recover_password

```jsonc
{
    "student_id": "2022010001",
    "email": "primary_email"
}
```

## Recover password phase 2

Use the token in the reset link to set a new password.

POST /recover_password/confirm

```jsonc
{
    "token": "token_in_reset_link",
    "newPassword": "frontend_sha256_of_input_password" // Backend should NOT store this directly
}
```

## Login

Token-based login with student ID and password / email and password.

POST /login

```jsonc
{
    "student_id": "2022010001",
    "password": "frontend_sha256_of_input_password"
}
```

When success, should return JWT token

## Get User info

To check if user logged in and get user info

GET /user

```jsonc
{
    "student_id": "2022010001",
    "email": "primary_email",
    "group": "unique_code_name" // null if not in any group
}
```

returns 401 if not logged in

# Grouping

(Leave this for later)