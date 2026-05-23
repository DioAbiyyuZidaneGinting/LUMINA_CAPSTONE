import { supabase } from "./supabase";

export type TelemetryEventType = 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'purchase';

interface TelemetryEvent {
  event_type: TelemetryEventType;
  session_id: string;
  product_id?: string;
  metadata: Record<string, any>;
}

class TelemetryTracker {
  private sessionId: string = '';
  private memorySession: string = '';
  private eventQueue: TelemetryEvent[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private isBot: boolean = false;
  private lastEventTime: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSession();
      this.checkBot();
    }
  }

  private initSession() {
    try {
      const now = Date.now();
      let id = localStorage.getItem('store_sess_id_v2');
      let lastActivity = localStorage.getItem('store_sess_last_active');

      if (!id || !lastActivity || (now - parseInt(lastActivity)) > 30 * 60 * 1000) {
        id = this.generateId();
        localStorage.setItem('store_sess_id_v2', id);
      }
      
      localStorage.setItem('store_sess_last_active', now.toString());
      this.sessionId = id;
    } catch (e) {
      try {
        let id = sessionStorage.getItem('store_sess_id_v2');
        if (!id) {
          id = this.generateId();
          sessionStorage.setItem('store_sess_id_v2', id);
        }
        this.sessionId = id;
      } catch (e2) {
        if (!this.memorySession) {
          this.memorySession = this.generateId();
        }
        this.sessionId = this.memorySession;
      }
    }
  }

  private generateId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public getSessionId() {
    if (typeof window !== 'undefined') {
      try {
        const now = Date.now();
        let lastActivity = localStorage.getItem('store_sess_last_active');
        if (lastActivity && (now - parseInt(lastActivity)) > 30 * 60 * 1000) {
          // Session expired in SPA, regenerate
          this.initSession();
        }
      } catch (e) {}
    }
    
    if (!this.sessionId && typeof window !== 'undefined') {
      this.initSession();
    }
    return this.sessionId;
  }

  private checkBot() {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    const botPatterns = ['bot', 'crawler', 'spider', 'headless', 'lighthouse', 'pingbot'];
    this.isBot = botPatterns.some(pattern => ua.includes(pattern));
  }

  public track(event_type: TelemetryEventType, payload: { product_id?: string; metadata?: Record<string, any> } = {}) {
    if (this.isBot) return;

    const now = Date.now();
    try {
      localStorage.setItem('store_sess_last_active', now.toString());
    } catch (e) {}

    // Debounce duplicate events within 1 second
    const dedupeKey = `${event_type}_${payload.product_id || 'no_prod'}`;
    if (this.lastEventTime[dedupeKey] && now - this.lastEventTime[dedupeKey] < 1000) {
      return;
    }
    this.lastEventTime[dedupeKey] = now;

    const metadata = {
      ...payload.metadata,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      device_type: typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      timestamp: new Date().toISOString()
    };

    const event: TelemetryEvent = {
      event_type,
      session_id: this.getSessionId(),
      product_id: payload.product_id,
      metadata
    };

    this.eventQueue.push(event);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] Queued event: ${event_type}`, payload);
    }

    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimeout) return;
    
    // Always use setTimeout for more reliable execution across all browsers
    this.flushTimeout = setTimeout(() => {
      this.flush();
      this.flushTimeout = null;
    }, 1500);
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;

    const batch = [...this.eventQueue];
    this.eventQueue = [];

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] Flushing ${batch.length} events:`, batch.map(b => b.event_type));
    }

    try {
      const { error } = await supabase.from('storefront_events').insert(batch);
      if (error && process.env.NODE_ENV === 'development') {
        console.error(`[Telemetry] Insert failed:`, error.message);
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`[Telemetry] Insert success.`);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Telemetry] Exception:`, e);
      }
    }
  }

  public trackPurchase(orderId: string, amount: number, currency: string = 'IDR') {
    this.track('purchase', {
      metadata: {
        order_id: orderId,
        amount,
        currency
      }
    });
  }
}

export const telemetry = new TelemetryTracker();
