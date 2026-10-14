import { Request, Response } from 'express';
import { Team, ITeamMember } from '../models/Team';
import { Registration } from '../models/Registration';

const SQUAD_NAMES = [
  'Red Saboteurs',
  'Cyan Navigators',
  'Lime Engineers',
  'Yellow Specialists',
  'Purple Voyagers',
  'Orange Architects',
  'Pink Vanguard',
  'Black Ops Terminal',
  'Emerald Guardians',
  'Cobalt Recons',
  'Amber Infiltrators',
  'Crimson Sentinels',
];

const SUIT_COLORS = [
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#A855F7', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
];

/**
 * Admin: Generate 4-member randomized squads from verified present candidates
 */
export const generateTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch eligible candidates (paid & present first; fallback to all paid if none marked present yet)
    let candidates = await Registration.find({
      paymentStatus: 'success',
      isPresent: true,
    }).sort({ createdAt: 1 });

    if (candidates.length < 4) {
      candidates = await Registration.find({
        paymentStatus: 'success',
      }).sort({ createdAt: 1 });
    }

    if (candidates.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Not enough registered participants (at least 2 required) to generate squads.',
      });
      return;
    }

    // 2. Fisher-Yates Shuffle
    const pool = [...candidates];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    // 3. Delete existing teams to prevent stale squad mappings
    await Team.deleteMany({});

    // Reset team assignments on all registrations
    await Registration.updateMany(
      {},
      { $set: { assignedTeamId: '', assignedTeamName: '', assignedRole: 'unassigned' } }
    );

    const teamSize = 4;
    const createdTeams = [];
    let teamCounter = 1;

    for (let i = 0; i < pool.length; i += teamSize) {
      const slice = pool.slice(i, i + teamSize);
      if (slice.length >= 2) {
        const teamId = `TEAM-${teamCounter.toString().padStart(2, '0')}`;
        const teamName = SQUAD_NAMES[(teamCounter - 1) % SQUAD_NAMES.length];
        const primaryTrack = slice[0].branch ? `${slice[0].branch} Innovation Track` : 'Web Development';

        const members: ITeamMember[] = slice.map((c, idx) => ({
          registrationId: c._id,
          candidateId: c.collegeId || c._id.toString(),
          name: c.name,
          collegeId: c.collegeId,
          email: c.email,
          phone: c.phone,
          branch: c.branch,
          year: c.year,
          section: c.section,
          suitColor: SUIT_COLORS[idx % SUIT_COLORS.length],
          role: 'unassigned',
          isPresent: c.isPresent,
        }));

        const team = await Team.create({
          teamId,
          name: teamName,
          track: primaryTrack,
          tableNumber: teamCounter,
          members,
          impostorRevealed: false,
        });

        // Update registrations in DB
        const memberIds = slice.map((c) => c._id);
        await Registration.updateMany(
          { _id: { $in: memberIds } },
          {
            $set: {
              assignedTeamId: team.teamId,
              assignedTeamName: team.name,
              assignedRole: 'unassigned',
            },
          }
        );

        createdTeams.push(team);
        teamCounter++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${createdTeams.length} randomized 4-person squads.`,
      teams: createdTeams,
    });
  } catch (error: any) {
    console.error('Generate Teams Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error generating teams',
    });
  }
};

/**
 * Get all teams
 */
export const getTeams = async (_req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find().sort({ tableNumber: 1 });
    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error fetching teams',
    });
  }
};

/**
 * Get single team by teamId or _id
 */
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const team = await Team.findOne({
      $or: [{ teamId: id }, { _id: id }],
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found' });
      return;
    }

    res.status(200).json({ success: true, team });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching team' });
  }
};

/**
 * Admin: Update Round 1 PPT & Architecture Submission
 */
export const updateRound1Submission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pptUrl, projectTitle, problemStatement, proposedSolution, score, juryFeedback } = req.body;

    const team = await Team.findOne({
      $or: [{ teamId: id }, { _id: id }],
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found' });
      return;
    }

    team.round1Submission = {
      pptUrl: pptUrl || team.round1Submission?.pptUrl,
      projectTitle: projectTitle || team.round1Submission?.projectTitle,
      problemStatement: problemStatement || team.round1Submission?.problemStatement,
      proposedSolution: proposedSolution || team.round1Submission?.proposedSolution,
      submittedAt: new Date(),
      score: score !== undefined ? Number(score) : team.round1Submission?.score,
      juryFeedback: juryFeedback !== undefined ? juryFeedback : team.round1Submission?.juryFeedback,
    };

    await team.save();

    res.status(200).json({
      success: true,
      message: `Round 1 evaluation updated for ${team.name}`,
      team,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error updating Round 1 submission',
    });
  }
};

/**
 * Admin: Update Round 2 Development Phase Evaluation
 */
export const updateRound2Submission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      repoUrl,
      liveDemoUrl,
      techStack,
      implementationStatus,
      technicalComplexity,
      score,
      juryFeedback,
    } = req.body;

    const team = await Team.findOne({
      $or: [{ teamId: id }, { _id: id }],
    });

    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found' });
      return;
    }

    team.round2Submission = {
      repoUrl: repoUrl || team.round2Submission?.repoUrl,
      liveDemoUrl: liveDemoUrl || team.round2Submission?.liveDemoUrl,
      techStack: Array.isArray(techStack) ? techStack : team.round2Submission?.techStack || [],
      implementationStatus: implementationStatus || team.round2Submission?.implementationStatus || 'In Progress',
      technicalComplexity: technicalComplexity || team.round2Submission?.technicalComplexity || 'Moderate Complexity',
      submittedAt: new Date(),
      score: score !== undefined ? Number(score) : team.round2Submission?.score,
      juryFeedback: juryFeedback !== undefined ? juryFeedback : team.round2Submission?.juryFeedback,
    };

    await team.save();

    res.status(200).json({
      success: true,
      message: `Round 2 evaluation updated for ${team.name}`,
      team,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error updating Round 2 submission',
    });
  }
};

/**
 * Admin: Secret Impostor Infiltration Engine (Assigns 1 Impostor per eligible team)
 */
export const assignRound3Impostors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find();

    if (teams.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No teams available. Generate squads first before triggering Round 3 Impostor protocol.',
      });
      return;
    }

    const impostorCollegeIds: string[] = [];
    const crewmateCollegeIds: string[] = [];

    for (const team of teams) {
      if (team.members.length === 0) continue;

      // Select 1 random member
      const randomIndex = Math.floor(Math.random() * team.members.length);
      const chosenImpostor = team.members[randomIndex];
      team.impostorId = chosenImpostor.collegeId;
      team.impostorRevealed = false;

      // Update members in team
      team.members = team.members.map((member, idx) => {
        if (idx === randomIndex) {
          impostorCollegeIds.push(member.collegeId);
          return { ...member, role: 'impostor' };
        } else {
          crewmateCollegeIds.push(member.collegeId);
          return { ...member, role: 'crewmate' };
        }
      });

      await team.save();
    }

    // Persist roles in global candidate registrations
    if (impostorCollegeIds.length > 0) {
      await Registration.updateMany(
        { collegeId: { $in: impostorCollegeIds } },
        { $set: { assignedRole: 'impostor' } }
      );
    }

    if (crewmateCollegeIds.length > 0) {
      await Registration.updateMany(
        { collegeId: { $in: crewmateCollegeIds } },
        { $set: { assignedRole: 'crewmate' } }
      );
    }

    const updatedTeams = await Team.find().sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      message: `Round 3 Impostors assigned secretly across ${teams.length} squads!`,
      impostorCount: impostorCollegeIds.length,
      teams: updatedTeams,
    });
  } catch (error: any) {
    console.error('Assign Impostors Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error assigning Round 3 Impostors',
    });
  }
};

/**
 * Candidate: Get My Team & Private Classified Role
 */
export const getMyTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Find candidate registration
    const registration = await Registration.findOne({
      $or: [{ firebaseUid: req.user.uid }, { email: req.user.email }],
      paymentStatus: 'success',
    });

    if (!registration || !registration.assignedTeamName) {
      res.status(404).json({
        success: false,
        message: 'You have not been assigned to a team yet. Teams will be randomized before Round 1.',
      });
      return;
    }

    // Find assigned team
    const team = await Team.findOne({
      $or: [{ teamId: registration.assignedTeamId }, { name: registration.assignedTeamName }],
    });

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Assigned squad not found.',
      });
      return;
    }

    // Candidate role security:
    // Only show "impostor" if the requester themselves is the impostor.
    // Teammates' secret identities are protected.
    const isCurrentUserImpostor = registration.assignedRole === 'impostor';

    const safeMembers = team.members.map((m) => ({
      name: m.name,
      collegeId: m.collegeId,
      branch: m.branch,
      year: m.year,
      suitColor: m.suitColor,
      isPresent: m.isPresent,
      // Hide other teammates' secret roles until reveal
      role: team.impostorRevealed
        ? m.role
        : m.collegeId === registration.collegeId
        ? registration.assignedRole
        : 'classified',
    }));

    res.status(200).json({
      success: true,
      team: {
        teamId: team.teamId,
        name: team.name,
        track: team.track,
        tableNumber: team.tableNumber,
        members: safeMembers,
        round1Submission: team.round1Submission,
        round2Submission: team.round2Submission,
      },
      myRole: registration.assignedRole,
      isImpostor: isCurrentUserImpostor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error fetching user squad',
    });
  }
};
