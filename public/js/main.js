// Business CRM Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const logoutBtn = document.getElementById('logout-btn');
  const addCustomerBtn = document.getElementById('add-customer-btn');
  const customerModal = document.getElementById('customer-modal');
  const closeModal = document.querySelector('.close');
  const closeModals = document.querySelectorAll('.close-modal');
  const customerForm = document.getElementById('customer-form');
  const customersTableBody = document.getElementById('customers-table-body');
  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('filter-select');
  
  // Navigation
  const navLinks = document.querySelectorAll('.nav-menu a');
  const sections = document.querySelectorAll('.section');
  
  // Set up navigation
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get target section
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if(targetSection) {
        // Hide all sections
        sections.forEach(section => {
          section.classList.remove('active');
        });
        
        // Show target section
        targetSection.classList.add('active');
      }
    });
  });
  
  // Open modal for adding customer
  addCustomerBtn.addEventListener('click', function() {
    document.getElementById('modal-title').textContent = 'Add Customer';
    customerForm.reset();
    document.getElementById('customer-form').dataset.customerId = '';
    customerModal.style.display = 'block';
  });
  
  // Close modal
  closeModal.addEventListener('click', function() {
    customerModal.style.display = 'none';
  });
  
  closeModals.forEach(btn => {
    btn.addEventListener('click', function() {
      customerModal.style.display = 'none';
    });
  });
  
  // Close modal if clicked outside content
  window.addEventListener('click', function(e) {
    if (e.target === customerModal) {
      customerModal.style.display = 'none';
    }
  });
  
  // Form submission
  customerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const customerId = this.dataset.customerId;
    const method = customerId ? 'PUT' : 'POST';
    const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      company: document.getElementById('company').value,
      notes: document.getElementById('notes').value
    };
    
    try {
      const token = localStorage.getItem('token');
      if(!token) {
        alert('No token found, please log in again.');
        window.location.href = 'login.html';
        return;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
      
      if(response.ok) {
        customerModal.style.display = 'none';
        loadCustomers(); // Refresh customer list
        customerForm.reset();
      } else {
        const data = await response.json();
        alert(data.msg || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the customer');
    }
  });
  
  // Load customers
  async function loadCustomers() {
    try {
      const token = localStorage.getItem('token');
      if(!token) {
        alert('No token found, please log in again.');
        window.location.href = 'login.html';
        return;
      }
      
      const response = await fetch('/api/customers', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if(response.ok) {
        const customers = await response.json();
        displayCustomers(customers);
      } else {
        const data = await response.json();
        alert(data.msg || 'An error occurred while loading customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }
  
  // Display customers in table
  function displayCustomers(customers) {
    customersTableBody.innerHTML = '';
    
    customers.forEach(customer => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone || ''}</td>
        <td>${customer.company || ''}</td>
        <td>${new Date(customer.date).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary edit-customer" data-id="${customer._id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger delete-customer" data-id="${customer._id}"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      
      customersTableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-customer').forEach(button => {
      button.addEventListener('click', function() {
        const customerId = this.getAttribute('data-id');
        openEditCustomerModal(customerId);
      });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-customer').forEach(button => {
      button.addEventListener('click', function() {
        const customerId = this.getAttribute('data-id');
        deleteCustomer(customerId);
      });
    });
  }
  
  // Open edit customer modal
  async function openEditCustomerModal(customerId) {
    try {
      const token = localStorage.getItem('token');
      if(!token) {
        alert('No token found, please log in again.');
        window.location.href = 'login.html';
        return;
      }
      
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if(response.ok) {
        const customer = await response.json();
        
        document.getElementById('name').value = customer.name;
        document.getElementById('email').value = customer.email;
        document.getElementById('phone').value = customer.phone || '';
        document.getElementById('company').value = customer.company || '';
        document.getElementById('notes').value = customer.notes || '';
        
        document.getElementById('modal-title').textContent = 'Edit Customer';
        document.getElementById('customer-form').dataset.customerId = customer._id;
        customerModal.style.display = 'block';
      } else {
        const data = await response.json();
        alert(data.msg || 'An error occurred');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }
  
  // Delete customer
  async function deleteCustomer(customerId) {
    if(!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if(!token) {
        alert('No token found, please log in again.');
        window.location.href = 'login.html';
        return;
      }
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      
      if(response.ok) {
        loadCustomers(); // Refresh customer list
      } else {
        const data = await response.json();
        alert(data.msg || 'An error occurred');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  }
  
  // Search functionality
  searchInput.addEventListener('input', function() {
    filterCustomers();
  });
  
  filterSelect.addEventListener('change', function() {
    filterCustomers();
  });
  
  // Filter customers based on search and filter
  function filterCustomers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    
    const customerRows = document.querySelectorAll('#customers-table-body tr');
    
    customerRows.forEach(row => {
      const name = row.cells[0].textContent.toLowerCase();
      const email = row.cells[1].textContent.toLowerCase();
      const company = row.cells[3].textContent.toLowerCase();
      
      let showRow = false;
      
      switch(filterValue) {
        case 'company':
          showRow = company.includes(searchTerm);
          break;
        default:
          showRow = name.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm);
      }
      
      row.style.display = showRow ? '' : 'none';
    });
  }
  
  // Logout functionality
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Load customers when page loads
  loadCustomers();
});