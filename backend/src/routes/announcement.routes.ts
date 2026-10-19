import { Router } from 'express';
import { getAnnouncements } from '../controllers/announcement.controller';

const router = Router();

// Public endpoint for cadets and website visitors to fetch live announcements
router.get('/', getAnnouncements);

export default router;
