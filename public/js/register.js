// Register Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  
  if(registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      
      if(password !== password2) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if(response.ok) {
          // Save token to localStorage
          localStorage.setItem('token', data.token);
          
          // Redirect to dashboard
          window.location.href = '/';
        } else {
          alert(data.msg || 'Registration failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
      }
    });
  }
});