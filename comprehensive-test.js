#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ===== رنگ‌ها برای خروجی =====
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

let testsPassed = 0;
let testsFailed = 0;
let errors = [];

function log(msg, color = colors.white) {
  console.log(color + msg + colors.reset);
}

function logTest(name, passed, details = '') {
  if (passed) {
    log(`✅ ${name}: ${details || 'موفق'}`, colors.green);
    testsPassed++;
  } else {
    log(`❌ ${name}: ${details || 'خطا'}`, colors.red);
    testsFailed++;
    errors.push({ name, details });
  }
}

function logSection(title) {
  console.log('\n' + colors.cyan + colors.bold + '═══════════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + colors.bold + `  ${title}` + colors.reset);
  console.log(colors.cyan + colors.bold + '═══════════════════════════════════════════════' + colors.reset + '\n');
}

// ===== ۱. تست فایل‌های پروژه =====
function testProjectFiles() {
  logSection('📁 تست فایل‌های پروژه');
  
  const requiredFiles = [
    'pages/index.js',
    'pages/_app.js',
    'components/GameBoard.js',
    'components/GameStatus.js',
    'components/GameSettings.js',
    'components/Dashboard.js',
    'components/AuthModal.js',
    'components/Leaderboard.js',
    'components/WalletConnect.js',
    'utils/gameLogic.js',
    'utils/auth.js',
    'utils/config.js',
    'utils/web3.js',
    'utils/contractABI.json',
    'styles/globals.css',
    'next.config.cjs',
    'package.json',
    '.env.local'
  ];
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(file);
    logTest(`فایل ${file}`, exists, exists ? 'وجود دارد' : 'وجود ندارد');
  }
}

// ===== ۲. تست محتوای فایل‌های کلیدی =====
function testFileContents() {
  logSection('📄 تست محتوای فایل‌ها');
  
  // تست ABI
  try {
    const abi = JSON.parse(fs.readFileSync('utils/contractABI.json', 'utf8'));
    logTest('ABI معتبر است', Array.isArray(abi) && abi.length > 0, `${abi.length} تابع`);
  } catch (e) {
    logTest('ABI معتبر است', false, e.message);
  }
  
  // تست .env.local
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const hasAddress = env.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=');
    const hasRPC = env.includes('NEXT_PUBLIC_RPC_URL=');
    const hasNetwork = env.includes('NEXT_PUBLIC_NETWORK=');
    logTest('.env.local کامل است', hasAddress && hasRPC && hasNetwork, '✅');
  } catch (e) {
    logTest('.env.local کامل است', false, 'فایل وجود ندارد');
  }
  
  // تست package.json
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasEthers = pkg.dependencies && pkg.dependencies.ethers;
    const hasNext = pkg.dependencies && pkg.dependencies.next;
    const hasReact = pkg.dependencies && pkg.dependencies.react;
    logTest('package.json وابستگی‌ها', hasEthers && hasNext && hasReact, '✅');
  } catch (e) {
    logTest('package.json وابستگی‌ها', false, e.message);
  }
}

// ===== ۳. تست بلاکچین =====
async function testBlockchain() {
  logSection('⛓️ تست بلاکچین');
  
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const addressMatch = env.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(.+)/);
    const rpcMatch = env.match(/NEXT_PUBLIC_RPC_URL=(.+)/);
    
    if (!addressMatch || !rpcMatch) {
      logTest('تنظیمات بلاکچین', false, '.env.local ناقص است');
      return;
    }
    
    const CONTRACT_ADDRESS = addressMatch[1].trim();
    const RPC_URL = rpcMatch[1].trim();
    
    log(`📡 RPC: ${RPC_URL}`, colors.yellow);
    log(`📄 قرارداد: ${CONTRACT_ADDRESS}`, colors.yellow);
    
    // تست RPC
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const chainId = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      logTest('اتصال به RPC', true, `Chain ID: ${chainId.chainId}, Block: ${blockNumber}`);
    } catch (e) {
      logTest('اتصال به RPC', false, e.message);
      return;
    }
    
    // تست قرارداد
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      const hasCode = code !== '0x' && code !== '0x0';
      logTest('قرارداد وجود دارد', hasCode, hasCode ? 'بایت‌کد یافت شد' : 'بایت‌کد وجود ندارد');
      
      if (!hasCode) {
        log('⚠️ قرارداد در این آدرس وجود ندارد! ممکن است آدرس اشتباه باشد یا قرارداد دیپلوی نشده باشد.', colors.yellow);
        return;
      }
      
      // تست با ABI
      try {
        const abi = JSON.parse(fs.readFileSync('utils/contractABI.json', 'utf8'));
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        
        // تست owner
        try {
          const owner = await contract.owner();
          logTest('تابع owner()', true, owner);
        } catch (e) {
          logTest('تابع owner()', false, e.message);
        }
        
        // تست ROYALTY_PERCENT
        try {
          const royalty = await contract.ROYALTY_PERCENT();
          logTest('تابع ROYALTY_PERCENT()', true, royalty.toString());
        } catch (e) {
          logTest('تابع ROYALTY_PERCENT()', false, e.message);
        }
        
        // تست RENTAL_FEE_PERCENT
        try {
          const rental = await contract.RENTAL_FEE_PERCENT();
          logTest('تابع RENTAL_FEE_PERCENT()', true, rental.toString());
        } catch (e) {
          logTest('تابع RENTAL_FEE_PERCENT()', false, e.message);
        }
        
        // تست prizePool
        try {
          const pool = await contract.prizePool();
          logTest('تابع prizePool()', true, pool);
        } catch (e) {
          logTest('تابع prizePool()', false, e.message);
        }
        
        // تست name
        try {
          const name = await contract.name();
          logTest('تابع name()', true, name);
        } catch (e) {
          logTest('تابع name()', false, e.message);
        }
        
        // تست symbol
        try {
          const symbol = await contract.symbol();
          logTest('تابع symbol()', true, symbol);
        } catch (e) {
          logTest('تابع symbol()', false, e.message);
        }
        
      } catch (e) {
        logTest('بارگذاری ABI', false, e.message);
      }
      
    } catch (e) {
      logTest('اتصال به قرارداد', false, e.message);
    }
    
  } catch (e) {
    logTest('تست بلاکچین', false, e.message);
  }
}

// ===== ۴. تست منطق بازی =====
function testGameLogic() {
  logSection('🎮 تست منطق بازی');
  
  try {
    const { GameLogic } = require('./utils/gameLogic.js');
    const game = new GameLogic(4, 2);
    
    // تست ۱: حالت اولیه
    logTest('ایجاد بازی', true, `Grid: ${game.gridSize}x${game.gridSize}, Players: ${game.numPlayers}`);
    
    // تست ۲: حرکت معتبر
    const move1 = game.makeMove(0, 0, true, 0);
    logTest('حرکت معتبر (افقی)', move1.success, move1.success ? '✅' : move1.reason);
    
    // تست ۳: حرکت تکراری
    const move2 = game.makeMove(0, 0, true, 0);
    logTest('جلوگیری از حرکت تکراری', !move2.success && move2.reason === 'already_drawn', move2.reason);
    
    // تست ۴: نوبت اشتباه
    const move3 = game.makeMove(0, 1, true, 1);
    logTest('تشخیص نوبت اشتباه', !move3.success && move3.reason === 'wrong_turn', move3.reason);
    
    // تست ۵: هوش مصنوعی
    const aiMove = game.getAIMove(1);
    logTest('هوش مصنوعی حرکت می‌کند', aiMove !== null, aiMove ? `(${aiMove.row}, ${aiMove.col})` : 'حرکتی یافت نشد');
    
  } catch (e) {
    logTest('منطق بازی', false, e.message);
  }
}

// ===== ۵. تست احراز هویت =====
function testAuth() {
  logSection('🔐 تست احراز هویت');
  
  try {
    const { auth } = require('./utils/auth.js');
    
    // تست کاربران
    const users = auth.getAllUsers();
    logTest('دریافت کاربران', true, `${users.length} کاربر`);
    
    // تست ثبت‌نام (با داده‌های تست)
    const testName = 'TestUser_' + Date.now();
    const testEmail = `test_${Date.now()}@example.com`;
    const testPhone = `0912${Date.now().toString().slice(0, 8)}`;
    const result = auth.register(testName, testEmail, testPhone, 'test123');
    
    if (result.success) {
      logTest('ثبت‌نام کاربر', true, `✅ ${testName}`);
      
      // تست ورود
      const login = auth.login(testEmail, 'test123');
      logTest('ورود کاربر', login.success, login.success ? `✅ ${login.user.name}` : '❌');
      
      // تست جایزه روزانه
      const bonus = auth.addDailyBonus(result.user.id);
      if (bonus && bonus.success) {
        logTest('جایزه روزانه', true, `${bonus.bonus} اعتبار`);
      } else {
        logTest('جایزه روزانه', false, bonus ? bonus.error : 'خطا');
      }
      
    } else {
      logTest('ثبت‌نام کاربر', false, result.error);
    }
    
  } catch (e) {
    logTest('سیستم احراز هویت', false, e.message);
  }
}

// ===== ۶. تست پیکربندی =====
function testConfig() {
  logSection('⚙️ تست پیکربندی');
  
  try {
    const config = require('./utils/config.js').default;
    
    const checks = [
      ['شبکه', config.network, 'string'],
      ['RPC', config.rpcUrl, 'string'],
      ['آدرس قرارداد', config.contractAddress, 'string'],
      ['اندازه شبکه', config.defaultGridSize, 'number'],
      ['تعداد بازیکنان', config.defaultPlayers, 'number'],
      ['جایزه روزانه', config.dailyBonus, 'number'],
      ['اعتبار اولیه', config.initialBalance, 'number']
    ];
    
    for (const [name, value, type] of checks) {
      const valid = value !== undefined && value !== null && typeof value === type;
      logTest(`config.${name}`, valid, valid ? `${value}` : '❌');
    }
    
  } catch (e) {
    logTest('پیکربندی', false, e.message);
  }
}

// ===== ۷. تست فایل‌های کامپوننت =====
function testComponents() {
  logSection('🧩 تست کامپوننت‌ها');
  
  const components = [
    'components/GameBoard.js',
    'components/GameStatus.js',
    'components/GameSettings.js',
    'components/Dashboard.js',
    'components/AuthModal.js',
    'components/Leaderboard.js',
    'components/WalletConnect.js'
  ];
  
  for (const file of components) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const hasExport = content.includes('export default');
      const hasFunction = content.includes('function') || content.includes('const');
      logTest(`کامپوننت ${path.basename(file)}`, hasExport && hasFunction, hasExport ? '✅' : '❌');
    } catch (e) {
      logTest(`کامپوننت ${path.basename(file)}`, false, 'فایل وجود ندارد');
    }
  }
}

// ===== ۸. تست next.config.cjs =====
function testNextConfig() {
  logSection('📦 تست Next.js');
  
  try {
    const config = require('./next.config.cjs');
    const hasReactStrict = config.reactStrictMode === true;
    const hasSwcMinify = config.swcMinify === true;
    const hasEnv = config.env && typeof config.env === 'object';
    logTest('next.config.cjs معتبر است', hasReactStrict && hasSwcMinify && hasEnv, '✅');
  } catch (e) {
    logTest('next.config.cjs معتبر است', false, e.message);
  }
  
  // تست وجود .next
  try {
    const stat = fs.statSync('.next');
    logTest('پوشه .next وجود دارد', stat.isDirectory(), '✅');
  } catch (e) {
    logTest('پوشه .next وجود دارد', false, 'اجرا نشده است (npm run build)');
  }
}

// ===== ۹. تست متغیرهای محیطی در Vercel (شبیه‌سازی) =====
function testEnvVars() {
  logSection('🌐 تست متغیرهای محیطی');
  
  const envVars = [
    'NEXT_PUBLIC_NETWORK',
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_DEFAULT_GRID_SIZE',
    'NEXT_PUBLIC_DEFAULT_PLAYERS',
    'NEXT_PUBLIC_DAILY_BONUS',
    'NEXT_PUBLIC_INITIAL_BALANCE'
  ];
  
  for (const varName of envVars) {
    const value = process.env[varName];
    const exists = value !== undefined && value !== null && value !== '';
    logTest(`متغیر ${varName}`, exists, exists ? value : '❌');
  }
}

// ===== اجرای اصلی =====
async function main() {
  console.log('\n' + colors.magenta + colors.bold + '═══════════════════════════════════════════════' + colors.reset);
  console.log(colors.magenta + colors.bold + '  🧪 تست جامع برنامه Dots and Boxes' + colors.reset);
  console.log(colors.magenta + colors.bold + '═══════════════════════════════════════════════' + colors.reset + '\n');
  
  // اجرای تست‌ها
  testProjectFiles();
  testFileContents();
  testComponents();
  testNextConfig();
  testConfig();
  testAuth();
  testGameLogic();
  await testBlockchain();
  testEnvVars();
  
  // ===== گزارش نهایی =====
  console.log('\n' + colors.cyan + colors.bold + '═══════════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + colors.bold + '  📊 گزارش نهایی' + colors.reset);
  console.log(colors.cyan + colors.bold + '═══════════════════════════════════════════════' + colors.reset + '\n');
  
  console.log(`✅ تست‌های موفق: ${testsPassed}`);
  console.log(`❌ تست‌های ناموفق: ${testsFailed}`);
  
  if (errors.length > 0) {
    console.log('\n' + colors.red + '❌ خطاهای یافت شده:' + colors.reset);
    for (const err of errors) {
      console.log(`  - ${err.name}: ${err.details}`);
    }
  } else {
    console.log('\n' + colors.green + colors.bold + '🎉 تمام تست‌ها با موفقیت انجام شدند!' + colors.reset);
  }
  
  console.log('\n' + colors.yellow + '💡 نکته: برای تست کامل در مرورگر، بازی را با `npm run dev` اجرا کنید.' + colors.reset);
}

main().catch(console.error);
