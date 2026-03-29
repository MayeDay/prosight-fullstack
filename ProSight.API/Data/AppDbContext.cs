// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using ProSight.API.Models;

namespace ProSight.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User>          Users          { get; set; }
    public DbSet<Project>       Projects       { get; set; }
    public DbSet<Message>       Messages       { get; set; }
    public DbSet<Application>   Applications   { get; set; }
    public DbSet<Review>        Reviews        { get; set; }
    public DbSet<ProCredential> ProCredentials { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── User ──────────────────────────────────────────────────────────
        b.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        b.Entity<User>()
            .Property(u => u.HourlyRate)
            .HasColumnType("decimal(10,2)");

        // ── Project ───────────────────────────────────────────────────────
        b.Entity<Project>()
            .Property(p => p.Budget)
            .HasColumnType("decimal(10,2)");

        b.Entity<Project>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.OwnedProjects)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Project>()
            .HasOne(p => p.Pro)
            .WithMany(u => u.OverseeingProjects)
            .HasForeignKey(p => p.ProId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── Message ───────────────────────────────────────────────────────
        b.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Application ───────────────────────────────────────────────────
        b.Entity<Application>()
            .HasOne(a => a.Pro)
            .WithMany(u => u.Applications)
            .HasForeignKey(a => a.ProId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Review ────────────────────────────────────────────────────────
        b.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany(u => u.ReviewsGiven)
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Review>()
            .HasOne(r => r.Reviewee)
            .WithMany(u => u.ReviewsReceived)
            .HasForeignKey(r => r.RevieweeId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── ProCredential ─────────────────────────────────────────────────
        b.Entity<ProCredential>()
            .HasOne(c => c.User)
            .WithMany(u => u.Credentials)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
