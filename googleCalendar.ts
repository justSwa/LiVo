// services/googleCalendar.ts
/**
 * Google Calendar Integration Service
 * 
 * This service handles:
 * 1. Connecting to Google Calendar API
 * 2. Fetching calendar events
 * 3. Syncing events to Firebase
 * 4. Creating/updating/deleting events
 */

import { auth } from './firebase';

// Google Calendar API configuration
const CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  colorId?: string;
  status: string;
}

class GoogleCalendarService {
  private accessToken: string | null = null;

  /**
   * Initialize Google Calendar API
   * This gets called after user signs in with Google
   */
  async initialize() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get access token from Firebase Auth
    // The token is automatically obtained when user signs in with Google
    const idTokenResult = await user.getIdTokenResult();
    this.accessToken = idTokenResult.token;
  }

  /**
   * Check if user has granted calendar permissions
   */
  async hasCalendarPermission(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Check if user signed in with Google and has calendar scope
      const providerData = user.providerData;
      const googleProvider = providerData.find(p => p.providerId === 'google.com');
      
      return !!googleProvider;
    } catch (error) {
      console.error('Error checking calendar permission:', error);
      return false;
    }
  }

  /**
   * Request calendar permissions
   * This will prompt user to grant access to their Google Calendar
   */
  async requestCalendarPermission(): Promise<void> {
    // Load Google API client library
    await this.loadGoogleAPI();

    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: CALENDAR_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: CALENDAR_SCOPES,
          });

          // Sign in and request calendar access
          await window.gapi.auth2.getAuthInstance().signIn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Load Google API script
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.body.appendChild(script);
    });
  }

  /**
   * Fetch events from Google Calendar
   * @param timeMin - Start date (default: now)
   * @param timeMax - End date (default: 30 days from now)
   * @param maxResults - Maximum number of events to fetch
   */
  async fetchEvents(
    timeMin: Date = new Date(),
    timeMax: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    try {
      if (!window.gapi || !window.gapi.client.calendar) {
        await this.requestCalendarPermission();
      }

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  /**
   * Fetch upcoming events (next 7 days)
   */
  async fetchUpcomingEvents(): Promise<CalendarEvent[]> {
    const now = new Date();
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.fetchEvents(now, sevenDaysLater, 20);
  }

  /**
   * Fetch today's events
   */
  async fetchTodayEvents(): Promise<CalendarEvent[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return this.fetchEvents(startOfDay, endOfDay, 20);
  }

  /**
   * Create a new event in Google Calendar
   */
  async createEvent(event: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
  }): Promise<CalendarEvent> {
    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
          },
          end: {
            dateTime: event.end.toISOString(),
          },
          location: event.location,
        },
      });

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await window.gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updates,
      });

      return response.result;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Google Calendar
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Sync calendar events to Firebase
   * This can be called periodically to keep events in sync
   */
  async syncToFirebase(userId: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const events = await this.fetchUpcomingEvents();
      
      // Import Firebase database functions
      const { ref, set } = await import('firebase/database');
      const { db } = await import('./firebase');

      // Clear existing synced events
      await set(ref(db, `users/${userId}/calendarEvents`), null);

      // Save each event to Firebase
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await set(ref(db, `users/${userId}/calendarEvents/${event.id}`), {
          ...event,
          syncedAt: new Date().toISOString(),
        });

        if (onProgress) {
          onProgress((i + 1) / events.length * 100);
        }
      }
    } catch (error) {
      console.error('Error syncing calendar to Firebase:', error);
      throw error;
    }
  }

  /**
   * Format event for display
   */
  formatEventTime(event: CalendarEvent): string {
    const start = event.start.dateTime || event.start.date;
    if (!start) return 'No time';

    const date = new Date(start);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;

// Extend window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}