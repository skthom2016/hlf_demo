echo "=========================="
echo "Setting env"
echo "=========================="
. ./setenv.sh

echo "=========================="
echo "Bringing down the containers using docker compose"
echo "=========================="
docker-compose -f ./docker-compose-app.yaml down 

echo "=========================="
echo "Cleaning env"
echo "=========================="
./clean.sh

