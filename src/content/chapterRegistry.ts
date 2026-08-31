import type { StoryChapter } from "./types";

export interface ChapterRegistration {
  id: string;
  act: number;
  weekFrom: number;
  weekTo: number;
  chapter?: StoryChapter;
  load?: () => Promise<StoryChapter>;
}

export class ChapterRegistry {
  private readonly registrations = new Map<string, ChapterRegistration>();

  register(registration: ChapterRegistration): this {
    if (this.registrations.has(registration.id)) {
      throw new Error(`Chapter already registered: ${registration.id}`);
    }
    if (registration.weekFrom < 1 || registration.weekTo < registration.weekFrom) {
      throw new Error(`Invalid chapter week range: ${registration.id}`);
    }
    if ((!registration.chapter && !registration.load) || (registration.chapter && registration.load)) {
      throw new Error(`Chapter registration must provide exactly one source: ${registration.id}`);
    }
    this.registrations.set(registration.id, registration);
    return this;
  }

  get(id: string): StoryChapter | undefined {
    return this.registrations.get(id)?.chapter;
  }

  async loadForProgress(act: number, week: number): Promise<StoryChapter> {
    const registration = this.registrationForProgress(act, week);
    if (registration.chapter) return registration.chapter;
    const chapter = await registration.load!();
    this.registrations.set(registration.id, { ...registration, chapter, load: undefined });
    return chapter;
  }

  forProgress(act: number, week: number): StoryChapter {
    const match = this.registrationForProgress(act, week);
    if (!match.chapter) throw new Error(`Chapter is not loaded: ${match.id}`);
    return match.chapter;
  }

  private registrationForProgress(act: number, week: number): ChapterRegistration {
    const match = [...this.registrations.values()]
      .filter((item) => item.act === act && week >= item.weekFrom && week <= item.weekTo)
      .sort((a, b) => b.weekFrom - a.weekFrom)[0];
    if (!match) throw new Error(`No chapter registered for act ${act}, week ${week}`);
    return match;
  }

  list(): readonly ChapterRegistration[] {
    return [...this.registrations.values()];
  }
}
