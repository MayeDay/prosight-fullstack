// Controllers/UsersController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProSight.API.Data;
using ProSight.API.DTOs;
using ProSight.API.Models;
using ProSight.API.Services;

namespace ProSight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public UsersController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    // GET /api/users/pros — list all professionals (public)
    [HttpGet("pros")]
    public async Task<ActionResult<List<UserSummary>>> GetPros()
    {
        var pros = await _db.Users
            .Where(u => u.Role == "pro")
            .Include(u => u.ReviewsReceived)
            .ToListAsync();

        return Ok(pros.Select(u =>
        {
            double? avg = u.ReviewsReceived.Any()
                ? u.ReviewsReceived.Average(r => r.Rating) : null;

            return new UserSummary(
                u.Id, u.Name, u.Role, u.Profession,
                u.HourlyRate, avg, u.ReviewsReceived.Count
            );
        }).ToList());
    }

    // GET /api/users/pros/{id} — public pro profile with credentials, completed projects + reviews
    [HttpGet("pros/{id}")]
    public async Task<ActionResult<ProProfileResponse>> GetProProfile(int id)
    {
        var user = await _db.Users
            .Include(u => u.ReviewsReceived).ThenInclude(r => r.Reviewer)
            .Include(u => u.Credentials)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "pro");

        if (user == null) return NotFound();

        double? avg = user.ReviewsReceived.Any()
            ? user.ReviewsReceived.Average(r => r.Rating) : null;

        var proSummary = new UserSummary(
            user.Id, user.Name, user.Role, user.Profession,
            user.HourlyRate, avg, user.ReviewsReceived.Count
        );

        var credentials = user.Credentials
            .Select(c => new CredentialResponse(c.Id, c.Trade, c.LicenseType, c.LicenseNumber, c.IssuingState))
            .ToList();

        var completedProjects = await _db.Projects
            .Include(p => p.Owner)
            .Where(p => p.ProId == id && p.Status == "completed")
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .Select(p => new CompletedProjectSummary(
                p.Id, p.Title, p.Category, p.CreatedAt,
                new UserSummary(p.Owner.Id, p.Owner.Name, p.Owner.Role, null, null, null, 0)
            ))
            .ToListAsync();

        var reviews = user.ReviewsReceived
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponse(
                r.Id, r.Rating, r.Comment, r.CreatedAt,
                new UserSummary(r.Reviewer.Id, r.Reviewer.Name, r.Reviewer.Role, null, null, null, 0)
            ))
            .ToList();

        return Ok(new ProProfileResponse(proSummary, credentials, completedProjects, reviews));
    }

    // GET /api/users/me — current user profile (authenticated)
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.Credentials)
            .FirstOrDefaultAsync(u => u.Id == uid);

        if (user == null) return NotFound();

        double? avg = user.ReviewsReceived.Any()
            ? user.ReviewsReceived.Average(r => r.Rating) : null;

        var credentials = user.Credentials
            .Select(c => new CredentialResponse(c.Id, c.Trade, c.LicenseType, c.LicenseNumber, c.IssuingState))
            .ToList();

        return Ok(new AuthResponse(
            user.Id, user.Name, user.Email, user.Role,
            user.Location, user.Profession, user.Bio, user.HourlyRate,
            avg, user.ReviewsReceived.Count,
            Token: string.Empty,
            Credentials: credentials
        ));
    }

    // PUT /api/users/me — update current user's profile and credentials
    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> UpdateMe(UpdateProfileRequest req)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user = await _db.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.Credentials)
            .FirstOrDefaultAsync(u => u.Id == uid);

        if (user == null) return NotFound();

        // Validate credentials for pros
        if (user.Role == "pro")
        {
            if (req.Credentials == null || req.Credentials.Count == 0)
                return BadRequest(new { message = "Professionals must have at least one license credential." });

            foreach (var c in req.Credentials)
            {
                if (string.IsNullOrWhiteSpace(c.Trade) ||
                    string.IsNullOrWhiteSpace(c.LicenseType) ||
                    string.IsNullOrWhiteSpace(c.LicenseNumber))
                    return BadRequest(new { message = "Each credential must have a trade, license type, and license number." });
            }
        }

        // Check email uniqueness if changed
        if (!string.Equals(user.Email, req.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _db.Users.AnyAsync(u => u.Email == req.Email.ToLower() && u.Id != uid))
                return BadRequest(new { message = "Email already in use." });
            user.Email = req.Email.ToLower();
        }

        user.Name       = req.Name;
        user.Location   = req.Location;
        user.Bio        = req.Bio;
        user.Profession = req.Profession;
        user.HourlyRate = req.HourlyRate;

        // Replace credentials: remove old, add new
        if (user.Role == "pro" && req.Credentials != null)
        {
            _db.ProCredentials.RemoveRange(user.Credentials);
            var newCreds = req.Credentials.Select(c => new ProCredential
            {
                UserId        = uid,
                Trade         = c.Trade.Trim(),
                LicenseType   = c.LicenseType.Trim(),
                LicenseNumber = c.LicenseNumber.Trim(),
                IssuingState  = c.IssuingState?.Trim()
            }).ToList();
            _db.ProCredentials.AddRange(newCreds);
        }

        await _db.SaveChangesAsync();

        // Reload credentials after save
        var credentials = await _db.ProCredentials
            .Where(c => c.UserId == uid)
            .Select(c => new CredentialResponse(c.Id, c.Trade, c.LicenseType, c.LicenseNumber, c.IssuingState))
            .ToListAsync();

        double? avg = user.ReviewsReceived.Any()
            ? user.ReviewsReceived.Average(r => r.Rating) : null;

        return Ok(new AuthResponse(
            user.Id, user.Name, user.Email, user.Role,
            user.Location, user.Profession, user.Bio, user.HourlyRate,
            avg, user.ReviewsReceived.Count,
            Token: _tokens.CreateToken(user),
            Credentials: credentials
        ));
    }
}
