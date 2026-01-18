import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { extractUser, requireAuth, requireClinic } from '../middlewares/auth.middleware';

const router = Router();

router.use(extractUser);
router.use(requireAuth);
router.use(requireClinic);

// Get all teams
router.get('/', teamController.getTeams);

// Create team
router.post('/', teamController.createTeam);

// Update team
router.patch('/:teamName', teamController.updateTeam);

// Delete team
router.delete('/:teamName', teamController.deleteTeam);

// Team members
router.post('/:teamName/members', teamController.addTeamMember);
router.delete('/:teamName/members/:employeeId', teamController.removeTeamMember);

export default router;
