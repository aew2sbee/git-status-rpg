import * as fs from 'fs';
import * as path from 'path';
import { fetchUserReposAndLanguages } from './fetcher';
import { analyzeUserStats } from './analyzer';
import { renderSvg } from './renderer';
import 'dotenv/config'; // dotenvをロード

async function main() {
  // コマンドライン引数を解析
  // 例: pnpm start <github_username>
  const args = process.argv.slice(2);
  let username: string | undefined;
  let lang: 'ja' | 'en' = 'ja';

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--lang=')) {
      const specifiedLang = args[i].substring('--lang='.length);
      if (specifiedLang === 'en') {
        lang = 'en';
      } else if (specifiedLang === 'ja') {
        lang = 'ja';
      } else {
        console.warn(`Warning: Invalid language specified: ${specifiedLang}. Using default 'ja'.`);
      }
    } else if (!username) {
      username = args[i];
    }
  }

  if (!username) {
    console.error('Usage: pnpm start <github_username> [--lang=en|ja]');
    process.exit(1);
  }
  // 環境変数からトークンを取得する
  // ローカル環境では .env.local から、GitHub Actions では secrets から読み込まれることを想定
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn('Warning: GITHUB_TOKEN environment variable is not set. API rate limits may apply.');
  }

  console.log(`Fetching data for GitHub user: ${username}...`);

  try {
    const repos = await fetchUserReposAndLanguages(username, token);
    const stats = analyzeUserStats(repos, lang);
    console.log(stats);

    // テキスト出力を維持
    console.log('\n--- Your Wizard Stats ---');
    console.log(`Total Bytes: ${stats.totalBytes} B`);
    console.log(`Level: ${stats.level}`);
    console.log(`Rank: ${stats.rank}`);
    console.log(`Next Level Exp: ${stats.nextLevelExp} B`);

    // SVGを生成
    const svgContent = renderSvg(stats, username);

    // outputディレクトリを作成
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // SVGファイルに保存
    const outputPath = path.join(outputDir, 'git-level.svg');
    fs.writeFileSync(outputPath, svgContent);
    console.log(`\nSVG stats card saved to: ${outputPath}`);

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
