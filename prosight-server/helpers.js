function userSummary(user) {
  const reviews = user.reviewsReceived || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    profession: user.profession ?? null,
    hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : null,
    averageRating: avgRating,
    reviewCount: reviews.length
  };
}

function projectResponse(project, currentUserId, reviewedProjectIds) {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    budget: Number(project.budget),
    status: project.status,
    createdAt: project.createdAt,
    owner: userSummary(project.owner),
    pro: project.pro ? userSummary(project.pro) : null,
    applicationCount: project.applications?.length ?? 0,
    currentUserApplied: project.applications?.some(a => a.proId === currentUserId) ?? false,
    ownerApprovedComplete: project.ownerApprovedComplete,
    proApprovedComplete: project.proApprovedComplete,
    reviewedByOwner: reviewedProjectIds.has(project.id)
  };
}

module.exports = { userSummary, projectResponse };
