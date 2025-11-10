
import { type Question } from './types';

export const QUESTIONS: Question[] = [
  // Self
  { id: 1, text: '내가 화가 날 때 왜 화가 났는지 스스로 생각해 본다.', category: 'self' },
  { id: 2, text: '내가 어떤 일을 잘할 수 있을지 자주 생각해 본다.', category: 'self' },
  { id: 3, text: '힘든 일이 생겨도 혼자 이겨내려고 노력한다.', category: 'self' },
  { id: 4, text: '내가 기분이 좋을 때 그 이유를 알 수 있다.', category: 'self' },
  { id: 5, text: '실수했을 때 “괜찮아, 다시 하면 돼.”라고 스스로 위로한다.', category: 'self' },
  { id: 6, text: '내가 한 행동이 옳았는지 스스로 되돌아본다.', category: 'self' },
  { id: 7, text: '내가 느끼는 감정을 말로 표현하는 게 어렵다.', category: 'self', isReversed: true },
  { id: 8, text: '나만의 생각이나 느낌을 존중하는 편이다.', category: 'self' },
  // Others
  { id: 9, text: '친구가 기분이 나빠 보이면 이유를 알고 싶다.', category: 'others' },
  { id: 10, text: '친구가 슬퍼하면 나도 같이 슬퍼진다.', category: 'others' },
  { id: 11, text: '친구가 실수해도 이해하려고 한다.', category: 'others' },
  { id: 12, text: '친구가 칭찬받으면 나도 기분이 좋다.', category: 'others' },
  { id: 13, text: '친구가 화가 나 있으면 먼저 말을 걸기 어렵다.', category: 'others', isReversed: true },
  { id: 14, text: '친구가 아플 때 도와주고 싶다.', category: 'others' },
  { id: 15, text: '친구가 속상한 일을 말하면 끝까지 들어준다.', category: 'others' },
  { id: 16, text: '친구가 곤란할 때 도와줄 방법을 떠올린다.', category: 'others' },
  // Object
  { id: 17, text: '식물이 시들면 “물 줘야겠다.”는 생각이 든다.', category: 'object' },
  { id: 18, text: '동물이 다치면 마음이 아프다.', category: 'object' },
  { id: 19, text: '내가 아끼는 물건이 망가지면 속상하다.', category: 'object' },
  { id: 20, text: '내가 만든 작품을 보면 뿌듯한 기분이 든다.', category: 'object' },
  { id: 21, text: '버려진 물건을 보면 “불쌍하다”는 생각이 든다.', category: 'object' },
  { id: 22, text: '친구가 아끼는 물건을 조심히 다룬다.', category: 'object' },
  { id: 23, text: '쓰레기를 보면 그냥 지나치지 않고 주워 버린다.', category: 'object' },
  { id: 24, text: '내가 자주 쓰는 물건에도 ‘감정이 있을 것 같다’고 느낀다.', category: 'object' },
  // Situation
  { id: 25, text: '친구가 혼날 때 나도 긴장되거나 걱정된다.', category: 'situation' },
  { id: 26, text: '누군가 다투면 어떻게 하면 화해할 수 있을지 생각한다.', category: 'situation' },
  { id: 27, text: '발표나 경쟁 상황에서 다른 사람의 긴장감을 이해한다.', category: 'situation' },
  { id: 28, text: '모두가 힘든 상황이면 나도 조용히 도와주려고 한다.', category: 'situation' },
  { id: 29, text: '누군가 놀림을 받을 때 그만하라고 말하고 싶다.', category: 'situation' },
  { id: 30, text: '내가 잘못한 상황이면 먼저 사과하는 게 맞다고 생각한다.', category: 'situation' },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' },
];
