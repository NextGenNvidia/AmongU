import { Router } from 'express';
import {
  generateTeams,
  getTeams,
  getTeamById,
  updateRound1Submission,
  updateRound2Submission,
  assignRound3Impostors,
  getMyTeam,
} from '../controllers/team.controller';
import { verifyAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';

const router = Router();

// Candidate: View their own squad & secret role assignment
router.get('/my-team', verifyAuth, getMyTeam);

// Public / Authenticated: View squads list
router.get('/', getTeams);

// View single squad details
router.get('/:id', getTeamById);

// Admin-only operations:
router.post('/generate', verifyAuth, requireAdmin, generateTeams);
router.patch('/:id/round1', verifyAuth, requireAdmin, updateRound1Submission);
router.patch('/:id/round2', verifyAuth, requireAdmin, updateRound2Submission);
router.post('/assign-impostors', verifyAuth, requireAdmin, assignRound3Impostors);

export default router;
