#!/bin/bash

# NL Query Parser 테스트 헬퍼 스크립트
#
# 사용법:
#   ./test-nl-parser.sh                 # 전체 테스트 (50개)
#   ./test-nl-parser.sh 1               # 개별 테스트 (Test 1)
#   ./test-nl-parser.sh examples        # 예시 실행 (10개)
#   ./test-nl-parser.sh examples 3      # 특정 예시 (Example 3)

if [ "$1" == "examples" ]; then
  # 예시 실행
  if [ -n "$2" ]; then
    echo "예시 $2 실행 중 (AI 모드)..."
    npx dotenv -e .env.local -- npx tsx src/lib/examples/nl-query-examples.ts "$2"
  else
    echo "전체 예시 실행 중 (AI 모드)..."
    npx dotenv -e .env.local -- npx tsx src/lib/examples/nl-query-examples.ts
  fi
elif [ -n "$1" ]; then
  # 개별 테스트
  echo "Test $1 실행 중 (AI 모드)..."
  npx dotenv -e .env.local -- npx tsx src/lib/__tests__/nl-query-parser.test.ts --single "$1"
else
  # 전체 테스트
  echo "전체 테스트 (50개) 실행 중 (AI 모드)..."
  npx dotenv -e .env.local -- npx tsx src/lib/__tests__/nl-query-parser.test.ts
fi
