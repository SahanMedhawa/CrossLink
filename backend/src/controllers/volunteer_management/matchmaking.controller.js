const matchmakingService = require('../../services/volunteer_management/matchmaking.service');
const sendEmail = require('../../utils/sendEmail');
const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');
const { resolveFrontendBaseUrl } = require('../../utils/frontendBaseUrl');

const FRONTEND_BASE_URL = resolveFrontendBaseUrl();

const sendMatchEmails = async (volunteerId, matches) => {
  if (!Array.isArray(matches) || matches.length === 0) return;

  const volunteer = await User.findById(volunteerId).select('name email').lean();
  if (!volunteer?.email) return;

  const strongMatches = matches.filter((item) => Number(item.matchScore) > 50);
  if (!strongMatches.length) return;

  for (const match of strongMatches) {
    const projectId = match?.project?._id;
    if (!projectId) continue;

    const uniqueKey = `matchmaking:email:${volunteerId}:${projectId}`;
    const alreadySent = await Notification.exists({
      recipient: volunteerId,
      uniqueKey,
    });

    if (alreadySent) continue;

    try {
      await sendEmail({
        to: volunteer.email,
        subject: `🎯 New Project Match (${match.matchScore}%): ${match.project.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2563eb;">Great Match Found!</h2>
            <p>Hi ${volunteer.name || 'Volunteer'},</p>
            <p>We found a project that matches your profile with a <strong>${match.matchScore}%</strong> score.</p>
            <p><strong>Project:</strong> ${match.project.title}</p>
            <p><strong>Location:</strong> ${match.project.location || 'Not specified'}</p>
            <br/>
            <a href="${FRONTEND_BASE_URL}/volunteer/projects"
               style="background-color:#2563eb;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;">
               View Matched Projects
            </a>
          </div>
        `,
      });

      await Notification.create({
        recipient: volunteerId,
        recipientRole: 'volunteer',
        actor: null,
        actorRole: null,
        type: 'matchmaking.email-sent',
        uniqueKey,
        title: 'Match recommendation emailed',
        message: `Match email sent for ${match.project.title} (${match.matchScore}%).`,
        link: '/volunteer/projects',
        metadata: {
          projectId,
          matchScore: match.matchScore,
        },
      });
    } catch (error) {
      console.error('Match recommendation email failed:', error.message);
    }
  }
};

/**
 * GET /api/matchmaking/projects
 * Get matched projects for the authenticated volunteer
 * Returns projects ranked by skill-intersection match score
 */
const getMatchedProjects = async (req, res) => {
  try {
    const matches = await matchmakingService.getMatchedProjects(req.user.id);

    // Fire-and-forget; do not block endpoint response for email issues.
    sendMatchEmails(req.user.id, matches).catch((error) => {
      console.error('Match email dispatch error:', error.message);
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error fetching matched projects.',
    });
  }
};

module.exports = {
  getMatchedProjects,
};
