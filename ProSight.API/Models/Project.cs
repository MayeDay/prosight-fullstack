// Models/Project.cs
namespace ProSight.API.Models;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }

    // "open" | "in-progress" | "completed"
    public string Status { get; set; } = "open";

    // Dual-approval completion — project completes when both are true
    public bool OwnerApprovedComplete { get; set; } = false;
    public bool ProApprovedComplete   { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK — homeowner who posted this
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // FK — pro assigned (null until accepted)
    public int? ProId { get; set; }
    public User? Pro { get; set; }

    // Navigation
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
