#!/bin/bash
echo "========================================"
echo "Starting Deployment Verification"
echo "========================================"

echo ""
echo ">>> Running Backend Tests..."
cd Server
# Check if dependencies installed, if not install (optional, but good for CI)
if [ ! -d "node_modules" ]; then
    npm install
fi
npm test
BACKEND_STATUS=$?
cd ..

if [ $BACKEND_STATUS -ne 0 ]; then
    echo ">>> ❌ Backend Tests FAILED"
    exit 1
else
    echo ">>> ✅ Backend Tests PASSED"
fi

echo ""
echo ">>> Running Frontend Tests..."
cd Client
if [ ! -d "node_modules" ]; then
    npm install
fi

# CI=true ensures Vitest runs once and exits
CI=true npm test
FRONTEND_STATUS=$?
cd ..

if [ $FRONTEND_STATUS -ne 0 ]; then
    echo ">>> ❌ Frontend Tests FAILED"
    exit 1
else
    echo ">>> ✅ Frontend Tests PASSED"
fi

echo ""
echo "========================================"
echo "✅ All Tests Passed - Ready for Deploy"
echo "========================================"
exit 0
