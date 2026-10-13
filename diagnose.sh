#!/bin/bash

echo "========================================="
echo "🔍 تشخیص مشکل بلاکچین"
echo "========================================="

# ۱. خواندن آدرس از .env.local
CONTRACT_ADDR=$(grep NEXT_PUBLIC_CONTRACT_ADDRESS .env.local | cut -d '=' -f2)
if [ -z "$CONTRACT_ADDR" ]; then
  echo "❌ آدرس در .env.local پیدا نشد"
  exit 1
fi
echo "📄 آدرس قرارداد از .env.local: $CONTRACT_ADDR"

# ۲. دریافت بایت‌کد با curl
echo ""
echo "📡 دریافت بایت‌کد از RPC..."
BYTECODE=$(curl -s -X POST https://ethereum-sepolia.publicnode.com \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CONTRACT_ADDR\", \"latest\"],\"id\":1}" \
  | jq -r '.result')

if [ -z "$BYTECODE" ] || [ "$BYTECODE" == "0x" ]; then
  echo "❌ قراردادی در این آدرس وجود ندارد!"
  exit 1
fi

LENGTH=${#BYTECODE}
echo "📏 طول بایت‌کد: $LENGTH کاراکتر"
if [ $LENGTH -gt 2000 ]; then
  echo "✅ بایت‌کد طولانی است (احتمالاً قرارداد صحیح)"
else
  echo "❌ بایت‌کد کوتاه است (احتمالاً قرارداد Counters)"
fi

# ۳. فراخوانی تابع owner با curl (بدون ABI)
echo ""
echo "📞 تست تابع owner با raw call..."
DATA="0x8da5cb5b"  # signature owner()
RESPONSE=$(curl -s -X POST https://ethereum-sepolia.publicnode.com \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT_ADDR\",\"data\":\"$DATA\"},\"latest\"],\"id\":1}")

if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ تابع owner اجرا نشد: $(echo "$RESPONSE" | jq -r '.error.message')"
else
  RESULT=$(echo "$RESPONSE" | jq -r '.result')
  if [ "$RESULT" != "0x" ]; then
    echo "✅ تابع owner پاسخ داد: $RESULT"
  else
    echo "❌ تابع owner پاسخ خالی برگرداند (احتمالاً تابع وجود ندارد)"
  fi
fi

# ۴. بررسی ABI
echo ""
echo "📄 بررسی فایل ABI..."
ABI_FILE="utils/contractABI.json"
if [ -f "$ABI_FILE" ]; then
  ABI_SIZE=$(cat "$ABI_FILE" | wc -c)
  echo "✅ فایل ABI وجود دارد (سایز: $ABI_SIZE بایت)"
  # بررسی وجود تابع owner
  if grep -q '"name":"owner"' "$ABI_FILE"; then
    echo "✅ تابع owner در ABI وجود دارد"
  else
    echo "❌ تابع owner در ABI وجود ندارد"
  fi
else
  echo "❌ فایل ABI وجود ندارد!"
fi

echo ""
echo "========================================="
echo "🏁 تشخیص کامل شد"
