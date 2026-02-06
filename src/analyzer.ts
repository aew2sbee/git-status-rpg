import { RepoInfo, UserStats } from './types'; // 型定義をインポート

interface TitleThreshold {
  threshold: number; // このバイト数以上で称号獲得
  title_ja: string;
  title_en: string;
}

const TITLE_THRESHOLDS: TitleThreshold[] = [
  { threshold: 0, title_ja: 'Hello Worldの住人', title_en: 'Hello World Habitants' },
  { threshold: 10_000, title_ja: '駆け出しコーダー', title_en: 'Aspiring Developer' },
  { threshold: 50_000, title_ja: '写経をする者', title_en: 'Code Follower' },
  { threshold: 100_000, title_ja: '不具合を狩る者', title_en: 'Bug Hunter' },
  { threshold: 250_000, title_ja: 'ロジックの構築師', title_en: 'Logic Architect' },
  { threshold: 500_000, title_ja: 'コードの設計士', title_en: 'Code Designer' },
  { threshold: 1_000_000, title_ja: 'フレームワークの覇者', title_en: 'Framework Master' },
  { threshold: 2_500_000, title_ja: '伝説のデプロイヤー', title_en: 'Legendary Deployer' },
  { threshold: 5_000_000, title_ja: 'システムの賢者', title_en: 'System Sage' },
  { threshold: 10_000_000, title_ja: 'バイナリの神', title_en: 'Binary God' },
];

const INIT_LEVEL = 1;
const EXP_PER_LEVEL = 5000; // 1レベルあたりの基本経験値
const EXP_GROWTH_RATE = 1.2; // レベルアップに必要な経験値の増加率

// 経験値（バイト数）からレベルを算出するロジック
// 低レベルは必要経験値が低く、高レベルになればなるほど増加
function calculateLevel(totalBytes: number): number {
  if (totalBytes <= 0) return INIT_LEVEL;

  let level = INIT_LEVEL;
  let accumulatedExp = 0; // そのレベルに到達するために必要な総経験値
  let requiredExpForThisLevel = EXP_PER_LEVEL; // 現在のレベルに達するために必要な経験値 (例えば level 1 -> 2 には expPerLevel)

  while (true) {
    if (totalBytes < accumulatedExp + requiredExpForThisLevel) {
      break; // 次のレベルに必要な経験値に達していない
    }
    level++;
    accumulatedExp += requiredExpForThisLevel;
    requiredExpForThisLevel *= EXP_GROWTH_RATE; // 次のレベルに必要な経験値を更新
  }
  return level;
}

// 次のレベルアップに必要な経験値（バイト数）を算出するロジック
function calculateNextLevelExp(totalBytes: number): number {
  if (totalBytes <= 0) return 5000; // レベル1から2へは5000バイト必要

  let level = INIT_LEVEL;
  let accumulatedExp = 0;
  let requiredExpForCurrentLevel = EXP_PER_LEVEL; // 現在のレベルに達するために必要な経験値 (例えば level 1 -> 2 には expPerLevel)

  // 現在の totalBytes がどのレベルにいるかを特定
  // totalBytes が expPerLevel 未満ならレベル1
  if (totalBytes < EXP_PER_LEVEL) {
    return EXP_PER_LEVEL - totalBytes;
  }

  // totalBytes が expPerLevel 以上の場合
  level++;
  accumulatedExp = EXP_PER_LEVEL; // レベル2に必要な累積経験値

  while (true) {
    const requiredExpForNextLevel = requiredExpForCurrentLevel * EXP_GROWTH_RATE; // 次のレベルに必要な経験値
    if (totalBytes < accumulatedExp + requiredExpForNextLevel) {
      // 次のレベルに達していない場合、そのレベルに必要な経験値が判明
      return (accumulatedExp + requiredExpForNextLevel) - totalBytes;
    }
    level++;
    accumulatedExp += requiredExpForNextLevel;
    requiredExpForCurrentLevel = requiredExpForNextLevel; // 次のレベルの計算のために更新
  }
}


// バイト数から称号を算出するロジック
function calculateTitle(totalBytes: number, lang: 'ja' | 'en'): string {
  // 閾値が高い方から順にチェックし、最初に条件を満たした称号を返す
  for (let i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalBytes >= TITLE_THRESHOLDS[i].threshold) {
      return lang === 'en' ? TITLE_THRESHOLDS[i].title_en : TITLE_THRESHOLDS[i].title_ja;
    }
  }
  // どの閾値も満たさない場合は、最低の称号を返す（理論上はthreshold: 0でカバーされるはず）
  return lang === 'en' ? TITLE_THRESHOLDS[0].title_en : TITLE_THRESHOLDS[0].title_ja;
}

export function analyzeUserStats(repos: RepoInfo[], lang: 'ja' | 'en' = 'ja'): UserStats {
  let totalBytes = 0;

  for (const repo of repos) {
    for (const langKey in repo.languages) {
      if (Object.prototype.hasOwnProperty.call(repo.languages, langKey)) {
        const bytes = repo.languages[langKey];
        totalBytes += bytes;
      }
    }
  }

  const level = calculateLevel(totalBytes);
  const rank = calculateTitle(totalBytes, lang);
  const nextLevelExp = calculateNextLevelExp(totalBytes);

  return {
    totalBytes,
    level,
    rank,
    nextLevelExp,
  };
}