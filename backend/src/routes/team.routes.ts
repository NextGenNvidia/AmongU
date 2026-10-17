import { Router } from 'express';
import {
  generateTeams,
  getTeams,
  getTeamById,
  updateRound1Submission,
  updateRound2Submission,
  assignRound3Impostors,
  getMyTeam,
  getTeamMessages,
  sendTeamMessage,
  getAdminTeamsOverview,
  saveAllTeams,
  appointTeamImpostor,
} from '../controllers/team.controller';
import { verifyAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';

const router = Router();

// Candidate: View their own squad & secret role assignment
router.get('/my-team', verifyAuth, getMyTeam);

// Admin-only operations for interactive squad & impostor management:
router.get('/admin/overview', verifyAuth, requireAdmin, getAdminTeamsOverview);
router.post('/admin/save-all', verifyAuth, requireAdmin, saveAllTeams);
router.put('/admin/:id/impostor', verifyAuth, requireAdmin, appointTeamImpostor);
router.post('/generate', verifyAuth, requireAdmin, generateTeams);
router.post('/assign-impostors', verifyAuth, requireAdmin, assignRound3Impostors);

// Squad Encrypted Comms (Team Chat)
router.get('/:id/messages', getTeamMessages);
router.post('/:id/messages', sendTeamMessage);

// Public / Authenticated: View squads list
router.get('/', getTeams);

// View single squad details
router.get('/:id', getTeamById);

router.patch('/:id/round1', verifyAuth, requireAdmin, updateRound1Submission);
router.patch('/:id/round2', verifyAuth, requireAdmin, updateRound2Submission);

export default router;
