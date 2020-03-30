package main

func main() {
	cards := newDeckFromFile("my-cards")
	cards.shuffle()
	cards.print()
}
