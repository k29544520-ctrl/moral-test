
import { GoogleGenAI, Type } from "@google/genai";
import { type CombinedScores, type ResultDescriptions } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const resultSchema = {
    type: Type.OBJECT,
    properties: {
        selfObject: {
            type: Type.STRING,
            description: "자신과 대상 관계에 대한 분석. 자기 성찰과 사물/환경에 대한 공감 능력의 상호작용을 설명합니다."
        },
        othersObject: {
            type: Type.STRING,
            description: "타인과 대상 관계에 대한 분석. 타인에 대한 공감 능력이 주변 환경과 사물에 대한 관심으로 어떻게 확장되는지 설명합니다."
        },
        selfSituation: {
            type: Type.STRING,
            description: "자신과 상황 관계에 대한 분석. 특정 상황 속에서 자신의 감정과 역할을 어떻게 인식하고 대처하는지 설명합니다."
        },
        othersSituation: {
            type: Type.STRING,
            description: "타인과 상황 관계에 대한 분석. 사회적 상황 속에서 타인의 감정을 이해하고 그에 맞춰 행동하는 능력을 설명합니다."
        }
    },
    required: ["selfObject", "othersObject", "selfSituation", "othersSituation"]
};

export const generateResultDescriptions = async (scores: CombinedScores): Promise<ResultDescriptions> => {
    const prompt = `
    다음은 공감 프로필 검사 결과입니다. 각 점수는 16점에서 80점 사이입니다. 점수가 높을수록 해당 영역의 공감 능력이 높다는 것을 의미합니다.
    각 항목에 대해 점수를 기반으로 심리학적 분석 결과를 1~2문장으로, 긍정적이고 격려하는 톤으로 작성해주세요.

    결과 점수:
    - 자신과 대상 관계 (Self & Object): ${scores.selfObject}점
    - 타인과 대상 관계 (Others & Object): ${scores.othersObject}점
    - 자신과 상황 관계 (Self & Situation): ${scores.selfSituation}점
    - 타인과 상황 관계 (Others & Situation): ${scores.othersSituation}점

    아래 JSON 스키마 형식에 맞춰 응답해주세요.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resultSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as ResultDescriptions;

    } catch (error) {
        console.error("Error generating result descriptions:", error);
        return {
            selfObject: "결과를 분석하는 중 오류가 발생했습니다. 자신과 주변 사물에 대한 관계를 탐색하는 것은 자기 이해의 중요한 부분입니다.",
            othersObject: "결과를 분석하는 중 오류가 발생했습니다. 타인과 함께 주변 환경을 아끼는 마음은 공동체 의식의 기반이 됩니다.",
            selfSituation: "결과를 분석하는 중 오류가 발생했습니다. 다양한 상황 속에서 자신을 이해하는 능력은 성장의 원동력이 됩니다.",
            othersSituation: "결과를 분석하는 중 오류가 발생했습니다. 복잡한 상황 속에서 타인을 이해하려는 노력은 관계를 더욱 깊게 만듭니다."
        };
    }
};
