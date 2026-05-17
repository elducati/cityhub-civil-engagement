import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String role;
  final String? name;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  const User({
    required this.id,
    required this.email,
    required this.role,
    this.name,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);

  bool get isAdmin => role == 'ADMIN';
  bool get isModerator => role == 'MODERATOR' || role == 'ADMIN';
}

@JsonSerializable()
class AuthResponse {
  final String token;
  final User user;

  const AuthResponse({required this.token, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class RegisterRequest {
  final String email;
  final String password;
  final String? name;

  const RegisterRequest({
    required this.email,
    required this.password,
    this.name,
  });

  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}
