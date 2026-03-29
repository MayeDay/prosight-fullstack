// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProSight.API.Data;
using ProSight.API.DTOs;
using ProSight.API.Models;
using ProSight.API.Services;

namespace ProSight.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "Email already in use." });

        if (req.Role != "homeowner" && req.Role != "pro")
            return BadRequest(new { message = "Role must be 'homeowner' or 'pro'." });

        if (req.Role == "pro")
        {
            if (req.Credentials == null || req.Credentials.Count == 0)
                return BadRequest(new { message = "Professionals must provide at least one license credential." });

            foreach (var c in req.Credentials)
            {
                if (string.IsNullOrWhiteSpace(c.Trade) ||
                    string.IsNullOrWhiteSpace(c.LicenseType) ||
                    string.IsNullOrWhiteSpace(c.LicenseNumber))
                    return BadRequest(new { message = "Each credential must have a trade, license type, and license number." });
            }
        }

        var user = new User
        {
            Name         = req.Name,
            Email        = req.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role         = req.Role,
            Profession   = req.Profession,
            Bio          = req.Bio,
            HourlyRate   = req.HourlyRate
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var credentials = new List<ProCredential>();
        if (req.Role == "pro" && req.Credentials != null)
        {
            credentials = req.Credentials.Select(c => new ProCredential
            {
                UserId        = user.Id,
                Trade         = c.Trade.Trim(),
                LicenseType   = c.LicenseType.Trim(),
                LicenseNumber = c.LicenseNumber.Trim(),
                IssuingState  = c.IssuingState?.Trim()
            }).ToList();

            _db.ProCredentials.AddRange(credentials);
            await _db.SaveChangesAsync();
        }

        return Ok(BuildAuthResponse(user, credentials));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.ReviewsReceived)
            .Include(u => u.Credentials)
            .FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(BuildAuthResponse(user, user.Credentials.ToList()));
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private AuthResponse BuildAuthResponse(User user, List<ProCredential> credentials)
    {
        double? avgRating = user.ReviewsReceived.Any()
            ? user.ReviewsReceived.Average(r => r.Rating)
            : null;

        return new AuthResponse(
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.Location,
            user.Profession,
            user.Bio,
            user.HourlyRate,
            avgRating,
            user.ReviewsReceived.Count,
            _tokens.CreateToken(user),
            credentials.Select(c => new CredentialResponse(
                c.Id, c.Trade, c.LicenseType, c.LicenseNumber, c.IssuingState
            )).ToList()
        );
    }
}
