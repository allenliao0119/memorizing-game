const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [ 
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', 
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
] //黑桃、紅心、方塊、梅花

const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent(index){
    const number = this.transformNumber(index % 13 + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="symbol">
      <p>${number}</p>
      `
  },
  transformNumber(number) {
    switch (number) {
      case 1: 
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const cards = document.querySelector('#cards')
    cards.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.forEach(card => {
      if (card.matches('.back')) { // 卡片背面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index)) // 翻回正面
      }
      else { // 卡片正面
        card.classList.add('back') // 翻回背面
        card.innerHTML = null
      }
    })
  },
  pairedCards(...cards) {
    cards.forEach(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  renderTriedTime(tried) {
    document.querySelector('.tried').innerHTML = `You've tried ${tried} times.`
  },
  appendWrongAnimations(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', function onCardAnimationEnd(event) {
        event.target.classList.remove('wrong'), {once: true}
      })
    })
  },
  gameFinished(tried) {
    const completed = document.querySelector('.completed')
    completed.classList.remove('hide')
    completed.innerHTML = `
      <p>completed!</p>
      <p>score: 260</p>
      <p>You've tried ${tried} times.</p>
      `
    console.log('here')
  }
}

const model = {
  revealedCard: [],
  score: 0,
  tried: 0,
  isRevealedCardMatched () {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.matches('.back')) {
      return
    }
    
    switch (this.currentState) {

      case GAME_STATE.FirstCardAwaits: // 狀態：等待翻第一張牌\
        view.flipCards(card)
        model.revealedCard.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits: // 狀態：等待翻第二張牌
        view.flipCards(card)
        model.revealedCard.push(card)
        if (model.isRevealedCardMatched()) { 
          this.currentState = GAME_STATE.CardsMatched // 狀態：配對成功
          view.pairedCards(...model.revealedCard)
          view.renderScore(model.score += 10)
          view.renderTriedTime(++model.tried)

          if (model.score === 260) { // 狀態：遊戲結束
            this.currentState = GAME_STATE.GameFinished
            view.gameFinished(model.tried)
            return
          }

          model.revealedCard = []
          this.currentState = GAME_STATE.FirstCardAwaits
          
        } 
        else { // 狀態：配對失敗
          view.renderTriedTime(++model.tried)
          view.appendWrongAnimations(...model.revealedCard)
          setTimeout(this.resetCards,1000)
          this.currentState = GAME_STATE.FirstCardAwaits
        }
        break
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCard)
    model.revealedCard = []
    this.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length -1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

document.querySelector('#cards').addEventListener('click', function onCardsClicked(event) {
  const target = event.target
  if (target.matches('.card')) {
    console.log(target)
    controller.dispatchCardAction(target)
  }
})