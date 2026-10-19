import { Request, Response } from 'express';
import { Announcement } from '../models/Announcement';

export const getAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: announcements,
      count: announcements.length,
    });
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, category, authorName, isPinned } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Announcement title is required' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Announcement content is required' });
      return;
    }

    const validCategories = ['general', 'round_alert', 'emergency_meeting', 'result'];
    const selectedCategory = validCategories.includes(category) ? category : 'general';

    const newAnnouncement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      authorName: (authorName && authorName.trim()) || 'Mission HQ Admin',
      isPinned: Boolean(isPinned),
    });

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully!',
      data: newAnnouncement,
    });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create announcement' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete announcement' });
  }
};
