import React, { useState, useEffect } from 'react';
import { googleCalendarService, CalendarEvent } from '../services/googleCalendar';
import { UserProfile } from '../types';

interface CalendarSyncProps {
  user: UserProfile;
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ user }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const permission = await googleCalendarService.hasCalendarPermission();
    setHasPermission(permission);
    if (permission) {
      loadEvents();
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      await googleCalendarService.requestCalendarPermission();
      setHasPermission(true);
      await loadEvents();
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      alert('Failed to get calendar permission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const upcomingEvents = await googleCalendarService.fetchUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Failed to load calendar events. Make sure you granted calendar permission.');
    } finally {
      setLoading(false);
    }
  };

  const syncEvents = async () => {
    setSyncing(true);
    setSyncProgress(0);
    try {
      await googleCalendarService.syncToFirebase(user.id, (progress) => {
        setSyncProgress(progress);
      });
      alert('Calendar synced successfully! Your events are now saved in LiVo.');
      await loadEvents();
    } catch (error) {
      console.error('Error syncing calendar:', error);
      alert('Failed to sync calendar. Please try again.');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  if (!hasPermission) {
    return (
      <div className="p-8 bg-white rounded-3xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Connect Google Calendar</h2>
          <p className="text-stone-600 mb-8 max-w-md mx-auto">
            Sync your Google Calendar events with LiVo to see all your activities in one place. Stay organized effortlessly.
          </p>
          <button
            onClick={requestPermission}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'Connecting...' : '🔗 Connect Calendar'}
          </button>
          <p className="text-xs text-stone-400 mt-6">
            We'll only read your calendar. We never modify or delete your events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">📅 Calendar Events</h2>
          <p className="text-sm text-stone-500 mt-1">
            {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadEvents}
            disabled={loading || syncing}
            className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={syncEvents}
            disabled={loading || syncing}
            className="px-6 py-3 bg-[var(--app-accent)] text-white font-bold rounded-xl hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {syncing ? `Syncing ${Math.round(syncProgress)}%` : 'Sync to LiVo'}
          </button>
        </div>
      </div>

      {syncing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Syncing your events...</span>
            <span className="text-sm font-bold text-stone-800">{Math.round(syncProgress)}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[var(--app-accent)] h-full transition-all duration-300 ease-out"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {loading && !syncing ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-[var(--app-accent)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading your events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-stone-400 text-lg font-medium mb-2">No upcoming events</p>
          <p className="text-stone-500 text-sm">Your calendar is clear for the next 7 days</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {events.map((event) => (
            <div 
              key={event.id}
              className="p-5 bg-gradient-to-br from-stone-50 to-white rounded-2xl border border-stone-100 hover:border-[var(--app-accent)] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 text-lg mb-2 group-hover:text-[var(--app-accent-deep)] transition-colors">
                    {event.summary || 'Untitled Event'}
                  </h3>
                  {event.description && (
                    <p className="text-stone-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{googleCalendarService.formatEventTime(event)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {event.status === 'confirmed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      ✓ Confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-stone-100 text-center">
        <p className="text-xs text-stone-400">
          Last synced: {new Date().toLocaleTimeString()} • 
          <button 
            onClick={loadEvents}
            className="ml-2 text-[var(--app-accent)] hover:underline font-medium"
          >
            Refresh now
          </button>
        </p>
      </div>
    </div>
  );
};

export default CalendarSync;