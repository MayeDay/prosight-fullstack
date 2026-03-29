// Models/User.cs
namespace ProSight.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // "homeowner" or "pro"
    public string Role { get; set; } = string.Empty;

    // Shared profile fields
    public string? Location { get; set; }

    // Pro-only profile fields (null for homeowners)
    public string? Profession { get; set; }
    public string? Bio { get; set; }
    public decimal? HourlyRate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<ProCredential> Credentials { get; set; } = new List<ProCredential>();
    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<Project> OverseeingProjects { get; set; } = new List<Project>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
}
