export interface ChartElement {
  measure: number,
  beat?: number,
  time?: number
}

export interface BPM extends ChartElement {
  bpm: number
}

export interface TimeSignature extends ChartElement {
  quarterNotesPerMeasure: number
}



export interface Character {
  id: number;
  musicId: number;
  musicVocalId: number;
  characterType: string;
  characterId: number;
  seq: number;
}

export interface ICharaProfile {
  id: number;
  seq: number;
  resourceId: number;
  firstName: string;
  givenName: string;
  firstNameRuby: string;
  givenNameRuby: string;
  gender: string;
  height: number;
  live2dHeightAdjustment: number;
  figure: string;
  breastSize: string;
  modelName: string;
  unit: string;
  supportUnitType: string;
}

export interface IOutCharaProfile {
  id: number;
  seq: number;
  name: string;
}

export interface IMusicInfo {
  id: number;
  seq: number;
  releaseConditionId: number;
  categories: string[];
  title: string;
  lyricist: string;
  composer: string;
  arranger: string;
  dancerCount: number;
  selfDancerPosition: number;
  assetbundleName: string;
  liveTalkBackgroundAssetbundleName: string;
  publishedAt: number;
  liveStageId: number;
  fillerSec: number;
}

export interface IMusicDifficultyInfo {
  id: number;
  musicId: number;
  musicDifficulty: string;
  playLevel: number;
  releaseConditionId: number;
  noteCount: number;
}

export interface IMusicVocalInfo {
  id: number;
  musicId: number;
  musicVocalType: string;
  seq: number;
  releaseConditionId: number;
  caption: string;
  characters: Character[];
  assetbundleName: string;
}