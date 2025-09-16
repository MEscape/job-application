import { prisma } from '@/features/shared/lib';

interface ActivityData {
  userId: string;
  action: string;
  resource?: string;
  success?: boolean;
}

interface LoginAttemptData {
  accessCode: string;
  userId?: string;
  success: boolean;
}

export class SessionTracker {
  static async logActivity(data: ActivityData) {
    try {
      // Filter out admin activity-related logs to avoid recursive logging
      const isAdminActivityLog = (
        data.action.includes('VIEW_ACTIVITY') ||
        data.resource?.includes('/admin/activity') ||
        data.action === 'VIEW_ACTIVITY_LOGS' ||
        data.action === 'VIEW_ACTIVITY_STATS'
      );
      
      if (isAdminActivityLog) {
        return; // Skip logging admin activity views
      }
      
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          success: data.success ?? true,
        },
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Log login attempts with minimal data
  static async logLoginAttempt(data: LoginAttemptData) {
    try {
      await prisma.loginAttempt.create({
        data: {
          accessCode: data.accessCode,
          userId: data.userId,
          success: data.success,
        },
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  // Track user sessions
  static async trackUserSession(userId: string, action: 'START' | 'END') {
    try {
      await this.logActivity({
        userId,
        action: `SESSION_${action}`,
        resource: 'user_session'
      });
    } catch (error) {
      console.error('Error tracking user session:', error);
    }
  }

  // Track page views for regular users
  static async trackPageView(userId: string, page: string) {
    try {
      await this.logActivity({
        userId,
        action: 'PAGE_VIEW',
        resource: page
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track file downloads
  static async trackFileDownload(userId: string, fileId: string, fileName: string) {
    try {
      await this.logActivity({
        userId,
        action: 'DOWNLOAD_FILE',
        resource: `file/${fileId}/${fileName}`
      });
    } catch (error) {
      console.error('Error tracking file download:', error);
    }
  }

  // Track search activities
  static async trackSearch(userId: string, searchTerm: string, resultsCount: number) {
    try {
      await this.logActivity({
        userId,
        action: 'SEARCH',
        resource: `query:${searchTerm}|results:${resultsCount}`
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }
}