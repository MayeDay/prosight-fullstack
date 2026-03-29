// Controllers/ReviewsController.cs
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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReviewsController(AppDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/reviews/pro/{proId}
    [HttpGet("pro/{proId}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ReviewResponse>>> GetForPro(int proId)
    {
        var reviews = await _db.Reviews
            .Where(r => r.RevieweeId == proId)
            .Include(r => r.Reviewer)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => new ReviewResponse(
            r.Id, r.Rating, r.Comment, r.CreatedAt,
            new UserSummary(r.Reviewer.Id, r.Reviewer.Name, r.Reviewer.Role,
                null, null, null, 0)
        )).ToList());
    }

    // POST /api/reviews
    [HttpPost]
    [Authorize(Roles = "homeowner")]
    public async Task<ActionResult> Create(CreateReviewRequest req)
    {
        if (req.Rating < 1 || req.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        var project = await _db.Projects.FindAsync(req.ProjectId);
        if (project == null) return NotFound();
        if (project.OwnerId != CurrentUserId) return Forbid();
        if (project.ProId == null) return BadRequest(new { message = "No pro assigned to this project." });

        // Prevent duplicate reviews
        var alreadyReviewed = await _db.Reviews
            .AnyAsync(r => r.ProjectId == req.ProjectId && r.ReviewerId == CurrentUserId);
        if (alreadyReviewed)
            return BadRequest(new { message = "You have already reviewed this project." });

        _db.Reviews.Add(new Review
        {
            ProjectId  = req.ProjectId,
            ReviewerId = CurrentUserId,
            RevieweeId = project.ProId.Value,
            Rating     = req.Rating,
            Comment    = req.Comment
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Review submitted." });
    }
}
