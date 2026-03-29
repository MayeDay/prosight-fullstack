// Controllers/MessagesController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProSight.API.Data;
using ProSight.API.DTOs;
using ProSight.API.Models;

namespace ProSight.API.Controllers;

[ApiController]
[Route("api/projects/{projectId}/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;
    public MessagesController(AppDbContext db) => _db = db;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/projects/{projectId}/messages
    [HttpGet]
    public async Task<ActionResult<List<MessageResponse>>> GetMessages(int projectId)
    {
        // Only the homeowner or assigned pro can read messages
        var project = await _db.Projects.FindAsync(projectId);
        if (project == null) return NotFound();

        var uid = CurrentUserId;
        if (project.OwnerId != uid && project.ProId != uid)
            return Forbid();

        var messages = await _db.Messages
            .Where(m => m.ProjectId == projectId)
            .Include(m => m.Sender).ThenInclude(u => u.ReviewsReceived)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages.Select(m => new MessageResponse(
            m.Id,
            m.Text,
            m.SentAt,
            new UserSummary(m.Sender.Id, m.Sender.Name, m.Sender.Role,
                m.Sender.Profession, m.Sender.HourlyRate, null, 0)
        )).ToList());
    }

    // POST /api/projects/{projectId}/messages
    [HttpPost]
    public async Task<ActionResult<MessageResponse>> Send(int projectId, SendMessageRequest req)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project == null) return NotFound();

        var uid = CurrentUserId;
        if (project.OwnerId != uid && project.ProId != uid)
            return Forbid();

        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest(new { message = "Message cannot be empty." });

        var sender = await _db.Users.FindAsync(uid);

        var message = new Message
        {
            ProjectId = projectId,
            SenderId  = uid,
            Text      = req.Text.Trim()
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new MessageResponse(
            message.Id,
            message.Text,
            message.SentAt,
            new UserSummary(sender!.Id, sender.Name, sender.Role,
                sender.Profession, sender.HourlyRate, null, 0)
        ));
    }
}
