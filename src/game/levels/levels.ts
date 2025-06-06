interface LevelData {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  layout: number[][];
}

export const levels: LevelData[] = [
  // Level 1: Candy Land - Easy
  {
    name: 'Candy Land',
    difficulty: 'Easy',
    layout: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 2, 2, 1, 1, 0],
      [1, 1, 2, 0, 0, 0, 0, 2, 1, 1]
    ]
  },
  
  // Level 2: Cloud Kingdom - Easy
  {
    name: 'Cloud Kingdom',
    difficulty: 'Easy',
    layout: [
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 2, 1, 1, 2, 2, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [0, 0, 0, 3, 3, 3, 3, 0, 0, 0]
    ]
  },
  
  // Level 3: Magic Forest - Medium
  {
    name: 'Magic Forest',
    difficulty: 'Medium',
    layout: [
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [1, 2, 2, 1, 0, 0, 1, 2, 2, 1],
      [1, 2, 2, 1, 3, 3, 1, 2, 2, 1],
      [1, 1, 1, 3, 3, 3, 3, 1, 1, 1],
      [0, 0, 3, 3, 4, 4, 3, 3, 0, 0],
      [0, 0, 0, 3, 4, 4, 3, 0, 0, 0]
    ]
  },
  
  // Level 4: Dream Castle - Medium
  {
    name: 'Dream Castle',
    difficulty: 'Medium',
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 2, 2, 0, 0, 2, 2, 0, 1],
      [1, 2, 3, 3, 2, 2, 3, 3, 2, 1],
      [1, 2, 3, 0, 0, 0, 0, 3, 2, 1],
      [1, 2, 3, 0, 4, 4, 0, 3, 2, 1],
      [1, 2, 3, 0, 4, 4, 0, 3, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  
  // Level 5: Star Galaxy - Hard
  {
    name: 'Star Galaxy',
    difficulty: 'Hard',
    layout: [
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 0, 0, 5, 4, 4, 5, 0, 0, 0],
      [0, 0, 5, 4, 3, 3, 4, 5, 0, 0],
      [0, 5, 4, 3, 2, 2, 3, 4, 5, 0],
      [5, 4, 3, 2, 1, 1, 2, 3, 4, 5],
      [0, 5, 4, 3, 2, 2, 3, 4, 5, 0],
      [0, 0, 5, 4, 3, 3, 4, 5, 0, 0],
      [0, 0, 0, 5, 4, 4, 5, 0, 0, 0]
    ]
  },
  
  // Level 6: Rainbow World - Hard
  {
    name: 'Rainbow World',
    difficulty: 'Hard',
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
      [2, 3, 4, 5, 0, 0, 5, 4, 3, 2],
      [3, 4, 5, 0, 0, 0, 0, 5, 4, 3]
    ]
  }
];