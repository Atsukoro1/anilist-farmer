package main

import (
	"anilistbot/client"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatal("Unable to load dotenv file!")
	}

	var client client.ClientStr
	client.Init()

	client.Authorize(os.Getenv("TOKEN"))

	client.FetchGlobal()
}
