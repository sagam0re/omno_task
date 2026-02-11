@echo off
echo Creating transaction with card 4111 (3DS Required)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 1000, \"currency\": \"EUR\", \"orderId\": \"ord_123\", \"cardNumber\": \"4111111111111111\", \"cardExpiry\": \"12/30\", \"cvv\": \"123\"}"
echo.
echo.

echo Creating transaction with card 5555 (Success)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 2000, \"currency\": \"USD\", \"orderId\": \"ord_124\", \"cardNumber\": \"5555111111111111\", \"cardExpiry\": \"12/26\", \"cvv\": \"124\"}"
echo.
echo.

echo Creating transaction with card 4000 (Failed)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 3000, \"currency\": \"GBP\", \"orderId\": \"ord_125\", \"cardNumber\": \"4000000000000002\", \"cardExpiry\": \"12/26\", \"cvv\": \"125\"}"
echo.
echo.

echo Creating transaction with card 4000 (Validation Error CVV)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 3000, \"currency\": \"GBP\", \"orderId\": \"ord_125\", \"cardNumber\": \"4000000000000002\", \"cardExpiry\": \"12/26\", \"cvv\": \"12585\"}"
echo.
echo.

echo Creating transaction with card 4000 (Validation Error Currency)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 3000, \"currency\": \"GBP1\", \"orderId\": \"ord_125\", \"cardNumber\": \"4000000000000002\", \"cardExpiry\": \"12/26\", \"cvv\": \"12585\"}"
echo.
echo.

echo Creating transaction with card 4000 (Validation Error CardNumber)...
curl -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d "{\"amount\": 3000, \"currency\": \"GBP1\", \"orderId\": \"ord_125\", \"cardNumber\": \"4000000000000001\", \"cardExpiry\": \"12/26\", \"cvv\": \"12585\"}"
echo.
echo.
pause
