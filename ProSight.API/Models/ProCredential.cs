// Models/ProCredential.cs
namespace ProSight.API.Models;

public class ProCredential
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Trade         { get; set; } = string.Empty; // e.g. "Electrical"
    public string LicenseType   { get; set; } = string.Empty; // e.g. "Master Electrician"
    public string LicenseNumber { get; set; } = string.Empty; // required
    public string? IssuingState { get; set; }                 // e.g. "Texas"
}
