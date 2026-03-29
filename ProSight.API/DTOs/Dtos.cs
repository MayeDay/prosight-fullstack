// DTOs/AuthDtos.cs
namespace ProSight.API.DTOs;

// ── Credentials ───────────────────────────────────────────────────────────
public record CredentialRequest(
    string Trade,
    string LicenseType,
    string LicenseNumber,
    string? IssuingState
);

public record CredentialResponse(
    int    Id,
    string Trade,
    string LicenseType,
    string LicenseNumber,
    string? IssuingState
);

// ── Auth ──────────────────────────────────────────────────────────────────
public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string Role,           // "homeowner" | "pro"
    string? Profession,
    string? Bio,
    decimal? HourlyRate,
    List<CredentialRequest>? Credentials
);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    int Id,
    string Name,
    string Email,
    string Role,
    string? Location,
    string? Profession,
    string? Bio,
    decimal? HourlyRate,
    double? AverageRating,
    int ReviewCount,
    string Token,
    List<CredentialResponse> Credentials
);

public record UpdateProfileRequest(
    string Name,
    string Email,
    string? Location,
    string? Bio,
    string? Profession,
    decimal? HourlyRate,
    List<CredentialRequest>? Credentials
);

// ── Projects ──────────────────────────────────────────────────────────────
public record CreateProjectRequest(
    string Title,
    string Category,
    string Description,
    decimal Budget
);

public record ProjectResponse(
    int Id,
    string Title,
    string Category,
    string Description,
    decimal Budget,
    string Status,
    DateTime CreatedAt,
    UserSummary Owner,
    UserSummary? Pro,
    int ApplicationCount,
    bool CurrentUserApplied,
    bool OwnerApprovedComplete,
    bool ProApprovedComplete,
    bool ReviewedByOwner
);

// ── Pro public profile ────────────────────────────────────────────────────
public record CompletedProjectSummary(
    int Id,
    string Title,
    string Category,
    DateTime CreatedAt,
    UserSummary Owner
);

public record ProProfileResponse(
    UserSummary Pro,
    List<CredentialResponse> Credentials,
    List<CompletedProjectSummary> CompletedProjects,
    List<ReviewResponse> Reviews
);

// ── Messages ──────────────────────────────────────────────────────────────
public record SendMessageRequest(string Text);

public record MessageResponse(
    int Id,
    string Text,
    DateTime SentAt,
    UserSummary Sender
);

// ── Applications ──────────────────────────────────────────────────────────
public record ApplicationResponse(
    int Id,
    string Status,
    DateTime AppliedAt,
    UserSummary Pro
);

// ── Reviews ───────────────────────────────────────────────────────────────
public record CreateReviewRequest(int Rating, string Comment, int ProjectId);

public record ReviewResponse(
    int Id,
    int Rating,
    string Comment,
    DateTime CreatedAt,
    UserSummary Reviewer
);

// ── Shared ────────────────────────────────────────────────────────────────
public record UserSummary(
    int Id,
    string Name,
    string Role,
    string? Profession,
    decimal? HourlyRate,
    double? AverageRating,
    int ReviewCount
);
