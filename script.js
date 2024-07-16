document.addEventListener('DOMContentLoaded', () => {
  const customerTableBody = document.querySelector('#customerTable tbody');
  const searchNameInput = document.getElementById('searchName');
  const searchAmountInput = document.getElementById('searchAmount');
  const ctx = document.getElementById('transactionGraph').getContext('2d');
  let customers = [];
  let transactions = [];
  let chart;

  async function fetchData() {
    try {
      const customerResponse = await fetch("http://localhost:3000/customers");
      customers = await customerResponse.json();
      const transactionResponse = await fetch("http://localhost:3000/transactions");
      transactions = await transactionResponse.json();
      renderTable();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function renderTable() {
    customerTableBody.innerHTML = '';
    transactions.forEach(transaction => {
      const customer = customers.find(c => c.id === transaction.customer_id);
      if (customer) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${customer.name}</td>
          <td>${transaction.date}</td>
          <td>${transaction.amount}</td>
        `;
        customerTableBody.appendChild(row);
      } else {
        console.error(`Customer not found for transaction ID: ${transaction.id}`);
      }
    });
  }

  function filterTable() {
    const searchName = searchNameInput.value.toLowerCase();
    const searchAmount = parseFloat(searchAmountInput.value);
    customerTableBody.innerHTML = '';

    transactions.forEach(transaction => {
      const customer = customers.find(c => c.id === transaction.customer_id);
      if (customer) {
        const matchesName = customer.name.toLowerCase().includes(searchName);
        const matchesAmount = isNaN(searchAmount) || transaction.amount >= searchAmount;
        if (matchesName && matchesAmount) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
          `;
          customerTableBody.appendChild(row);
        }
      }
    });
  }

  searchNameInput.addEventListener('input', filterTable);
  searchAmountInput.addEventListener('input', filterTable);

  function renderGraph(customerId) {
    const customerTransactions = transactions.filter(t => t.customer_id === customerId);
    const dates = customerTransactions.map(t => t.date);
    const amounts = customerTransactions.map(t => t.amount);

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Transaction Amount',
          data: amounts,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  customerTableBody.addEventListener('click', (event) => {
    const row = event.target.closest('tr');
    if (row) {
      const customerName = row.cells[0].textContent;
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        renderGraph(customer.id);
      }
    }
  });

  fetchData();
});
