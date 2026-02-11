@echo off
echo Creating transaction with card 4111 (3DS Required)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 1000, \"currency\": \"EUR\", \"orderId\": \"ord_123\", \"cardNumber\": \"4111000000000001\", \"cardExpiry\": \"12/25\", \"cvv\": \"123\"}"
echo.
echo.

echo Creating transaction with card 5555 (Success)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 2000, \"currency\": \"USD\", \"orderId\": \"ord_124\", \"cardNumber\": \"5555000000000002\", \"cardExpiry\": \"12/26\", \"cvv\": \"124\"}"
echo.
echo.

echo Creating transaction with card 4000 (Failed)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 3000, \"currency\": \"GBP\", \"orderId\": \"ord_125\", \"cardNumber\": \"4000000000000003\", \"cardExpiry\": \"12/26\", \"cvv\": \"125\"}"
echo.
echo.
pause
