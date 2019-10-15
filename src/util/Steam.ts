import * as Promise from 'bluebird';

export interface ISteamEntry {
  appid: string;
  name: string;
  gamePath: string;
  lastUser: string;
  lastUpdated: Date;
}

export interface ISteamExec {
  steamPath: string;
  arguments: string[];
}

export class GamePathNotMatched extends Error {
  private mGamePath: string;
  private mEntryPaths: string[];
  constructor(gamePath: string, entries: string[]) {
    super('Unable to find matching steam path - '
        + 'Please include your latest Vortex log file when reporting this issue!');
    this.name = this.constructor.name;
    this.mGamePath = gamePath;
    this.mEntryPaths = entries;
  }

  public get gamePath() {
    return this.mGamePath;
  }

  public get steamEntryPaths() {
    return this.mEntryPaths;
  }
}

export class GameNotFound extends Error {
  private mSearch;
  constructor(search: string) {
    super('Not in Steam library');
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.mSearch = search;
  }
  public get search() {
    return this.mSearch;
  }
}

export interface ISteam {
  findByName(namePattern: string): Promise<ISteamEntry>;
  findByAppId(appId: string | string[]): Promise<ISteamEntry>;
  allGames(): Promise<ISteamEntry[]>;
  getGameExecutionInfo(gamePath: string, appId?: number, args?: string[]): Promise<ISteamExec>;
}

export default {
  findByName(namePattern: string): Promise<ISteamEntry> {
    return Promise.reject(new GameNotFound(namePattern));
  },
  findByAppId(appId: string | string[]): Promise<ISteamEntry> {
    return Promise.reject(new GameNotFound(''));
  },
  allGames(): Promise<ISteamEntry[]> {
    return Promise.resolve([]);
  },
  getGameExecutionInfo(gamePath: string, appId?: number, args?: string[]): Promise<ISteamExec> {
    return Promise.reject(new GameNotFound(gamePath));
  },
};
