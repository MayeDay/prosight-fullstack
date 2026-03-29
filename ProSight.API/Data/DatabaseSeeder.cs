// Data/DatabaseSeeder.cs
using ProSight.API.Models;

namespace ProSight.API.Data;

public static class DatabaseSeeder
{
    public static void Seed(AppDbContext db)
    {
        // Only seed if the database is empty
        if (db.Users.Any()) return;

        // ── Users ─────────────────────────────────────────────────────────
        var marcus = new User
        {
            Name = "Marcus T.",
            Email = "marcus@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "homeowner"
        };
        var sandra = new User
        {
            Name = "Sandra K.",
            Email = "sandra@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "homeowner"
        };
        var dave = new User
        {
            Name = "Dave R.",
            Email = "dave@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "pro",
            Profession = "Licensed Electrician",
            Bio = "20 years in residential electrical. Love helping DIYers do it right the first time.",
            HourlyRate = 45
        };
        var elena = new User
        {
            Name = "Elena M.",
            Email = "elena@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = "pro",
            Profession = "General Contractor",
            Bio = "Full remodel experience. I can oversee almost any home project — framing, drywall, plumbing, finish work.",
            HourlyRate = 55
        };

        db.Users.AddRange(marcus, sandra, dave, elena);
        db.SaveChanges();

        // ── Projects ──────────────────────────────────────────────────────
        var p1 = new Project
        {
            Title = "Deck Framing & Ledger Board",
            Category = "Carpentry",
            Budget = 120,
            Description = "Building a 12×16 ft deck off the back door. Need a pro to review my framing plan.",
            Status = "open",
            OwnerId = marcus.Id
        };
        var p2 = new Project
        {
            Title = "Bathroom Tile Backsplash",
            Category = "Tiling",
            Budget = 80,
            Description = "Installing subway tile above vanity. First time tiling. Need oversight on layout and grouting.",
            Status = "open",
            OwnerId = marcus.Id
        };
        var p3 = new Project
        {
            Title = "Electrical Outlet Addition",
            Category = "Electrical",
            Budget = 150,
            Description = "Want to add two outlets in the garage. Need a licensed electrician to supervise and sign off.",
            Status = "in-progress",
            OwnerId = sandra.Id,
            ProId = dave.Id
        };

        db.Projects.AddRange(p1, p2, p3);
        db.SaveChanges();

        // ── Seed messages on the in-progress project ──────────────────────
        db.Messages.AddRange(
            new Message
            {
                ProjectId = p3.Id,
                SenderId = dave.Id,
                Text = "Hi Sandra! I reviewed your plan. Make sure to turn off the correct breaker and verify with a voltage tester.",
                SentAt = DateTime.UtcNow.AddHours(-2)
            },
            new Message
            {
                ProjectId = p3.Id,
                SenderId = sandra.Id,
                Text = "Perfect, thank you! Should I use 12-gauge or 14-gauge wire?",
                SentAt = DateTime.UtcNow.AddHours(-1)
            }
        );

        // ── Seed a review for Dave ────────────────────────────────────────
        db.Reviews.AddRange(
            new Review
            {
                ProjectId = p3.Id,
                ReviewerId = sandra.Id,
                RevieweeId = dave.Id,
                Rating = 5,
                Comment = "Dave was incredibly helpful and patient. Saved me from a potentially dangerous wiring mistake!"
            }
        );

        db.SaveChanges();
    }
}
