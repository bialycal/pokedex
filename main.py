import requests

url = "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=100"

response = requests.get(url)
data = response.json()

print(data)
