// Controllers/ProjectsController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProSight.API.Data;
using ProSight.API.DTOs;
using ProSight.API.Models;

namespace ProSight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProjectsController(AppDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET /api/projects — all open projects (for pros to browse) ────────
    [HttpGet]
    public async Task<ActionResult<List<ProjectResponse>>> GetAll([FromQuery] string? status)
    {
        var query = _db.Projects
            .Include(p => p.Owner)
            .Include(p => p.Pro).ThenInclude(u => u!.ReviewsReceived)
            .Include(p => p.Applications)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        var projects = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        var reviewed = await ReviewedProjectIds();

        return Ok(projects.Select(p => ToResponse(p, reviewed)).ToList());
    }

    // ── GET /api/projects/mine — current user's projects ─────────────────
    [HttpGet("mine")]
    public async Task<ActionResult<List<ProjectResponse>>> GetMine()
    {
        var uid = CurrentUserId;
        var role = User.FindFirstValue(ClaimTypes.Role);

        var query = _db.Projects
            .Include(p => p.Owner)
            .Include(p => p.Pro).ThenInclude(u => u!.ReviewsReceived)
            .Include(p => p.Applications)
            .AsQueryable();

        query = role == "homeowner"
            ? query.Where(p => p.OwnerId == uid)
            : query.Where(p => p.ProId == uid);

        var projects = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        var reviewed = await ReviewedProjectIds();

        return Ok(projects.Select(p => ToResponse(p, reviewed)).ToList());
    }

    // ── GET /api/projects/{id} ────────────────────────────────────────────
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponse>> GetById(int id)
    {
        var p = await _db.Projects
            .Include(p => p.Owner)
            .Include(p => p.Pro).ThenInclude(u => u!.ReviewsReceived)
            .Include(p => p.Applications)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return NotFound();
        var reviewed = await ReviewedProjectIds();
        return Ok(ToResponse(p, reviewed));
    }

    // ── POST /api/projects — homeowner creates a project ─────────────────
    [HttpPost]
    [Authorize(Roles = "homeowner")]
    public async Task<ActionResult<ProjectResponse>> Create(CreateProjectRequest req)
    {
        var project = new Project
        {
            Title       = req.Title,
            Category    = req.Category,
            Description = req.Description,
            Budget      = req.Budget,
            OwnerId     = CurrentUserId
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        // Reload with navigation props
        return await GetById(project.Id);
    }

    // ── POST /api/projects/{id}/apply — pro applies to oversee ───────────
    [HttpPost("{id}/apply")]
    [Authorize(Roles = "pro")]
    public async Task<ActionResult> Apply(int id)
    {
        var uid = CurrentUserId;

        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        if (project.Status != "open") return BadRequest(new { message = "Project is not open." });

        var exists = await _db.Applications
            .AnyAsync(a => a.ProjectId == id && a.ProId == uid);
        if (exists) return BadRequest(new { message = "Already applied." });

        _db.Applications.Add(new Application { ProjectId = id, ProId = uid });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Application submitted." });
    }

    // ── GET /api/projects/{id}/applications — homeowner views applicants ──
    [HttpGet("{id}/applications")]
    [Authorize(Roles = "homeowner")]
    public async Task<ActionResult<List<ApplicationResponse>>> GetApplications(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        if (project.OwnerId != CurrentUserId) return Forbid();

        var apps = await _db.Applications
            .Where(a => a.ProjectId == id)
            .Include(a => a.Pro).ThenInclude(u => u.ReviewsReceived)
            .ToListAsync();

        return Ok(apps.Select(a => new ApplicationResponse(
            a.Id,
            a.Status,
            a.AppliedAt,
            ToUserSummary(a.Pro)
        )).ToList());
    }

    // ── POST /api/projects/{id}/accept/{proId} — homeowner accepts a pro ─
    [HttpPost("{id}/accept/{proId}")]
    [Authorize(Roles = "homeowner")]
    public async Task<ActionResult> Accept(int id, int proId)
    {
        var project = await _db.Projects
            .Include(p => p.Applications)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();
        if (project.OwnerId != CurrentUserId) return Forbid();
        if (project.Status != "open") return BadRequest(new { message = "Project is not open." });

        var app = project.Applications.FirstOrDefault(a => a.ProId == proId);
        if (app == null) return BadRequest(new { message = "No application from this pro." });

        // Accept this application, reject others
        foreach (var a in project.Applications)
            a.Status = a.ProId == proId ? "accepted" : "rejected";

        project.ProId  = proId;
        project.Status = "in-progress";

        await _db.SaveChangesAsync();
        return Ok(new { message = "Pro accepted. Project is now in progress." });
    }

    // ── POST /api/projects/{id}/complete — either party approves completion ─
    [HttpPost("{id}/complete")]
    public async Task<ActionResult> Complete(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        if (project.Status != "in-progress")
            return BadRequest(new { message = "Project is not in progress." });

        var uid  = CurrentUserId;
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "homeowner")
        {
            if (project.OwnerId != uid) return Forbid();
            project.OwnerApprovedComplete = true;
        }
        else if (role == "pro")
        {
            if (project.ProId != uid) return Forbid();
            project.ProApprovedComplete = true;
        }
        else return Forbid();

        if (project.OwnerApprovedComplete && project.ProApprovedComplete)
            project.Status = "completed";

        await _db.SaveChangesAsync();

        var msg = project.Status == "completed"
            ? "Project marked as completed!"
            : "Completion approved. Waiting for the other party.";

        return Ok(new { message = msg, status = project.Status });
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private async Task<HashSet<int>> ReviewedProjectIds()
    {
        var uid = CurrentUserId;
        var ids = await _db.Reviews
            .Where(r => r.ReviewerId == uid)
            .Select(r => r.ProjectId)
            .ToListAsync();
        return ids.ToHashSet();
    }

    private ProjectResponse ToResponse(Project p, HashSet<int> reviewedProjectIds)
    {
        var uid     = CurrentUserId;
        var applied = p.Applications.Any(a => a.ProId == uid);

        return new ProjectResponse(
            p.Id, p.Title, p.Category, p.Description, p.Budget,
            p.Status, p.CreatedAt,
            ToUserSummary(p.Owner),
            p.Pro != null ? ToUserSummary(p.Pro) : null,
            p.Applications.Count,
            applied,
            p.OwnerApprovedComplete,
            p.ProApprovedComplete,
            reviewedProjectIds.Contains(p.Id)
        );
    }

    private static UserSummary ToUserSummary(User u)
    {
        double? avg = u.ReviewsReceived?.Any() == true
            ? u.ReviewsReceived.Average(r => r.Rating)
            : null;

        return new UserSummary(
            u.Id, u.Name, u.Role, u.Profession, u.HourlyRate,
            avg, u.ReviewsReceived?.Count ?? 0
        );
    }
}
