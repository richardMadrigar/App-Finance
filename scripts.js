//  Adicionar/Remove a class active do modal 
const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active') //abrir modal 
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active') //fechar modal
  }
}

//Guardar no chrome
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


//calculo:  total/Saidas/Entradas
const Transaction = {

  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}


//Manipulando a DOM
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')// criando um elemento tr e colocando na const tr
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) //atribuindo a function innerHTML() para tr
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense" // const para atribuir o numero em red/green

    const amount = Utils.formatCurrency(transaction.amount)

    const html =
      `
      <td class="description"> ${transaction.description} </td>
      <td class=" ${CSSclass}"> ${amount}</td>
      <td class="date"> ${transaction.date} </td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `
    return html
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}


// formatando o Number para BR 
const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100
    return value
  },
  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "" // atribuindo valor o sinal de - em numero que vier negativo

    value = String(value).replace(/\D/g, "") //format para BR
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value; //jogado pra fora da function
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFileds() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },
  clearFilds() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFileds()  //verificar se os campos estão validos
      const transaction = Form.formatValues()   // formatar os dados para salvar 
      Transaction.add(transaction) //add transação
      Form.clearFilds() //limpar restos do formulario
      Modal.close()  //fechar modal
    } catch (error) {
      alert(error.message)
    }
  }
}



//inicialização do app e recarregar o ap
const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction) //loop para aparecer as transaçoes na tela

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()
