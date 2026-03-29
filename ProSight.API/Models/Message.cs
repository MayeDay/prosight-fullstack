// Models/Message.cs
namespace ProSight.API.Models;

public class Message
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
}

// Models/Application.cs
public class Application
{
    public int Id { get; set; }

    // "pending" | "accepted" | "rejected"
    public string Status { get; set; } = "pending";
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public int ProId { get; set; }
    public User Pro { get; set; } = null!;
}

// Models/Review.cs
public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; }        // 1–5
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // Who wrote it
    public int ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;

    // Who received it (always the pro)
    public int RevieweeId { get; set; }
    public User Reviewee { get; set; } = null!;
}
