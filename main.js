const $ = document.querySelector.bind(document)
const random = (min, max) => Math.floor(Math.random() * (max - min) + min)
const sleep = ms => new Promise (res => setTimeout(res, ms))

const view = {
    banner: $`#Banner`,
    display: $`#Buttons`,
    buttons: [...$`#Buttons`.children],
    wins: $`#Wins`,
    losses: $`#Losses`,
    restart: $`#Restart`,
}

const turns = {
    PLAYER: 0,
    COMPUTER: 1
}

const background = new class Background {
    #interval = setInterval(this.update, 8000)

    flash (color, duration=500) {
        clearInterval(this.#interval)
    
        const bg = document.body.style.backgroundColor
        document.body.style.backgroundColor = color
        document.body.style.setProperty('--transition-length', '500ms')
        
        setTimeout(() => {
            document.body.style.backgroundColor = bg
            setTimeout(() => {
                document.body.style.setProperty('--transition-length', '8s')
                this.update()
                this.#interval = setInterval(this.update, 8000)
            }, 1500)
        }, duration)
    }

    update () {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
        const
            hue = Math.random(),
            sat = 70,
            lit = isDark ? 35 : 60
    
        document.body.style.backgroundColor = `hsl(${hue}turn, ${sat}%, ${lit}%)`
    }
}

class Board {
    #state
    #size = 3
    #turn = Math.round(Math.random())
    #turns = 0

    constructor () {
        this.#state = Array.from(Array(3), () => Array(3).fill(''))

        view.banner.classList.add(this.#turn == turns.PLAYER ? 'player' : 'computer')
        view.buttons.forEach((button, i) => { button.onclick = () => this.playerTurn(button, i) })
        view.restart.onclick = () => this.#win()

        this.#takeTurn()
    }

    #updateCell (index, value) {
        this.#state[~~(index / this.#size)][index % this.#size] = value
    }

    #checkWin (symbol) {
        const x = this.#state
        return (
            symbol == x[0][0] && x[0][0] === x[0][1] && x[0][1] === x[0][2] ||
            symbol == x[1][0] && x[1][0] === x[1][1] && x[1][1] === x[1][2] ||
            symbol == x[2][0] && x[2][0] === x[2][1] && x[2][1] === x[2][2] ||

            symbol == x[0][0] && x[0][0] === x[1][0] && x[1][0] === x[2][0] ||
            symbol == x[0][1] && x[0][1] === x[1][1] && x[1][1] === x[2][1] ||
            symbol == x[0][2] && x[0][2] === x[1][2] && x[1][2] === x[2][2] ||

            symbol == x[0][0] && x[0][0] === x[1][1] && x[1][1] === x[2][2] ||
            symbol == x[0][2] && x[0][2] === x[1][1] && x[1][1] === x[2][0]
        )
    }

    async #win (winner) {
        view.buttons.forEach(button => button.disabled = true)

        if (winner === turns.COMPUTER) {
            background.flash('red')
            view.losses.innerText = +view.wins.innerText + 1
        } else if (winner === turns.PLAYER) {
            background.flash('green')
            view.wins.innerText = +view.wins.innerText + 1
        } else {
            background.flash('gray', 750)
        }

        view.buttons.forEach(button => {
            button.disabled = false
            button.innerText = ''
        })
        this.#turns = 0
        this.#state = Array.from(Array(3), () => Array(3).fill(''))

        this.#takeTurn()
    }

    #takeTurn () {
        this.#turns++
        
        if (this.#checkWin('X'))
            return this.#win(turns.COMPUTER)

        else if (this.#checkWin('O'))
            return this.#win(turns.PLAYER)

        else if (view.buttons.every(button => button.disabled))
            return this.#win()

        this.#turn = 1 - this.#turn
        view.banner.classList.toggle('computer')
        view.banner.classList.toggle('player')

        if (this.#turn == turns.COMPUTER) this.#computerTurn()
    }

    async #computerTurn () {
        await sleep(random(250, 450) * Math.sqrt(Math.pow(this.#turns, 1.7)))

        const options = view.buttons.filter(button => !button.disabled)
        const button = options[random(0, options.length)]
        this.#updateCell(view.buttons.indexOf(button), 'X')
        button.disabled = true
        button.innerText = 'X'

        this.#takeTurn()
    }

    playerTurn (button, index) {
        button.disabled = true
        button.innerText = 'O'
        this.#updateCell(index, 'O')
        this.#takeTurn()
    }
}

onload = () => {
    background.update()
    let board = new Board()
}