
export type QuestionCategory = 'self' | 'others' | 'object' | 'situation';

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  isReversed?: boolean;
}

export interface Scores {
  self: number;
  others: number;
  object: number;
  situation: number;
}

export interface CombinedScores {
  selfObject: number;
  othersObject: number;
  selfSituation: number;
  othersSituation: number;
}

export interface ResultDescriptions {
    selfObject: string;
    othersObject: string;
    selfSituation: string;
    othersSituation: string;
}
