document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      // Load content when tab is clicked
      if (tabId === 'books') loadBooks();
      if (tabId === 'members') loadMembers();
    });
  });
  
  // Book management
  const bookModal = document.getElementById('bookModal');
  const addBookBtn = document.getElementById('addBookBtn');
  const closeBookModal = document.querySelector('#bookModal .close');
  
  addBookBtn.addEventListener('click', () => {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    loadLibrariesForSelect();
    bookModal.style.display = 'block';
  });
  
  closeBookModal.addEventListener('click', () => {
    bookModal.style.display = 'none';
  });
  
  // Member management
  const memberModal = document.getElementById('memberModal');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const closeMemberModal = document.querySelector('#memberModal .close');
  
  addMemberBtn.addEventListener('click', () => {
    document.getElementById('memberModalTitle').textContent = 'Add New Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    loadDepartmentsForSelect();
    memberModal.style.display = 'block';
  });
  
  closeMemberModal.addEventListener('click', () => {
    memberModal.style.display = 'none';
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === bookModal) bookModal.style.display = 'none';
    if (e.target === memberModal) memberModal.style.display = 'none';
  });
  
  // Load initial data
  loadBooks();
  loadLibrariesForSelect();
  loadDepartmentsForSelect();
  
  // Book form submission
  document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const library = document.getElementById('library').value;
    
    const bookData = {
      Bname: title,
      Price: price,
      Lid: library
    };
    
    try {
      if (id) {
        // Update existing book
        await fetch(`/api/books/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });
      } else {
        // Add new book
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });
      }
      
      bookModal.style.display = 'none';
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    }
  });
  
  // Member form submission
  document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Member form submission would be handled here');
    memberModal.style.display = 'none';
  });
  
  // Search functionality
  document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('bookSearch').value;
    loadBooks(searchTerm);
  });
});

// Load books from API
async function loadBooks(searchTerm = '') {
  try {
    const url = searchTerm 
      ? `/api/books?search=${encodeURIComponent(searchTerm)}`
      : '/api/books';
    
    const response = await fetch(url);
    const books = await response.json();
    
    const tbody = document.querySelector('#booksTable tbody');
    tbody.innerHTML = '';
    
    books.forEach(book => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${book.Bid}</td>
        <td>${book.Bname}</td>
        <td>${book.Price}</td>
        <td>${book.Library || 'N/A'}</td>
        <td>
          <button class="edit-btn" data-id="${book.Bid}">Edit</button>
          <button class="delete-btn" data-id="${book.Bid}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookId = e.target.getAttribute('data-id');
        const response = await fetch(`/api/books/${bookId}`);
        const book = await response.json();
        
        document.getElementById('bookModalTitle').textContent = 'Edit Book';
        document.getElementById('bookId').value = book.Bid;
        document.getElementById('title').value = book.Bname;
        document.getElementById('price').value = book.Price;
        document.getElementById('library').value = book.Lid;
        
        document.getElementById('bookModal').style.display = 'block';
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this book?')) {
          const bookId = e.target.getAttribute('data-id');
          await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
          loadBooks();
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading books:', error);
    alert('Failed to load books');
  }
}

// Load members from API
async function loadMembers() {
  try {
    const response = await fetch('/api/members');
    const members = await response.json();
    
    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = '';
    
    members.forEach(member => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${member.id}</td>
        <td>${member.name}</td>
        <td>${member.email || 'N/A'}</td>
        <td>${member.type}</td>
        <td>${member.department}</td>
        <td>${member.library}</td>
        <td>
          <button class="edit-btn" data-id="${member.id}">Edit</button>
          <button class="delete-btn" data-id="${member.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('#membersTable .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const memberId = e.target.getAttribute('data-id');
        editMember(memberId);
      });
    });
    
    document.querySelectorAll('#membersTable .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const memberId = e.target.getAttribute('data-id');
        deleteMember(memberId);
      });
    });
    
  } catch (error) {
    console.error('Error loading members:', error);
    alert('Failed to load members');
  }
}

// Load libraries for select dropdown
async function loadLibrariesForSelect() {
  try {
    const response = await fetch('/api/libraries');
    const libraries = await response.json();
    const select = document.getElementById('library');
    select.innerHTML = '<option value="">Select Library</option>';
    
    libraries.forEach(lib => {
      const option = document.createElement('option');
      option.value = lib.Lid;
      option.textContent = lib.Lname;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading libraries:', error);
  }
}

// Load departments for select dropdown
async function loadDepartmentsForSelect() {
  try {
    const response = await fetch('/api/departments');
    const depts = await response.json();
    const select = document.getElementById('memberDept');
    select.innerHTML = '<option value="">Select Department</option>';
    
    depts.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.Deptid;
      option.textContent = dept.Deptname;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading departments:', error);
  }
}

// Edit member (placeholder)
async function editMember(memberId) {
  try {
    const response = await fetch(`/api/members/${memberId}`);
    const member = await response.json();
    
    document.getElementById('memberModalTitle').textContent = 'Edit Member';
    document.getElementById('memberId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberEmail').value = member.email || '';
    document.getElementById('memberType').value = member.type;
    
    // Need to load departments first to set the correct value
    await loadDepartmentsForSelect();
    document.getElementById('memberDept').value = member.Deptid || '';
    
    document.getElementById('memberModal').style.display = 'block';
  } catch (error) {
    console.error('Error editing member:', error);
    alert('Failed to load member details');
  }
}

// Delete member (placeholder)
async function deleteMember(memberId) {
  if (confirm('Are you sure you want to delete this member?')) {
    try {
      await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  }
}